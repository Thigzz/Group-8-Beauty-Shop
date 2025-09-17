from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from sqlalchemy import func, desc, and_
from sqlalchemy.orm import joinedload
from app.extensions import db
from app.models.orders import Order
from app.models.order_items import OrderItem
from app.models.product import Product
from app.models.users import User
from app.models.invoice import Invoice
from app.models.category import Category
from app.models.enums import OrderStatus, PaymentStatus

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

@analytics_bp.route('/dashboard', methods=['GET'])
def dashboard_overview():
    """Get high-level dashboard metrics"""
    try:
        # Total revenue (from paid orders)
        total_revenue = db.session.query(func.sum(Order.total_amount))\
            .filter(Order.status == OrderStatus.paid).scalar() or 0
        
        # Total orders
        total_orders = Order.query.count()
        
        # Total customers
        total_customers = User.query.count()
        
        # Total products
        total_products = Product.query.count()
        
        # Recent orders (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_orders = Order.query.filter(Order.created_at >= thirty_days_ago).count()
        
        # Average order value
        avg_order_value = db.session.query(func.avg(Order.total_amount))\
            .filter(Order.status == OrderStatus.paid).scalar() or 0
        
        return jsonify({
            'total_revenue': float(total_revenue),
            'total_orders': total_orders,
            'total_customers': total_customers,
            'total_products': total_products,
            'recent_orders_30_days': recent_orders,
            'average_order_value': float(avg_order_value)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/sales', methods=['GET'])
def sales_analytics():
    """Get sales analytics with optional date filtering"""
    try:
        # Get query parameters
        days = request.args.get('days', 30, type=int)  # Default last 30 days
        
        # Calculate date range
        end_date = datetime.utcnow()
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
                    'date': day.date.strftime('%Y-%m-%d'),
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
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/products', methods=['GET'])
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
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/customers', methods=['GET'])
def customer_analytics():
    """Get customer analytics"""
    try:
        days = request.args.get('days', 30, type=int)
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # New customers in period
        new_customers = User.query.filter(User.created_at >= start_date).count()
        
        # Customer registrations over time
        daily_registrations = db.session.query(
            func.date(User.created_at).label('date'),
            func.count(User.id).label('registrations')
        ).filter(User.created_at >= start_date)\
         .group_by(func.date(User.created_at))\
         .order_by('date').all()
        
        # Top customers by total spent (Note: relationship needs verification)
        # For now, commenting out the join that might be incorrect
        top_customers = []  # Placeholder - needs relationship fix
        
        # Customer activity summary
        active_customers = 0  # Placeholder - needs relationship fix
        
        return jsonify({
            'period_days': days,
            'new_customers': new_customers,
            'active_customers': active_customers,
            'daily_registrations': [
                {
                    'date': reg.date.strftime('%Y-%m-%d'),
                    'registrations': reg.registrations
                } for reg in daily_registrations
            ],
            'top_customers': top_customers
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/financial', methods=['GET'])
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
        twelve_months_ago = datetime.utcnow() - timedelta(days=365)
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
        return jsonify({'error': str(e)}), 500
