import uuid
import random
from datetime import datetime, timedelta, timezone
from faker import Faker
import os

from server.app import create_app
from server.app.extensions import db, bcrypt
from server.app.models.users import User, UserRole
from server.app.models.address import Address
from server.app.models.category import Category
from server.app.models.sub_category import SubCategory
from server.app.models.product import Product
from server.app.models.orders import Order
from server.app.models.order_items import OrderItem
from server.app.models.carts import Cart
from server.app.models.cart_items import CartItem
from server.app.models.payment import Payment
from server.app.models.security_question import SecurityQuestion
from server.app.models.user_security_questions import UserSecurityQuestion
from server.app.models.invoice import Invoice
from server.app.models.enums import PaymentStatus, OrderStatus, PaymentMethod

fake = Faker()

def seed_data():
    """Seeds the database with initial data."""
    app = create_app()
    with app.app_context():
        # ---------- Reset DB ----------
        db.drop_all()
        db.create_all()

        # ---------- Categories ----------
        categories = [
            Category(category_name="MakeUp"),
            Category(category_name="Skincare"),
            Category(category_name="Fragrance"),
            Category(category_name="Haircare"),
            Category(category_name="Accessories"),
        ]
        db.session.add_all(categories)
        db.session.commit()
        print(f"✅ Seeded {len(categories)} categories")

        # ---------- Subcategories ----------
        subcategories = [
            SubCategory(category=categories[0], sub_category_name="Face"),
            SubCategory(category=categories[0], sub_category_name="Lips"),
            SubCategory(category=categories[0], sub_category_name="Nails"),
            SubCategory(category=categories[0], sub_category_name="Eyes"),
            SubCategory(category=categories[1], sub_category_name="Face"),
            SubCategory(category=categories[1], sub_category_name="Body"),
            SubCategory(category=categories[1], sub_category_name="Sun Care"),
            SubCategory(category=categories[2], sub_category_name="Men"),
            SubCategory(category=categories[2], sub_category_name="Women"),
            SubCategory(category=categories[3], sub_category_name="Shampoo"),
            SubCategory(category=categories[3], sub_category_name="Conditioner"),
            SubCategory(category=categories[3], sub_category_name="Styling"),
            SubCategory(category=categories[3], sub_category_name="Treatments"),
            SubCategory(category=categories[4], sub_category_name="Brushes"),
            SubCategory(category=categories[4], sub_category_name="Sponges"),
            SubCategory(category=categories[4], sub_category_name="Tools"),
            SubCategory(category=categories[4], sub_category_name="Bags"),
        ]
        db.session.add_all(subcategories)
        db.session.commit()
        print(f"✅ Seeded {len(subcategories)} subcategories")

        # ---------- Users ----------
        users = []
        used_usernames = set()
        for _ in range(100):
            while True:
                username = fake.user_name()
                if username not in used_usernames and not User.query.filter_by(username=username).first():
                    used_usernames.add(username)
                    break
            
            user = User(
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                username=username,
                email=fake.unique.email(),
                primary_phone_no=fake.phone_number(),
                secondary_phone_no=fake.phone_number(),
                role=random.choice([UserRole.customer, UserRole.admin]),
                role=random.choice(list(UserRole)),
                is_active=True,
            )
            user.set_password("password123")
            users.append(user)
        db.session.add_all(users)
        db.session.commit()
        print(f"✅ Seeded {len(users)} users")

        # ---------- Specific Admin Users ----------
        admins = [
            {"first_name": "Simon", "last_name": "Warui", "username": "simon", "email": "simon@pambo.com"},
            {"first_name": "Ruth", "last_name": "Siyoi", "username": "ruth", "email": "ruth@pambo.com"},
            {"first_name": "Ike", "last_name": "Mwithiga", "username": "ike", "email": "ike@pambo.com"},
            {"first_name": "Justin", "last_name": "Kipkorir", "username": "justin", "email": "justin@pambo.com"}
        ]

        for admin_data in admins:
            if not User.query.filter_by(email=admin_data["email"]).first():
                admin_user = User(
                    first_name=admin_data["first_name"],
                    last_name=admin_data["last_name"],
                    username=admin_data["username"],
                    email=admin_data["email"],
                    primary_phone_no=fake.phone_number(),
                    role=UserRole.admin,
                    is_active=True,
                )
                admin_user.set_password("passnumber")
                db.session.add(admin_user)
        
        db.session.commit()
        print(f"✅ Seeded {len(admins)} specific admin users")

        # ---------- Addresses ----------
        addresses = []
        all_users = User.query.all()
        for user in all_users:
            addresses.append(
                Address(
                    user_id=user.id,
                    address_line_1=fake.street_address(),
                    city=fake.city(),
                    postal_code=fake.postcode(),
                    is_default=True,
                )
            )
        db.session.add_all(addresses)
        db.session.commit()
        print(f"✅ Seeded {len(addresses)} addresses")

        # ---------- Security Questions ----------
        questions = [
            "What was the name of your first pet?", "What is your mother's maiden name?", "What was the name of your first school?",
            "In what city were you born?", "What is your favorite book?", "What is the name of your best friend in childhood?",
            "What is your favorite movie?", "What is your father's middle name?", "What street did you grow up on?",
            "What is the name of your first employer?",
        ]
        for q in questions:
            if not SecurityQuestion.query.filter_by(question=q).first():
                db.session.add(SecurityQuestion(question=q))
        db.session.commit()
        print(f"✅ Seeded {len(questions)} security questions")

        # ---------- User Security Question Answers ----------
        users_fresh = User.query.all()
        all_questions = SecurityQuestion.query.all()
        for user in users_fresh:
            selected = random.sample(all_questions, k=3)
            for q in selected:
                if not UserSecurityQuestion.query.filter_by(user_id=user.id, question_id=q.id).first():
                    fake_answer = fake.word()
                    hashed = bcrypt.generate_password_hash(fake_answer).decode("utf-8")
                    db.session.add(UserSecurityQuestion(user_id=user.id, question_id=q.id, answer_hash=hashed))
        db.session.commit()
        print(f"✅ Seeded user security question answers")

        # ---------- Products ----------
        product_samples = [
            ("Maybelline Fit Me Foundation", "Matte finish foundation for oily skin.", "https://images.unsplash.com/photo-1580910051075-0a174670bfcf", "MakeUp", "Face"),
            ("L'Oréal True Match Concealer", "Lightweight concealer that blends perfectly.", "https://images.unsplash.com/photo-1590944491986-df3a1bffc909", "MakeUp", "Face"),
            ("Benefit Hoola Bronzer", "Soft matte bronzer with natural glow.", "https://images.unsplash.com/photo-1519677100203-a0e668c92439", "MakeUp", "Face"),
            ("Fenty Beauty Pro Filt'r Soft Matte Foundation", "Full coverage with soft matte finish.", "https://images.unsplash.com/photo-1597234890546-8c4c8e1754a0", "MakeUp", "Face"),
            ("NARS Radiant Creamy Concealer", "Iconic under-eye concealer.", "https://images.unsplash.com/photo-1580134477039-a753c8e208a9", "MakeUp", "Face"),
            ("Charlotte Tilbury Airbrush Flawless Foundation", "Weightless, full coverage foundation.", "https://images.unsplash.com/photo-1597622925079-5a5e7e81b2f5", "MakeUp", "Face"),
            ("MAC Ruby Woo Lipstick", "Signature blue-red matte lipstick.", "https://images.unsplash.com/photo-1616618789026-527e4dead084", "MakeUp", "Lips"),
            ("NYX Butter Gloss", "High-shine lip gloss with butter smooth feel.", "https://images.unsplash.com/photo-1560840244-550159c8c902", "MakeUp", "Lips"),
            ("Maybelline SuperStay Matte Ink", "Long lasting liquid lipstick.", "https://images.unsplash.com/photo-1588615700074-dea83c0f3480", "MakeUp", "Lips"),
            ("Fenty Gloss Bomb", "Universal lip luminizer.", "https://images.unsplash.com/photo-1574861062357-4d86bd9fa392", "MakeUp", "Lips"),
            ("YSL Rouge Volupté Shine", "Luxurious hydrating lipstick.", "https://images.unsplash.com/photo-1586976221004-051bfad63d3d", "MakeUp", "Lips"),
            ("Too Faced Better Than Sex Mascara", "Volumizing & dramatic curl mascara.", "https://images.unsplash.com/photo-1580134477039-a753c8e208a9", "MakeUp", "Eyes"),
            ("Urban Decay Naked Eyeshadow Palette", "12 neutral shades for day or night look.", "https://images.unsplash.com/photo-1588774061046-fd62aecf4df8", "MakeUp", "Eyes"),
            ("Maybelline Eyestudio Gel Liner", "Intense black waterproof gel liner.", "https://images.unsplash.com/photo-1597622925079-5a5e7e81b2f5", "MakeUp", "Eyes"),
            ("Benefit Roller Lash Mascara", "Lifted curl for short lashes like lash curler.", "https://images.unsplash.com/photo-1586976221004-051bfad63d3d", "MakeUp", "Eyes"),
            ("Huda Beauty Desert Dusk Palette", "Exotic eyeshadow shades.", "https://images.unsplash.com/photo-1586870748526-3fda5c00940f", "MakeUp", "Eyes"),
            ("OPI Nail Lacquer Big Apple Red", "Classic red nail polish.", "https://images.unsplash.com/photo-1586870748526-3fda5c00940f", "MakeUp", "Nails"),
            ("Sally Hansen Miracle Gel", "Longwear gel-like nail color.", "https://images.unsplash.com/photo-1574861062357-4d86bd9fa392", "MakeUp", "Nails"),
            ("Essie Ballet Slippers", "Soft pink nail polish.", "https://images.unsplash.com/photo-1588615700074-dea83c0f3480", "MakeUp", "Nails"),
            ("CeraVe Moisturizing Cream", "Hydrating cream with ceramides.", "https://images.unsplash.com/photo-1596274435143-ee3a67b1575b", "Skincare", "Face"),
            ("Neutrogena Hydro Boost Water Gel", "Lightweight gel moisturizer.", "https://images.unsplash.com/photo-1606813909412-8fe095868a6b", "Skincare", "Face"),
            ("La Roche-Posay Toleriane Hydrating Cleanser", "Gentle face wash for sensitive skin.", "https://images.unsplash.com/photo-1595281416070-97ad5535f9a7", "Skincare", "Face"),
            ("The Ordinary Niacinamide 10% + Zinc 1%", "Best-selling serum.", "https://images.unsplash.com/photo-1599904764381-631dd1a45ea3", "Skincare", "Face"),
            ("Aveeno Daily Moisturizing Lotion", "Oatmeal body lotion for dry skin.", "https://images.unsplash.com/photo-1581599297893-1f1f3fd78cbe", "Skincare", "Body"),
            ("Dove Deep Moisture Body Wash", "Cleanses & hydrates without stripping.", "https://images.unsplash.com/photo-1587445221059-4f6b484d32ca", "Skincare", "Body"),
            ("Neutrogena Ultra Sheer Dry-Touch SPF 55", "Lightweight sunscreen", "https://images.unsplash.com/photo-1590057909111-39983f590c0a", "Skincare", "Sun Care"),
            ("La Roche-Posay Anthelios Melt-in Milk Sunscreen SPF 60", "Broad spectrum sun protection.", "https://images.unsplash.com/photo-1576765607924-f88e27828f86", "Skincare", "Sun Care"),
            ("Chanel Coco Mademoiselle Eau de Parfum", "Classic women's fragrance.", "https://images.unsplash.com/photo-1569718232121-bd66948ab08a", "Fragrance", "Women"),
            ("Dior J'adore Eau de Parfum", "Elegant floral perfume.", "https://images.unsplash.com/photo-1579621970795-87f49102666b", "Fragrance", "Women"),
            ("Marc Jacobs Daisy", "Playful fresh floral scent.", "https://images.unsplash.com/photo-1580210472454-b9e5d58d7102", "Fragrance", "Women"),
            ("Creed Aventus", "Bold masculine citrus & smoky scent.", "https://images.unsplash.com/photo-1580210472454-b9e5d58d7102", "Fragrance", "Men"),
            ("Bleu de Chanel Eau de Toilette", "Fresh woody men's fragrance.", "https://images.unsplash.com/photo-1556228721-de3183c74e8b", "Fragrance", "Men"),
            ("Pantene Pro-V Daily Moisture Renewal Shampoo", "Hydrating shampoo for dry hair.", "https://images.unsplash.com/photo-1584755390360-1c2c0b2e2d49", "Haircare", "Shampoo"),
            ("Head & Shoulders Classic Clean Shampoo", "Dandruff shampoo that cleans scalp.", "https://images.unsplash.com/photo-1583347676245-4a135b0018ad", "Haircare", "Shampoo"),
            ("Tresemmé Moisture Rich Conditioner", "Deep moisture conditioner.", "https://images.unsplash.com/photo-1586348943529-beaae6c28db9", "Haircare", "Conditioner"),
            ("SheaMoisture Raw Shea Butter Restorative Conditioner", "For curly, dry hair.", "https://images.unsplash.com/photo-1599904764381-631dd1a45ea3", "Haircare", "Conditioner"),
            ("Got2b Ultra Glued Styling Gel", "Extreme hold hair gel.", "https://images.unsplash.com/photo-1584656001355-5d3fda3f2bd2", "Haircare", "Styling"),
            ("Moroccanoil Treatment", "Argan oil hair treatment product.", "https://images.unsplash.com/photo-1584263321298-2c6f2f4e5322", "Haircare", "Treatments"),
            ("Real Techniques Miracle Complexion Sponge", "Beauty sponge for blending foundation.", "https://images.unsplash.com/photo-1589571894960-20bbe2828e9c", "Accessories", "Sponges"),
            ("Sigma F80 Flat Kabuki Brush", "Buffing makeup brush.", "https://images.unsplash.com/photo-1597382286870-99f72fd2e206", "Accessories", "Brushes"),
            ("Morphe M439 Deluxe Buffer Brush", "Top-selling face brush.", "https://images.unsplash.com/photo-1615210100443-74b6a08b8a48", "Accessories", "Brushes"),
            ("Tweezerman Stainless Steel Slant Tweezer", "Precision tweezer for brows.", "https://images.unsplash.com/photo-1583335557867-9b7356522251", "Accessories", "Tools"),
            ("Beauty Blender Solid Cleanser", "Tool cleanser bar.", "https://images.unsplash.com/photo-1580463011650-cf0c261fd7b0", "Accessories", "Tools"),
            ("Ipsy Glam Bag", "Makeup bag subscription pouch.", "https://images.unsplash.com/photo-1570129477492-45c003edd2be", "Accessories", "Bags"),
            ("Sephora Collection Makeup Organizer Bag", "Function meets style.", "https://images.unsplash.com/photo-1615210100443-74b6a08b8a48", "Accessories", "Bags"),
        ]
        products = []
        with db.session.no_autoflush:
            for _ in range(100):
                sample = random.choice(product_samples)
                variant_name = f"{sample[0]} {random.choice(['Mini','Pro','Deluxe','Edition'])}"
                category_obj = next(c for c in categories if c.category_name == sample[3])
                subcategory_obj = next(sc for sc in subcategories if sc.sub_category_name == sample[4] and sc.category.category_name == sample[3])
                
                stock_qty = random.randint(10, 200)

                product = Product(
                    product_name=variant_name,
                    description=sample[1],
                    price=round(random.uniform(5, 200), 2),
                    stock_qty=stock_qty,
                    image_url=sample[2],
                    category=category_obj,
                    sub_category=subcategory_obj,
                )
                products.append(product)
        db.session.add_all(products)
        db.session.commit()
        print(f"✅ Seeded {len(products)} products")


        # ---------- Carts & Cart Items ----------
        products_fresh = Product.query.all()
        users_fresh_for_carts = User.query.filter(User.role == UserRole.customer).limit(50).all()

        for user in users_fresh_for_carts:
            cart = Cart(user_id=user.id)
            db.session.add(cart)
            db.session.flush()
            for _ in range(random.randint(1, 4)):
                product = random.choice(products_fresh)
                quantity = random.randint(1, 3)
                db.session.add(CartItem(cart_id=cart.id, product_id=product.id, quantity=quantity, total_amount=product.price * quantity, status="active"))

        for _ in range(20):
            session_id = str(uuid.uuid4())
            cart = Cart(session_id=session_id)
            db.session.add(cart)
            db.session.flush()
            for _ in range(random.randint(1, 4)):
                product = random.choice(products_fresh)
                quantity = random.randint(1, 3)
                db.session.add(CartItem(cart_id=cart.id, product_id=product.id, quantity=quantity, total_amount=product.price * quantity, status="active"))

        db.session.commit()
        print(f"✅ Seeded carts and cart items (including guest carts)")

        # ---------- Orders & Order Items ----------
        for cart in Cart.query.all():
            if not cart.items:
                continue
            order_total = sum(item.total_amount for item in cart.items)
            order = Order(
                cart_id=cart.id,
                status=random.choice(list(OrderStatus)),
                total_amount=order_total
            )
            db.session.add(order)
            db.session.flush()
            for ci in cart.items:
                db.session.add(OrderItem(order_id=order.id, product_id=ci.product_id, quantity=ci.quantity, price=ci.product.price))
        db.session.commit()
        print(f"✅ Seeded orders and order items")
        
        # ---------- Invoices & Payments ----------
        users_for_invoices = User.query.all()
        for i, order in enumerate(Order.query.limit(20).all()):
            if order.cart.user_id:
                invoice = Invoice(
                    invoice_number=f"INV-{1000+i+1}",
                    order_id=str(order.id),
                    user_id=str(order.cart.user_id),
                    amount=order.total_amount,
                    payment_status=random.choice(list(PaymentStatus))
                )
                if invoice.payment_status == PaymentStatus.paid:
                    created_at = invoice.created_at or datetime.now(timezone.utc)
                    invoice.paid_at = created_at + timedelta(days=random.randint(1, 5))
                    db.session.add(invoice)
                    db.session.flush()
                    db.session.add(Payment(
                        invoice_id=str(invoice.id),
                        amount=order.total_amount,
                        payment_method=random.choice(list(PaymentMethod)),
                        transaction_id=fake.uuid4()
                    ))
        db.session.commit()
        print(f"✅ Seeded invoices and payments")

        print("✅ Database seeded successfully!")