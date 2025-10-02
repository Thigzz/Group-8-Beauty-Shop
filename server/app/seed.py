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

        # ---------- Image Links ----------
        image_links = {
            "Huda Beauty Desert Dusk Palette": {
                "Pro": "https://cdn11.bigcommerce.com/s-dgbc5lzb0p/images/stencil/1280x1280/products/8254/26965/Huda_Beauty_Desert_Dusk_Palette__11880.1712000334.jpg?c=2?imbypass=on",
                "Edition": "https://m.media-amazon.com/images/I/71x6OMUKd7L._AC_SL1242_.jpg"
            },
            "Sally Hansen Miracle Gel": {
                "Deluxe": "https://images.contentstack.io/v3/assets/blt68535c7ccb9ffe9b/bltdce78ddb26ba5c92/66742575ca9c56574b35e85d/sh-miracle-gel.jpg?auto=webp",
                "Edition": "https://m.media-amazon.com/images/I/71IzR4zNS+L._SX466_.jpg"
            },
            "MAC Ruby Woo Lipstick": {
                "Pro": "https://cdn.fynd.com/v2/falling-surf-7c8bb8/fyprod/wrkr/products/pictures/item/free/resize-w:1024/000000000494341982/DWrBuFTDk_O-000000000494341982_1.jpg"
            },
            "CeraVe Moisturizing Cream": {
                "Mini": "https://dreamskinhaven.co.ke/wp-content/uploads/2022/04/CeraVe-Hydrating-Cream-to-Foam-Cleanser-87ml.png?x55143"
            },
            "Aveeno Daily Moisturizing Lotion": {
                "Default": "https://i5.walmartimages.com/seo/Aveeno-Daily-Moisturizing-Body-Lotion-with-Oat-for-Dry-Skin-12-fl-oz_d3f610cc-57fd-402f-a9c9-27065888a725.e4111f9bbd775dd00a3505d5203e47f9.jpeg"
            },
            "Benefit Hoola Bronzer": {
                "Deluxe": "https://www.sephora.com/productimages/sku/s2867901-main-zoom.jpg?imwidth=1224",
                "Edition": "https://www.sephora.com/productimages/sku/s2867901-main-zoom.jpg?imwidth=1224"
            },
            "Beauty Blender Solid Cleanser": {
                "Deluxe": "https://www.lookfantastic.com/images?url=https://static.thcdn.com/productimg/original/11286566-4484965341964831.jpg&format=webp&auto=avif&width=1200&height=1200&fit=cover&dpr=2",
                "Edition": "https://m.media-amazon.com/images/I/61qaJPNwoGL._AC_SL1238_.jpg"
            },
            "Maybelline SuperStay Matte Ink": {
                "Mini": "https://media6.ppl-media.com//tr:h-750,w-750,c-at_max,dpr-2/static/img/product/246926/maybelline-superstay-matink-mini_2_display_1626271271_403ea7d3.jpg"
            },
            "YSL Rouge Volupté Shine": {
                "Pro": "https://www.yslbeauty.sa/dw/image/v2/BDCL_PRD/on/demandware.static/-/Sites-ysl-master-catalog/default/dwe216e90a/Makeup/RVS/3614271280268_45_rouge-volupte-shine_Alt1.png?sw=500&sh=600"
            },
            "Bleu de Chanel Eau de Toilette": {
                "Deluxe": "https://image.adsoftheworld.com/sxvh71fcepnhzue80fcgiu6hqx9s"
            },
            "Moroccanoil Treatment": {
                "Deluxe": "https://cdn11.bigcommerce.com/s-63354/images/stencil/1280x1280/products/7186/17192/Moroccanoil_Deluxe_Wonders_Mini_Gift_Set_-_Light_1_1__27121.1695293233.jpg?c=2&imbypass=on",
                "Mini": "https://m.media-amazon.com/images/I/718J5i1N-SL._SL1500_.jpg",
                "Edition": "https://bluemercury.com/cdn/shop/files/global_images-p7290011521011-7.jpg?v=1755621384&width=750"
            },
            "Maybelline Fit Me Foundation": {
                "Mini": "https://women.brandatt.com/image/cache/catalog/6902395722427-1100x1100.jpg",
                "Deluxe": "https://m.media-amazon.com/images/I/318C9oC0iUL._SY300_SX300_QL70_FMwebp_.jpg",
                "Pro": "https://www.true.co.ke/cdn/shop/products/Maybelline-New-York-Fit-Me-Matte-_-Poreless-Liquid-Foundation-30ml_1024x1024.jpg?v=1617024064"
            },
            "Ipsy Glam Bag": {
                "Edition": "https://blog.ipsy.com/_next/image?url=https://images.ctfassets.net/daem4o9l2hfd/532c5a7b-0413-44de-a87b-802d61ea37b1/78d8a67e91c09e3415782e3300ed595b/532c5a7b-0413-44de-a87b-802d61ea37b1.jpeg&w=3840&q=75"
            },
            "Sigma F80 Flat Kabuki Brush": {
                "Deluxe": "https://m.media-amazon.com/images/I/71UskaEafGL._SL1500_.jpg"
            },
            "Maybelline Eyestudio Gel Liner": {
                "Edition": "https://m.media-amazon.com/images/I/91pYdacVKEL._SL1500_.jpg",
                "Pro": "https://m.media-amazon.com/images/I/51IkEtb9tRL._SS1000_.jpg"
            },
            "Tweezerman Stainless Steel Slant Tweezer": {
                "Mini": "https://salonsaver.com.au/images/ProductImages/500/600406_4.jpg",
                "Deluxe": "https://m.media-amazon.com/images/I/414Sih9Gs0L._AC_SX679_.jpg"
            },
            "Creed Aventus": {
                "Mini": "https://minispectra.co/wp-content/uploads/2022/07/Spectra-Mini-029-Eau-De-Parfum-For-Men-25ml-Creed-Aventus.jpg",
                "Edition": "https://cdn.paris-avenues.com/image/cache/catalog/Product2/3508441106420-Creed-Aventus-Edp-120-Ml-2-1100x1100.jpg"
            },
            "Chanel Coco Mademoiselle Eau de Parfum": {
                "Pro": "https://giftpoint.com.pk/cdn/shop/files/CocoMademoiselleChanelEauDeParfum100ml.png?v=1754568615",
                "Edition": "https://alhajisperfumes.com/cdn/shop/files/3145891165272box.jpg?v=1757503264&width=713"
            },
            "Fenty Beauty Pro Filt'r Soft Matte Foundation": {
                "Edition": "https://kosmetista.in/wp-content/uploads/2022/02/Pro-Filtr-Soft-Matte-Longwear-Liquid-Foundation-Cover.jpg",
                "Mini": "https://houseofbeauty.co.uk/public/files/productphoto/org/fentyhydrating.jpg"
            },
            "OPI Nail Lacquer Big Apple Red": {
                "Edition": "https://cdn.shopify.com/s/files/1/0649/4879/7673/products/big-apple-red-nln25-nail-lacquer-22001014069_5d248308-fefd-4aef-a1c2-abaedcd41a56.jpg?v=1668556954&width=1080"
            },
            "Morphe M439 Deluxe Buffer Brush": {
                "Mini": "https://www.lookfantastic.com/images?url=https://static.thcdn.com/productimg/1600/1600/11867081-6474613354960808.jpg&format=webp&auto=avif&width=985&height=985&fit=cover&dpr=2",
                "Deluxe": "https://cdn-img.prettylittlething.com/f/a/5/5/fa5510504097c1c35d3f31936aac168b83562146_cly4747_1.jpg?imwidth=800"
            },
            "Sephora Collection Makeup Organizer Bag": {
                "Deluxe": "https://i.ebayimg.com/images/g/JZoAAOSwxf9lJYkb/s-l1600.webp"
            },
            "Got2b Ultra Glued Styling Gel": {
                "Edition": "https://www.true.co.ke/cdn/shop/products/Got2b-Ultra-Glued-Styling-Gel-For-Edges-150ml_1024x1024.jpg?v=1616059666",
                "Deluxe": "https://m.media-amazon.com/images/I/71cezXxz9PL._SX466_.jpg"
            },
            "Real Techniques Miracle Complexion Sponge": {
                "Deluxe": "https://m.media-amazon.com/images/I/81XAS27-rdL._SL1500_.jpg"
            },
            "Benefit Roller Lash Mascara": {
                "Deluxe": "https://media.ulta.com/i/ulta/2285068?w=1080&h=1080&fmt=auto",
                "Edition": "https://www.cultbeauty.com/images?url=https://static.thcdn.com/productimg/original/11068092-2545256189763476.jpg&format=webp&auto=avif&width=985&height=985&fit=cover&dpr=2"
            },
            "Tresemmé Moisture Rich Conditioner": {
                "Pro": "https://assets.unileversolutions.com/v1/43825346.png?im=AspectCrop=(985,985);Resize=(985,985)",
                "Mini": "https://target.scene7.com/is/image/Target/GUEST_a49d3198-d7c0-4260-a951-a585a9bdd7c1?wid=1200&hei=1200&qlt=80",
                "Deluxe": "https://cfimg.wowcher.co.uk/cdn-cgi/image/height=487,width=727,quality=85,format=auto/https://static.wowcher.co.uk/images/deal/27493856/1775400.jpg"
            },
            "La Roche-Posay Anthelios Melt-in Milk Sunscreen SPF 60": {
                "Deluxe": "https://media.ulta.com/i/ulta/2236414?w=1080&h=1080&fmt=auto"
            },
            "Essie Ballet Slippers": {
                "Pro": "https://www.lookfantastic.ie/images?url=https://static.thcdn.com/productimg/original/11157771-4014968215088315.jpg&format=webp&auto=avif&width=985&height=985&fit=cover&dpr=2"
            },
            "Fenty Gloss Bomb": {
                "Mini": "https://m.media-amazon.com/images/I/71SSd+EpWXL._SL1500_.jpg"
            },
            "Dove Deep Moisture Body Wash": {
                "Pro": "https://m.media-amazon.com/images/I/71Ug3PJs0oL._SL1500_.jpg"
            },
            "SheaMoisture Raw Shea Butter Restorative Conditioner": {
                "Deluxe": "https://media.superdrug.com//medias/sys_master/prd-images/he8/ha7/10627813081118/prd-ls4-708635_600x600/prd-ls4-708635-600x600.jpg",
                "Mini": "https://www.beautyclick.co.ke/wp-content/smush-webp/2024/01/SheaMoistureRawSheaButterDeepMoisturizingRestorativeConditioner-384mL.jpg.webp"
            },
            "NYX Butter Gloss": {
                "Deluxe": "https://www.nyxcosmetics.co.uk/dw/image/v2/AAQP_PRD/on/demandware.static/-/Sites-nyx-master-catalog/default/dw8196f9a9/PDPV2-Assets/NYX_089/NYX-PMU-Makeup-Lip-Lip-Gloss-BUTTER-GLOSS-BLING-BLGB01-BRING-THE-BLING-0800897255428-PackshotWithTexture.jpg?sw=1050&sh=1050&sm=cut&sfrm=jpeg&q=70"
            },
            "Too Faced Better Than Sex Mascara": {
                "Edition": "https://media.kohlsimg.com/is/image/kohls/ab928309625341b0886b3af13e6eec0713b9efc8?wid=805&hei=805&op_sharpen=1"
            },
            "Pantene Pro-V Daily Moisture Renewal Shampoo": {
                "Pro": "https://images.ctfassets.net/11glknwkozoe/322MhMEoGeYek59lpFxsZ2/b8fe5250d57a1f792b84bdea16788806/Pantene_Daily-Moisture_SHP_1563X1458_020420.png?fm=webp&q=75"
            },
            "L'Oréal True Match Concealer": {
                "Edition": "https://www.lookfantastic.com/images?url=https://static.thcdn.com/productimg/original/15216239-2505232038854008.jpg&format=webp&auto=avif&width=985&height=985&fit=cover&dpr=2",
                "Pro": "https://www.lookfantastic.com/images?url=https://static.thcdn.com/productimg/original/15216239-2505232038854008.jpg&format=webp&auto=avif&width=985&height=985&fit=cover&dpr=2"
            },
            "Charlotte Tilbury Airbrush Flawless Foundation": {
                "Pro": "https://www.cultbeauty.com/images?url=https://static.thcdn.com/productimg/original/17165090-1555265501716607.jpg&format=webp&auto=avif&width=1200&height=1200&fit=cover&dpr=2",
                "Mini": "https://houseofbeauty.co.uk/public/files/productphoto/org/ctairbrush.jpg"
            },
            "Neutrogena Ultra Sheer Dry-Touch SPF 55": {
                "Deluxe": "https://images.ctfassets.net/bcjr30vxh6td/rsxMVyeMGbNsndAZQpHtP/06a1257abd4c07dd6fcb1976cb9f8c57/6868790_Carousel1.webp?fm=webp&w=1920"
            },
            "NARS Radiant Creamy Concealer": {
                "Deluxe": "https://www.narscosmetics.com.hk/dw/image/v2/BCSK_PRD/on/demandware.static/-/Sites-itemmaster_NARS/default/dw98380c4e/alt1/NARS_SP24_ComplexionRepromote_PDPCrop_RCC_Benefits_GLBL_2000x2000.jpg?sw=856&sh=750&sm=fit"
            },
            "The Ordinary Niacinamide 10% + Zinc 1%": {
                "Mini": "https://www.cultbeauty.com/images?url=https://static.thcdn.com/productimg/original/12243648-2075232038854080.jpg&format=webp&auto=avif&width=985&height=985&fit=cover&dpr=2"
            },
            "Neutrogena Hydro Boost Water Gel": {
                "Edition": "https://images.ctfassets.net/bcjr30vxh6td/249vyCPCWOePqx9Reg2Y7O/217ce1ad98092d44f138083ad7a1e1c0/6811047_Carousel_1.webp?fm=webp&w=1920"
            },
            "Marc Jacobs Daisy": {
                "Deluxe": "https://ik.imagekit.io/scentfied/products/marc-jacobs-daisy-eau-so-intense-edp.webp?tr=w-1280%2Ch-1280%2Cc-maintain_ratio%2Cfo-auto"
            },
            "Urban Decay Naked Eyeshadow Palette": {
                "Pro": "https://media.vogue.co.uk/photos/5d5447bfc6ae3400088a3db3/2:3/w_2240,c_limit/604214916630_naked.jpg"
            },
            "La Roche-Posay Toleriane Hydrating Cleanser": {
                "Pro": "https://m.media-amazon.com/images/I/717F3ObzIeL._SL1500_.jpg"
            },
            "Head & Shoulders Classic Clean Shampoo": {
                "Deluxe": "https://cdn.salla.sa/DGdDlG/f770b50b-62f7-45e1-aa34-494169d83a60-1000x1000-IBu9TdN0YrEyOmmGx0Mb195tE00HNe5yOhXeoJwZ.jpg"
            }
        }


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
            {"first_name": "Justin", "last_name": "Kipkorir", "username": "justin", "email": "justin@pambo.com"},
            {"first_name": "Test", "last_name": "Admin", "username": "testadmin", "email": "admins@pambo.com"}
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
            ("Maybelline Fit Me Foundation", "Matte finish foundation for oily skin.", "MakeUp", "Face"),
            ("L'Oréal True Match Concealer", "Lightweight concealer that blends perfectly.", "MakeUp", "Face"),
            ("Benefit Hoola Bronzer", "Soft matte bronzer with natural glow.", "MakeUp", "Face"),
            ("Fenty Beauty Pro Filt'r Soft Matte Foundation", "Full coverage with soft matte finish.", "MakeUp", "Face"),
            ("NARS Radiant Creamy Concealer", "Iconic under-eye concealer.", "MakeUp", "Face"),
            ("Charlotte Tilbury Airbrush Flawless Foundation", "Weightless, full coverage foundation.", "MakeUp", "Face"),
            ("MAC Ruby Woo Lipstick", "Signature blue-red matte lipstick.", "MakeUp", "Lips"),
            ("NYX Butter Gloss", "High-shine lip gloss with butter smooth feel.", "MakeUp", "Lips"),
            ("Maybelline SuperStay Matte Ink", "Long lasting liquid lipstick.", "MakeUp", "Lips"),
            ("Fenty Gloss Bomb", "Universal lip luminizer.", "MakeUp", "Lips"),
            ("YSL Rouge Volupté Shine", "Luxurious hydrating lipstick.", "MakeUp", "Lips"),
            ("Too Faced Better Than Sex Mascara", "Volumizing & dramatic curl mascara.", "MakeUp", "Eyes"),
            ("Urban Decay Naked Eyeshadow Palette", "12 neutral shades for day or night look.", "MakeUp", "Eyes"),
            ("Maybelline Eyestudio Gel Liner", "Intense black waterproof gel liner.", "MakeUp", "Eyes"),
            ("Benefit Roller Lash Mascara", "Lifted curl for short lashes like lash curler.", "MakeUp", "Eyes"),
            ("Huda Beauty Desert Dusk Palette", "Exotic eyeshadow shades.", "MakeUp", "Eyes"),
            ("OPI Nail Lacquer Big Apple Red", "Classic red nail polish.", "MakeUp", "Nails"),
            ("Sally Hansen Miracle Gel", "Longwear gel-like nail color.", "MakeUp", "Nails"),
            ("Essie Ballet Slippers", "Soft pink nail polish.", "MakeUp", "Nails"),
            ("CeraVe Moisturizing Cream", "Hydrating cream with ceramides.", "Skincare", "Face"),
            ("Neutrogena Hydro Boost Water Gel", "Lightweight gel moisturizer.", "Skincare", "Face"),
            ("La Roche-Posay Toleriane Hydrating Cleanser", "Gentle face wash for sensitive skin.", "Skincare", "Face"),
            ("The Ordinary Niacinamide 10% + Zinc 1%", "Best-selling serum.", "Skincare", "Face"),
            ("Aveeno Daily Moisturizing Lotion", "Oatmeal body lotion for dry skin.", "Skincare", "Body"),
            ("Dove Deep Moisture Body Wash", "Cleanses & hydrates without stripping.", "Skincare", "Body"),
            ("Neutrogena Ultra Sheer Dry-Touch SPF 55", "Lightweight sunscreen", "Skincare", "Sun Care"),
            ("La Roche-Posay Anthelios Melt-in Milk Sunscreen SPF 60", "Broad spectrum sun protection.", "Skincare", "Sun Care"),
            ("Chanel Coco Mademoiselle Eau de Parfum", "Classic women's fragrance.", "Fragrance", "Women"),
            ("Dior J'adore Eau de Parfum", "Elegant floral perfume.", "Fragrance", "Women"),
            ("Marc Jacobs Daisy", "Playful fresh floral scent.", "Fragrance", "Women"),
            ("Creed Aventus", "Bold masculine citrus & smoky scent.", "Fragrance", "Men"),
            ("Bleu de Chanel Eau de Toilette", "Fresh woody men's fragrance.", "Fragrance", "Men"),
            ("Pantene Pro-V Daily Moisture Renewal Shampoo", "Hydrating shampoo for dry hair.", "Haircare", "Shampoo"),
            ("Head & Shoulders Classic Clean Shampoo", "Dandruff shampoo that cleans scalp.", "Haircare", "Shampoo"),
            ("Tresemmé Moisture Rich Conditioner", "Deep moisture conditioner.", "Haircare", "Conditioner"),
            ("SheaMoisture Raw Shea Butter Restorative Conditioner", "For curly, dry hair.", "Haircare", "Conditioner"),
            ("Got2b Ultra Glued Styling Gel", "Extreme hold hair gel.", "Haircare", "Styling"),
            ("Moroccanoil Treatment", "Argan oil hair treatment product.", "Haircare", "Treatments"),
            ("Real Techniques Miracle Complexion Sponge", "Beauty sponge for blending foundation.", "Accessories", "Sponges"),
            ("Sigma F80 Flat Kabuki Brush", "Buffing makeup brush.", "Accessories", "Brushes"),
            ("Morphe M439 Deluxe Buffer Brush", "Top-selling face brush.", "Accessories", "Brushes"),
            ("Tweezerman Stainless Steel Slant Tweezer", "Precision tweezer for brows.", "Accessories", "Tools"),
            ("Beauty Blender Solid Cleanser", "Tool cleanser bar.", "Accessories", "Tools"),
            ("Ipsy Glam Bag", "Makeup bag subscription pouch.", "Accessories", "Bags"),
            ("Sephora Collection Makeup Organizer Bag", "Function meets style.", "Accessories", "Bags"),
        ]
        products = []
        with db.session.no_autoflush:
            for _ in range(100):
                sample = random.choice(product_samples)
                variant_options = ['Mini', 'Pro', 'Deluxe', 'Edition']
                variant = random.choice(variant_options)
                
                base_name = sample[0]
                variant_name = f"{base_name} {variant}"
                
                # Get the image URL
                product_urls = image_links.get(base_name, {})
                image_url = product_urls.get(variant)

                # Fallback if specific variant URL is not found
                if not image_url and product_urls:
                    # 'Default' is for products without variants like Aveeno
                    image_url = product_urls.get('Default') or random.choice(list(product_urls.values()))
                
                # Final fallback to a placeholder if no URLs are found for the product
                if not image_url:
                    # Using a well-known placeholder service
                    image_url = "https://cdn.fynd.com/v2/falling-surf-7c8bb8/fyprod/wrkr/products/pictures/item/free/resize-w:1024/000000000494341982/DWrBuFTDk_O-000000000494341982_1.jpg"

                category_obj = next(c for c in categories if c.category_name == sample[2])
                subcategory_obj = next(sc for sc in subcategories if sc.sub_category_name == sample[3] and sc.category.category_name == sample[2])
                
                stock_qty = random.randint(10, 200)

                product = Product(
                    product_name=variant_name,
                    description=sample[1],
                    price=round(random.uniform(5, 200), 2),
                    stock_qty=stock_qty,
                    image_url=image_url,
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