from flask import Blueprint, request, jsonify
from datetime import date, datetime, time, timedelta, timezone
from sqlalchemy import func, desc, and_
from sqlalchemy.orm import joinedload
from server.app.extensions import db
from server.app.models.orders import Order
from server.app.models.order_items import OrderItem
from server.app.models.product import Product
from server.app.models.users import User
from server.app.models.invoice import Invoice
from server.app.models.category import Category
from server.app.models.carts import Cart
from server.app.models.enums import OrderStatus, PaymentStatus
from flask_jwt_extended import jwt_required
from server.app.decorators import admin_required
import logging

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')
logging.basicConfig(level=logging.INFO)


@analytics_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@admin_required()
def dashboard_overview():
    """Get high-level dashboard metrics including recent orders."""
    try:
        # Total revenue (from paid orders)
        total_sales = db.session.query(func.sum(Order.total_amount))\
            .filter(Order.status == OrderStatus.paid).scalar() or 0
        
        # Orders today
        today_start = datetime.combine(date.today(), time.min)
        today_end = datetime.combine(date.today(), time.max)
        orders_today = Order.query.filter(Order.created_at.between(today_start, today_end)).count()

        # Active customers (users who have placed at least one order)
        active_customers = db.session.query(func.count(User.id.distinct()))\
            .join(Cart, User.id == Cart.user_id)\
            .join(Order, Cart.id == Order.cart_id).scalar() or 0

        # Top selling product by quantity
        top_product_query = db.session.query(
            Product.product_name,
            func.sum(OrderItem.quantity).label('total_quantity')
        ).join(OrderItem, Product.id == OrderItem.product_id)\
         .group_by(Product.product_name)\
         .order_by(desc('total_quantity'))\
         .first()
        
        top_product = top_product_query.product_name if top_product_query else "N/A"

        # Recent Orders
        recent_orders = Order.query\
            .join(Cart, Order.cart_id == Cart.id)\
            .outerjoin(User, Cart.user_id == User.id)\
            .order_by(Order.created_at.desc())\
            .limit(5).all()

        recent_orders_data = []
        for order in recent_orders:
            customer_name = "Guest"
            if order.cart and order.cart.user:
                customer_name = f"{order.cart.user.first_name} {order.cart.user.last_name}"
            
            recent_orders_data.append({
                'id': str(order.id),
                'customer_name': customer_name,
                'status': order.status.value,
                'total': float(order.total_amount)
            })

        return jsonify({
            'total_sales': float(total_sales),
            'orders_today': orders_today,
            'active_customers': active_customers,
            'top_product': top_product,
            'recent_orders': recent_orders_data
        }), 200

    except Exception as e:
        logging.error(f"Error in dashboard_overview: {e}", exc_info=True)
        return jsonify({'error': "An internal error occurred"}), 500

@analytics_bp.route('/financial', methods=['GET'])
@jwt_required()
@admin_required()
def financial_analytics():
    """Get financial analytics including payment status"""
    try:
        # Revenue by payment status
        payment_status_revenue = db.session.query(
            Invoice.payment_status,
            func.sum(Invoice.amount).label('total_amount'),
            func.count(Invoice.id).label('count')
        ).group_by(Invoice.payment_status).all()
        # Monthly revenue trend (last 12 months)
        twelve_months_ago = datetime.now(timezone.utc) - timedelta(days=365)
        monthly_revenue = db.session.query(
            func.strftime('%Y-%m', Order.created_at).label('month'),
            func.sum(Order.total_amount).label('revenue')
        ).filter(
            and_(Order.created_at >= twelve_months_ago, Order.status == OrderStatus.paid)
        ).group_by(func.strftime('%Y-%m', Order.created_at))\
         .order_by('month').all()
        # Outstanding invoices
        outstanding_amount = db.session.query(func.sum(Invoice.amount))\
            .filter(Invoice.payment_status == PaymentStatus.pending).scalar() or 0
        return jsonify({
            'payment_status_breakdown': [
                {
                    'status': status.payment_status.value,
                    'total_amount': float(status.total_amount or 0),
                    'count': status.count
                } for status in payment_status_revenue
            ],
            'monthly_revenue_trend': [
                {
                    'month': month.month,
                    'revenue': float(month.revenue or 0)
                } for month in monthly_revenue
            ],
            'outstanding_invoices_amount': float(outstanding_amount)
        }), 200
    except Exception as e:
        logging.error(f"Error in financial_analytics: {e}")
        return jsonify({'error': str(e)}), 500
    
    