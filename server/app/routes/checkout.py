from flask import Blueprint, request, jsonify
import uuid
import traceback 
from datetime import datetime
from server.app.extensions import db
from server.app.models.product import Product
from server.app.models.carts import Cart
from server.app.models.cart_items import CartItem
from server.app.models.orders import Order
from server.app.models.order_items import OrderItem
from server.app.models.invoice import Invoice
from server.app.models.payment import Payment
from server.app.models.users import User
from server.app.models.enums import OrderStatus, PaymentStatus, PaymentMethod, CartStatus, CartItemStatus
import json

checkout_bp = Blueprint('checkout', __name__, url_prefix='/api/checkout')

@checkout_bp.route('/calculate', methods=['POST'])
def calculate_total():
    """Calculating order total before checkout"""
    try:
        data = request.get_json()
        
        if 'items' not in data or not isinstance(data['items'], list):
            return jsonify({'error': 'items array is required'}), 400
        
        total = 0
        calculated_items = []
        
        for item in data['items']:
            if 'product_id' not in item or 'quantity' not in item:
                return jsonify({'error': 'Each item must have product_id and quantity'}), 400
            
            product_uuid = uuid.UUID(item['product_id'])
            product = Product.query.get_or_404(product_uuid)
            
            if product.stock_qty < item['quantity']:
                return jsonify({'error': f'Insufficient stock for {product.product_name}'}), 400
            
            item_total = float(product.price) * item['quantity']
            total += item_total
            
            calculated_items.append({
                'product_id': str(product.id),
                'product_name': product.product_name,
                'price': float(product.price),
                'quantity': item['quantity'],
                'subtotal': item_total
            })
        
        shipping = 300.0 if total < 5000 else 0
        
        return jsonify({
            'items': calculated_items,
            'subtotal': total,
            'shipping': shipping,
            'total': total + shipping
        }), 200
        
    except ValueError:
        return jsonify({'error': 'Invalid UUID format'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@checkout_bp.route('/process', methods=['POST'])
def process_checkout():
    """Processing complete checkout with detailed logging"""
    try:
        data = request.get_json()
        print("Received checkout data:", data)

        required_fields = ['user_id', 'payment_method', 'items']
        for field in required_fields:
            if field not in data:
                print(f"DEBUG: Missing required field '{field}'")
                return jsonify({'error': f'{field} is required'}), 400
        
        if not isinstance(data['items'], list) or not data['items']:
            print("DEBUG: Items array is empty or not a list.")
            return jsonify({'error': 'Items array cannot be empty.'}), 400

        try:
            payment_method_str = data['payment_method'].lower()
            payment_method_enum = PaymentMethod[payment_method_str]
        except KeyError:
            print(f"DEBUG: Invalid payment method received: {data['payment_method']}")
            return jsonify({'error': f"Invalid payment method: {data['payment_method']}"}), 400

        user_uuid = uuid.UUID(data['user_id'])
        user = User.query.get(user_uuid)
        if not user:
             print(f"DEBUG: User not found for ID: {data['user_id']}")
             return jsonify({'error': 'User not found'}), 404

        cart = Cart.query.filter_by(user_id=user_uuid, status=CartStatus.open).first()

        total = 0
        order_items_data = []
        
        for item in data['items']:
            product_uuid = uuid.UUID(item['product_id'])
            product = Product.query.get(product_uuid)
            
            if not product:
                 print(f"DEBUG: Product not found for ID: {item['product_id']}")
                 return jsonify({'error': f"Product with ID {item['product_id']} not found."}), 400

            if product.stock_qty < item['quantity']:
                print(f"DEBUG: Insufficient stock for product {product.product_name} (ID: {product.id})")
                return jsonify({'error': f'Insufficient stock for {product.product_name}'}), 400
            
            item_total = float(product.price) * item['quantity']
            total += item_total
            
            order_items_data.append({
                'product': product,
                'product_uuid': product.id,
                'quantity': item['quantity'],
                'price': product.price,
                'subtotal': item_total
            })
        
        shipping = 300.0 if total < 5000 else 0
        final_total = total + shipping
        
        if cart:
            cart.status = CartStatus.closed

        order = Order(
            id=uuid.uuid4(),
            cart_id=cart.id if cart else None,
            status=OrderStatus.pending,
            total_amount=final_total
        )
        db.session.add(order)
        db.session.flush()
        
        for item_data in order_items_data:
            order_item = OrderItem(
                id=uuid.uuid4(),
                order_id=order.id,
                product_id=item_data['product_uuid'],
                quantity=item_data['quantity'],
                price=item_data['price'],
                sub_total=item_data['subtotal']
            )
            db.session.add(order_item)
            item_data['product'].stock_qty -= item_data['quantity']
        
        invoice_number = f"INV-{datetime.now().strftime('%Y%m%d')}-{str(order.id)[:8]}"
        invoice = Invoice(
            invoice_number=invoice_number,
            order_id=str(order.id),
            user_id=str(user_uuid),
            amount=final_total,
            payment_status=PaymentStatus.pending
        )
        db.session.add(invoice)
        db.session.flush()
        
        transaction_id = f"TXN-{datetime.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:8]}"
        payment = Payment(
            invoice_id=str(invoice.id),
            payment_method=payment_method_enum,
            amount=final_total,
            transaction_id=transaction_id
        )
        db.session.add(payment)
        
        if payment_method_enum in [PaymentMethod.mpesa, PaymentMethod.credit_card]:
            order.status = OrderStatus.paid
            invoice.payment_status = PaymentStatus.paid
            invoice.paid_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Order processed successfully',
            'cart': { 'id': str(cart.id), 'status': cart.status.value } if cart else None,
            'order': { 'id': str(order.id), 'status': order.status.value, 'total_amount': float(order.total_amount) },
            'invoice': { 'id': str(invoice.id), 'invoice_number': invoice.invoice_number, 'amount': float(invoice.amount), 'payment_status': invoice.payment_status.value },
            'payment': { 'id': str(payment.id), 'transaction_id': payment.transaction_id, 'method': payment.payment_method.value }
        }), 201
        
    except ValueError as ve:
        db.session.rollback()
        print(f"ValueError: {ve}")
        return jsonify({'error': 'Invalid UUID format or other value error'}), 400
    except Exception as e:
        db.session.rollback()
        print("An error occurred during checkout processing:")
        traceback.print_exc() 
        return jsonify({'error': 'An internal server error occurred. Check server logs for details.'}), 500

@checkout_bp.route('/order/<order_id>', methods=['GET'])
def get_order_details(order_id):
    """Get order details with items"""
    try:
        order_uuid = uuid.UUID(order_id)
        order = Order.query.get_or_404(order_uuid)
        
        order_items = db.session.query(OrderItem, Product)\
            .join(Product)\
            .filter(OrderItem.order_id == order_uuid)\
            .all()
        
        response_data = {
            'order': {
                'id': str(order.id),
                'cart_id': str(order.cart_id),
                'status': order.status.value,
                'total_amount': float(order.total_amount),
                'created_at': order.created_at.isoformat()
            },
            'items': [
                {
                    'product_name': product.product_name,
                    'quantity': item.quantity,
                    'price': float(item.price),
                    'subtotal': float(item.sub_total)
                } for item, product in order_items
            ]
        }
        
        print("--- CORRECTED JSON Response Being Sent ---")
        print(json.dumps(response_data, indent=2))
        print("-----------------------------------------")
        
        return jsonify(response_data), 200
        
    except ValueError:
        return jsonify({'error': 'Invalid order ID format'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500