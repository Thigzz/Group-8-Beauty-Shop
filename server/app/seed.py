import uuid
import random
from datetime import datetime, timedelta
from faker import Faker
from werkzeug.security import generate_password_hash

from app import create_app
from app.extensions import db
from app.models.users import User
from app.models.addresses import Address
from app.models.categories import Category, SubCategory
from app.models.products import Product
from app.models.orders import Order, OrderItem
from app.models.reviews import Review
from app.models.cart import Cart, CartItem
from app.models.payments import Payment

fake = Faker()

app = create_app()

with app.app_context():
    # Reset database (DEV only!)
    db.drop_all()
    db.create_all()

    # ---------- CATEGORIES ----------
    categories = [
    Category(id=uuid.uuid4(), category_name="MakeUp"),
    Category(id=uuid.uuid4(), category_name="Skincare"),
    Category(id=uuid.uuid4(), category_name="Fragrance"),
    Category(id=uuid.uuid4(), category_name="Haircare"),
    Category(id=uuid.uuid4(), category_name="Accessories"),
]
    db.session.add_all(categories)

# ---------- SUBCATEGORIES ----------
    subcategories = [
    # MakeUp
    SubCategory(id=uuid.uuid4(), category=categories[0], subcategory_name="Face"),
    SubCategory(id=uuid.uuid4(), category=categories[0], subcategory_name="Lips"),
    SubCategory(id=uuid.uuid4(), category=categories[0], subcategory_name="Nails"),
    SubCategory(id=uuid.uuid4(), category=categories[0], subcategory_name="Eyes"),
    # Skincare
    SubCategory(id=uuid.uuid4(), category=categories[1], subcategory_name="Face"),
    SubCategory(id=uuid.uuid4(), category=categories[1], subcategory_name="Body"),
    SubCategory(id=uuid.uuid4(), category=categories[1], subcategory_name="Sun Care"),
    # Fragrance
    SubCategory(id=uuid.uuid4(), category=categories[2], subcategory_name="Men"),
    SubCategory(id=uuid.uuid4(), category=categories[2], subcategory_name="Women"),
    # Haircare
    SubCategory(id=uuid.uuid4(), category=categories[3], subcategory_name="Shampoo"),
    SubCategory(id=uuid.uuid4(), category=categories[3], subcategory_name="Conditioner"),
    SubCategory(id=uuid.uuid4(), category=categories[3], subcategory_name="Styling"),
    SubCategory(id=uuid.uuid4(), category=categories[3], subcategory_name="Treatments"),
    # Accessories
    SubCategory(id=uuid.uuid4(), category=categories[4], subcategory_name="Brushes"),
    SubCategory(id=uuid.uuid4(), category=categories[4], subcategory_name="Sponges"),
    SubCategory(id=uuid.uuid4(), category=categories[4], subcategory_name="Tools"),
    SubCategory(id=uuid.uuid4(), category=categories[4], subcategory_name="Bags"),
]
    db.session.add_all(subcategories)


 # ---------- Users ----------
    users = []
    for _ in range(100):
        user = User(
            id=uuid.uuid4(),
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            username=fake.user_name(),
            email=fake.unique.email(),
            primary_phone_no=fake.phone_number(),
            secondary_phone_no=fake.phone_number(),
            role=random.choice(["customer", "admin"]),
            password_hash=generate_password_hash("password123"),
            created_at=datetime.now(),
            is_active=True
        )
        users.append(user)
    db.session.add_all(users)

    # ---------- Addresses ----------
    addresses = []
    for user in users:
        address = Address(
            id=uuid.uuid4(),
            user_id=user.id,
            address_line_1=fake.street_address(),
            city=fake.city(),
            postal_code=fake.postcode(),
            is_default=True
        )
        addresses.append(address)
    db.session.add_all(addresses)


    # ---------- Products ----------
    product_samples = [
    # MakeUp - Face
    ("Maybelline Fit Me Foundation", "Matte finish foundation for oily skin.", "https://images.unsplash.com/photo-1580910051075-0a174670bfcf", "MakeUp", "Face"),
    ("L'Oréal True Match Concealer", "Lightweight concealer that blends perfectly.", "https://images.unsplash.com/photo-1590944491986-df3a1bffc909", "MakeUp", "Face"),
    ("Benefit Hoola Bronzer", "Soft matte bronzer with natural glow.", "https://images.unsplash.com/photo-1519677100203-a0e668c92439", "MakeUp", "Face"),
    ("Fenty Beauty Pro Filt'r Soft Matte Foundation", "Full coverage with soft matte finish.", "https://images.unsplash.com/photo-1597234890546-8c4c8e1754a0", "MakeUp", "Face"),
    ("NARS Radiant Creamy Concealer", "Iconic under-eye concealer.", "https://images.unsplash.com/photo-1580134477039-a753c8e208a9", "MakeUp", "Face"),
    ("Charlotte Tilbury Airbrush Flawless Foundation", "Weightless, full coverage foundation.", "https://images.unsplash.com/photo-1597622925079-5a5e7e81b2f5", "MakeUp", "Face"),

    # MakeUp - Lips
    ("MAC Ruby Woo Lipstick", "Signature blue-red matte lipstick.", "https://images.unsplash.com/photo-1616618789026-527e4dead084", "MakeUp", "Lips"),
    ("NYX Butter Gloss", "High-shine lip gloss with butter smooth feel.", "https://images.unsplash.com/photo-1560840244-550159c8c902", "MakeUp", "Lips"),
    ("Maybelline SuperStay Matte Ink", "Long lasting liquid lipstick.", "https://images.unsplash.com/photo-1588615700074-dea83c0f3480", "MakeUp", "Lips"),
    ("Fenty Gloss Bomb", "Universal lip luminizer.", "https://images.unsplash.com/photo-1574861062357-4d86bd9fa392", "MakeUp", "Lips"),
    ("YSL Rouge Volupté Shine", "Luxurious hydrating lipstick.", "https://images.unsplash.com/photo-1586976221004-051bfad63d3d", "MakeUp", "Lips"),

    # MakeUp - Eyes
    ("Too Faced Better Than Sex Mascara", "Volumizing & dramatic curl mascara.", "https://images.unsplash.com/photo-1580134477039-a753c8e208a9", "MakeUp", "Eyes"),
    ("Urban Decay Naked Eyeshadow Palette", "12 neutral shades for day or night look.", "https://images.unsplash.com/photo-1588774061046-fd62aecf4df8", "MakeUp", "Eyes"),
    ("Maybelline Eyestudio Gel Liner", "Intense black waterproof gel liner.", "https://images.unsplash.com/photo-1597622925079-5a5e7e81b2f5", "MakeUp", "Eyes"),
    ("Benefit Roller Lash Mascara", "Lifted curl for short lashes like lash curler.", "https://images.unsplash.com/photo-1586976221004-051bfad63d3d", "MakeUp", "Eyes"),
    ("Huda Beauty Desert Dusk Palette", "Exotic eyeshadow shades.", "https://images.unsplash.com/photo-1586870748526-3fda5c00940f", "MakeUp", "Eyes"),

    # MakeUp - Nails
    ("OPI Nail Lacquer Big Apple Red", "Classic red nail polish.", "https://images.unsplash.com/photo-1586870748526-3fda5c00940f", "MakeUp", "Nails"),
    ("Sally Hansen Miracle Gel", "Longwear gel-like nail color.", "https://images.unsplash.com/photo-1574861062357-4d86bd9fa392", "MakeUp", "Nails"),
    ("Essie Ballet Slippers", "Soft pink nail polish.", "https://images.unsplash.com/photo-1588615700074-dea83c0f3480", "MakeUp", "Nails"),

    # Skincare - Face
    ("CeraVe Moisturizing Cream", "Hydrating cream with ceramides.", "https://images.unsplash.com/photo-1596274435143-ee3a67b1575b", "Skincare", "Face"),
    ("Neutrogena Hydro Boost Water Gel", "Lightweight gel moisturizer.", "https://images.unsplash.com/photo-1606813909412-8fe095868a6b", "Skincare", "Face"),
    ("La Roche-Posay Toleriane Hydrating Cleanser", "Gentle face wash for sensitive skin.", "https://images.unsplash.com/photo-1595281416070-97ad5535f9a7", "Skincare", "Face"),
    ("The Ordinary Niacinamide 10% + Zinc 1%", "Best-selling serum.", "https://images.unsplash.com/photo-1599904764381-631dd1a45ea3", "Skincare", "Face"),

    # Skincare - Body
    ("Aveeno Daily Moisturizing Lotion", "Oatmeal body lotion for dry skin.", "https://images.unsplash.com/photo-1581599297893-1f1f3fd78cbe", "Skincare", "Body"),
    ("Dove Deep Moisture Body Wash", "Cleanses & hydrates without stripping.", "https://images.unsplash.com/photo-1587445221059-4f6b484d32ca", "Skincare", "Body"),

    # Skincare - Sun Care
    ("Neutrogena Ultra Sheer Dry-Touch SPF 55", "Lightweight sunscreen", "https://images.unsplash.com/photo-1590057909111-39983f590c0a", "Skincare", "Sun Care"),
    ("La Roche-Posay Anthelios Melt-in Milk Sunscreen SPF 60", "Broad spectrum sun protection.", "https://images.unsplash.com/photo-1576765607924-f88e27828f86", "Skincare", "Sun Care"),

    # Fragrance - Women
    ("Chanel Coco Mademoiselle Eau de Parfum", "Classic women's fragrance.", "https://images.unsplash.com/photo-1569718232121-bd66948ab08a", "Fragrance", "Women"),
    ("Dior J'adore Eau de Parfum", "Elegant floral perfume.", "https://images.unsplash.com/photo-1579621970795-87f49102666b", "Fragrance", "Women"),
    ("Marc Jacobs Daisy", "Playful fresh floral scent.", "https://images.unsplash.com/photo-1580210472454-b9e5d58d7102", "Fragrance", "Women"),

    # Fragrance - Men
    ("Creed Aventus", "Bold masculine citrus & smoky scent.", "https://images.unsplash.com/photo-1580210472454-b9e5d58d7102", "Fragrance", "Men"),
    ("Bleu de Chanel Eau de Toilette", "Fresh woody men's fragrance.", "https://images.unsplash.com/photo-1556228721-de3183c74e8b", "Fragrance", "Men"),

    # Haircare - Shampoo
    ("Pantene Pro-V Daily Moisture Renewal Shampoo", "Hydrating shampoo for dry hair.", "https://images.unsplash.com/photo-1584755390360-1c2c0b2e2d49", "Haircare", "Shampoo"),
    ("Head & Shoulders Classic Clean Shampoo", "Dandruff shampoo that cleans scalp.", "https://images.unsplash.com/photo-1583347676245-4a135b0018ad", "Haircare", "Shampoo"),

    # Haircare - Conditioner
    ("Tresemmé Moisture Rich Conditioner", "Deep moisture conditioner.", "https://images.unsplash.com/photo-1586348943529-beaae6c28db9", "Haircare", "Conditioner"),
    ("SheaMoisture Raw Shea Butter Restorative Conditioner", "For curly, dry hair.", "https://images.unsplash.com/photo-1599904764381-631dd1a45ea3", "Haircare", "Conditioner"),

    # Haircare - Styling
    ("Got2b Ultra Glued Styling Gel", "Extreme hold hair gel.", "https://images.unsplash.com/photo-1584656001355-5d3fda3f2bd2", "Haircare", "Styling"),
    ("Moroccanoil Treatment", "Argan oil hair treatment product.", "https://images.unsplash.com/photo-1584263321298-2c6f2f4e5322", "Haircare", "Treatments"),

    # Accessories - Brushes
    ("Real Techniques Miracle Complexion Sponge", "Beauty sponge for blending foundation.", "https://images.unsplash.com/photo-1589571894960-20bbe2828e9c", "Accessories", "Sponges"),
    ("Sigma F80 Flat Kabuki Brush", "Buffing makeup brush.", "https://images.unsplash.com/photo-1597382286870-99f72fd2e206", "Accessories", "Brushes"),
    ("Morphe M439 Deluxe Buffer Brush", "Top-selling face brush.", "https://images.unsplash.com/photo-1615210100443-74b6a08b8a48", "Accessories", "Brushes"),

    # Accessories - Tools
    ("Tweezerman Stainless Steel Slant Tweezer", "Precision tweezer for brows.", "https://images.unsplash.com/photo-1583335557867-9b7356522251", "Accessories", "Tools"),
    ("Beauty Blender Solid Cleanser", "Tool cleanser bar.", "https://images.unsplash.com/photo-1580463011650-cf0c261fd7b0", "Accessories", "Tools"),

    # Accessories - Bags
    ("Ipsy Glam Bag", "Makeup bag subscription pouch.", "https://images.unsplash.com/photo-1570129477492-45c003edd2be", "Accessories", "Bags"),
    ("Sephora Collection Makeup Organizer Bag", "Function meets style.", "https://images.unsplash.com/photo-1615210100443-74b6a08b8a48", "Accessories", "Bags"),
]

