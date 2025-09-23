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

# Configure logging
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

@analytics_bp.route('/sales', methods=['GET'])
@jwt_required()
@admin_required()
def sales_analytics():
    """Get sales analytics with optional date filtering"""
    try:
        # Get query parameters
        days = request.args.get('days', 30, type=int)  # Default last 30 days
        # Calculate date range
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)
        # Daily sales data
        daily_sales = db.session.query(
            func.date(Order.created_at).label('date'),
            func.sum(Order.total_amount).label('revenue'),
            func.count(Order.id).label('order_count')
        ).filter(
            and_(Order.created_at >= start_date, Order.status == OrderStatus.paid)
        ).group_by(func.date(Order.created_at)).order_by('date').all()
        # Total revenue for period
        period_revenue = db.session.query(func.sum(Order.total_amount))\
            .filter(and_(
                Order.created_at >= start_date,
                Order.status == OrderStatus.paid
            )).scalar() or 0
        # Order status breakdown
        status_breakdown = db.session.query(
            Order.status,
            func.count(Order.id).label('count')
        ).filter(Order.created_at >= start_date)\
           .group_by(Order.status).all()
        return jsonify({
            'period_days': days,
            'period_revenue': float(period_revenue),
            'daily_sales': [
                {
                    'date': day.date.strftime('%Y-%m-%d') if day.date else None,
                    'revenue': float(day.revenue or 0),
                    'order_count': day.order_count
                } for day in daily_sales
            ],
            'order_status_breakdown': [
                {
                    'status': status.status.value,
                    'count': status.count
                } for status in status_breakdown
            ]
        }), 200
    except Exception as e:
        logging.error(f"Error in sales_analytics: {e}")
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/products', methods=['GET'])
@jwt_required()
@admin_required()
def product_analytics():
    """Get product performance analytics"""
    try:
        limit = request.args.get('limit', 10, type=int)
        # Best selling products by quantity
        best_sellers_qty = db.session.query(
            Product.product_name,
            Product.id,
            func.sum(OrderItem.quantity).label('total_quantity'),
            func.sum(OrderItem.sub_total).label('total_revenue')
        ).join(OrderItem, Product.id == OrderItem.product_id)\
           .join(Order, OrderItem.order_id == Order.id)\
           .filter(Order.status == OrderStatus.paid)\
           .group_by(Product.id, Product.product_name)\
           .order_by(desc('total_quantity'))\
           .limit(limit).all()
        # Best selling products by revenue
        best_sellers_revenue = db.session.query(
            Product.product_name,
            Product.id,
            func.sum(OrderItem.sub_total).label('total_revenue'),
            func.sum(OrderItem.quantity).label('total_quantity')
        ).join(OrderItem, Product.id == OrderItem.product_id)\
           .join(Order, OrderItem.order_id == Order.id)\
           .filter(Order.status == OrderStatus.paid)\
           .group_by(Product.id, Product.product_name)\
           .order_by(desc('total_revenue'))\
           .limit(limit).all()
        # Low stock products
        low_stock = Product.query.filter(Product.stock_qty < 10)\
                                 .order_by(Product.stock_qty).limit(limit).all()
        # Products by category performance
        category_performance = db.session.query(
            Category.category_name,
            func.sum(OrderItem.sub_total).label('revenue'),
            func.sum(OrderItem.quantity).label('quantity_sold')
        ).join(Product, Category.id == Product.category_id)\
           .join(OrderItem, Product.id == OrderItem.product_id)\
           .join(Order, OrderItem.order_id == Order.id)\
           .filter(Order.status == OrderStatus.paid)\
           .group_by(Category.id, Category.category_name)\
           .order_by(desc('revenue')).all()
        return jsonify({
            'best_sellers_by_quantity': [
                {
                    'product_name': item.product_name,
                    'product_id': str(item.id),
                    'total_quantity': int(item.total_quantity),
                    'total_revenue': float(item.total_revenue or 0)
                } for item in best_sellers_qty
            ],
            'best_sellers_by_revenue': [
                {
                    'product_name': item.product_name,
                    'product_id': str(item.id),
                    'total_revenue': float(item.total_revenue or 0),
                    'total_quantity': int(item.total_quantity)
                } for item in best_sellers_revenue
            ],
            'low_stock_products': [
                {
                    'product_name': product.product_name,
                    'product_id': str(product.id),
                    'stock_qty': product.stock_qty,
                    'price': float(product.price)
                } for product in low_stock
            ],
            'category_performance': [
                {
                    'category_name': cat.category_name,
                    'revenue': float(cat.revenue or 0),
                    'quantity_sold': int(cat.quantity_sold)
                } for cat in category_performance
            ]
        }), 200
    except Exception as e:
        logging.error(f"Error in product_analytics: {e}")
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/customers', methods=['GET'])
@jwt_required()
@admin_required()
def customer_analytics():
    """Get customer analytics"""
    try:
        logging.info("Starting customer_analytics function")
        days = request.args.get('days', 30, type=int)
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)
        logging.info(f"Date range: {start_date} to {end_date}")
        
        # New customers in period
        new_customers = User.query.filter(User.created_at >= start_date).count()
        logging.info(f"New customers: {new_customers}")
        
        # Customer registrations over time
        daily_registrations = db.session.query(
            func.date(User.created_at).label('date'),
            func.count(User.id).label('registrations')
        ).filter(User.created_at >= start_date)\
           .group_by(func.date(User.created_at))\
           .order_by('date').all()
        logging.info(f"Daily registrations: {daily_registrations}")
        
        # Top customers by total spent
        logging.info("Querying for top customers")
        top_customers = (
            db.session.query(
                User.first_name,
                User.last_name,
                User.email,
                func.sum(Order.total_amount).label('total_spent'),
                func.count(Order.id).label('order_count')
            )
            .join(Cart, Cart.user_id == User.id)
            .join(Order, Order.cart_id == Cart.id)
            .filter(Order.status == OrderStatus.paid)
            .group_by(User.id, User.first_name, User.last_name, User.email)
            .order_by(desc('total_spent'))
            .limit(10)
            .all()
        )
        logging.info(f"Top customers found: {len(top_customers)}")
        
        # Active customers in the period
        logging.info("Querying for active customers")
        active_customers = (
            db.session.query(func.count(func.distinct(User.id)))
            .join(Cart, Cart.user_id == User.id)
            .join(Order, Order.cart_id == Cart.id)
            .filter(Order.created_at >= start_date)
            .scalar() or 0
        )
        logging.info(f"Active customers: {active_customers}")
        
        logging.info("Preparing JSON response")
        response_data = {
            'period_days': days,
            'new_customers': new_customers,
            'active_customers': active_customers,
            'daily_registrations': [
                {
                    'date': reg.date,
                    'registrations': reg.registrations
                } for reg in daily_registrations
            ],
            'top_customers': [
                {
                    'name': f"{customer.first_name} {customer.last_name}",
                    'email': customer.email,
                    'total_spent': float(customer.total_spent or 0),
                    'order_count': customer.order_count
                } for customer in top_customers
            ]
        }
        logging.info("Successfully prepared response data")
        return jsonify(response_data), 200
        
    except Exception as e:
        logging.error(f"Error in customer_analytics: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500