# ---------- EXPAND TO 100 ----------
    products = []
for i in range(100):
    sample = random.choice(product_samples)
    variant_name = f"{sample[0]} {random.choice(['Mini', 'Pro', 'Deluxe', 'Edition'])}"
    product = Product(
        id=uuid.uuid4(),
        product_name=variant_name,
        description=sample[1],
        price=round(random.uniform(5, 200), 2),
        image_url=sample[2],
        category=next(c for c in categories if c.category_name == sample[3]),
        subcategory=next(sc for sc in subcategories if sc.subcategory_name == sample[4] and sc.category.category_name == sample[3]),
    )
    products.append(product)

    db.session.add_all(products)


    # ---------- Orders ----------
    orders = []
    for _ in range(100):
        user = random.choice(users)
        order = Order(
            id=uuid.uuid4(),
            user_id=user.id,
            status=random.choice(["pending", "shipped", "delivered", "cancelled"]),
            created_at=datetime.now() - timedelta(days=random.randint(0, 30))
        )
        orders.append(order)
    db.session.add_all(orders)

    # ---------- Order Items ----------
    order_items = []
    for order in orders:
        for _ in range(random.randint(1, 5)):  
            product = random.choice(products)
            item = OrderItem(
                id=uuid.uuid4(),
                order_id=order.id,
                product_id=product.id,
                quantity=random.randint(1, 3),
                price=product.price
            )
            order_items.append(item)
    db.session.add_all(order_items)

    # ---------- Reviews ----------
    reviews = []
    for _ in range(100):
        user = random.choice(users)
        product = random.choice(products)
        review = Review(
            id=uuid.uuid4(),
            user_id=user.id,
            product_id=product.id,
            rating=random.randint(1, 5),
            comment=fake.sentence(nb_words=15),
            created_at=datetime.now() - timedelta(days=random.randint(0, 60))
        )
        reviews.append(review)
    db.session.add_all(reviews)

    # ---------- Carts & Cart Items ----------
    carts = []
    cart_items = []
    for user in users[:50]: 
        cart = Cart(id=uuid.uuid4(), user_id=user.id, created_at=datetime.now())
        carts.append(cart)
        for _ in range(random.randint(1, 4)): 
            product = random.choice(products)
            ci = CartItem(
                id=uuid.uuid4(),
                cart_id=cart.id,
                product_id=product.id,
                quantity=random.randint(1, 3)
            )
            cart_items.append(ci)
    db.session.add_all(carts)
    db.session.add_all(cart_items)

    # ---------- Payments ----------
    payments = []
    for order in orders:
        if order.status in ["shipped", "delivered"]: 
            payment = Payment(
                id=uuid.uuid4(),
                order_id=order.id,
                amount=sum(item.price * item.quantity for item in order_items if item.order_id == order.id),
                status="paid",
                created_at=order.created_at + timedelta(hours=random.randint(1, 48))
            )
            payments.append(payment)
    db.session.add_all(payments)

    # Commit all changes
    db.session.commit()

    print("✅ Database seeded with users, addresses, products, orders, order items, reviews, carts, and payments!")
