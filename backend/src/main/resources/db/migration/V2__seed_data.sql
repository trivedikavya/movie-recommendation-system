-- Seed Brand: Zara India Lite
-- Password: "password" (BCrypt hashed)
INSERT INTO brands (store_name, email, password_hash, whatsapp_number, meta_access_token, webhook_token, discount_percent, logo_url)
VALUES (
    'Zara India Lite',
    'brand@chatcart.com',
    '$2a$10$8.K38VM5Hq48k0mK/5wT/e6mX37Ww6.Qv221k3k0BfW/g8nO9sJ4G',
    '+919876543210',
    'mock_meta_token_123',
    'chatcart_verify_token',
    10,
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'
);

-- Seed Products for Brand ID 1
-- Under 1000
INSERT INTO products (brand_id, name, price, category, colours, image_url, in_stock)
VALUES (
    1,
    'Oversized Black Graphic Tee',
    899.00,
    'T-Shirts',
    'Black',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500',
    TRUE
);

INSERT INTO products (brand_id, name, price, category, colours, image_url, in_stock)
VALUES (
    1,
    'Minimalist Grey Melange Tee',
    699.00,
    'T-Shirts',
    'White/Grey',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
    TRUE
);

-- Around 2000 (1000 to 2999)
INSERT INTO products (brand_id, name, price, category, colours, image_url, in_stock)
VALUES (
    1,
    'Classic White Cotton Shirt',
    1299.00,
    'Shirts',
    'White/Grey',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500',
    TRUE
);

INSERT INTO products (brand_id, name, price, category, colours, image_url, in_stock)
VALUES (
    1,
    'Slim Fit Black Jeans',
    1999.00,
    'Jeans',
    'Black',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500',
    TRUE
);

INSERT INTO products (brand_id, name, price, category, colours, image_url, in_stock)
VALUES (
    1,
    'Navy Blue Chino Trousers',
    2499.00,
    'Trousers',
    'Navy/Blue',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500',
    TRUE
);

INSERT INTO products (brand_id, name, price, category, colours, image_url, in_stock)
VALUES (
    1,
    'Ripped Blue Denim Jeans',
    1499.00,
    'Jeans',
    'Navy/Blue',
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
    TRUE
);

INSERT INTO products (brand_id, name, price, category, colours, image_url, in_stock)
VALUES (
    1,
    'Navy Linen Shirt',
    1899.00,
    'Shirts',
    'Navy/Blue',
    'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=500',
    TRUE
);

INSERT INTO products (brand_id, name, price, category, colours, image_url, in_stock)
VALUES (
    1,
    'Charcoal Grey Smart Trousers',
    2199.00,
    'Trousers',
    'White/Grey',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500',
    TRUE
);

-- 3000+
INSERT INTO products (brand_id, name, price, category, colours, image_url, in_stock)
VALUES (
    1,
    'Denim Jacket Indigo',
    3299.00,
    'Shirts',
    'Navy/Blue',
    'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500',
    TRUE
);

INSERT INTO products (brand_id, name, price, category, colours, image_url, in_stock)
VALUES (
    1,
    'Premium Leather Trousers Black',
    3999.00,
    'Trousers',
    'Black',
    'https://images.unsplash.com/photo-1551854838-212c50b4c184?w=500',
    TRUE
);

-- Seed some mock orders to look nice on dashboard
INSERT INTO orders (brand_id, customer_name, phone, address, product_name, amount, discount_applied, payment_method, status, created_at)
VALUES (
    1,
    'Arjun Mehta',
    '+919876543211',
    'Flat 405, Heights Residency, Bandra West, Mumbai, MH - 400050',
    'Classic White Cotton Shirt',
    1234.05,
    64.95,
    'UPI',
    'DELIVERED',
    CURRENT_TIMESTAMP - INTERVAL '2 days'
);

INSERT INTO orders (brand_id, customer_name, phone, address, product_name, amount, discount_applied, payment_method, status, created_at)
VALUES (
    1,
    'Priya Sharma',
    '+919876543212',
    '12/A, Sector 4, HSR Layout, Bengaluru, KA - 560102',
    'Navy Blue Chino Trousers',
    2499.00,
    0.00,
    'COD',
    'SHIPPED',
    CURRENT_TIMESTAMP - INTERVAL '1 day'
);

INSERT INTO orders (brand_id, customer_name, phone, address, product_name, amount, discount_applied, payment_method, status, created_at)
VALUES (
    1,
    'Vikram Singh',
    '+919876543213',
    'House 89, Gali 3, Karol Bagh, Delhi, DL - 110005',
    'Oversized Black Graphic Tee',
    809.10,
    89.90,
    'COD',
    'CONFIRMED',
    CURRENT_TIMESTAMP - INTERVAL '3 hours'
);

INSERT INTO orders (brand_id, customer_name, phone, address, product_name, amount, discount_applied, payment_method, status, created_at)
VALUES (
    1,
    'Anjali Nair',
    '+919876543214',
    'Villa 24, Palm Meadows, Whitefield, Bengaluru, KA - 560066',
    'Slim Fit Black Jeans',
    1999.00,
    0.00,
    'BNPL',
    'PENDING',
    CURRENT_TIMESTAMP - INTERVAL '1 hour'
);

-- Seed some messages to look nice in conversations view
INSERT INTO messages (phone, brand_id, sender, message_type, content, created_at)
VALUES ('+919876543213', 1, 'USER', 'TEXT', 'Hi, I saw your ad for the black graphic tee', CURRENT_TIMESTAMP - INTERVAL '4 hours');
INSERT INTO messages (phone, brand_id, sender, message_type, content, created_at)
VALUES ('+919876543213', 1, 'BOT', 'TEXT', 'Hey! 👋 Loving the Oversized Black Graphic Tee from our ad?', CURRENT_TIMESTAMP - INTERVAL '4 hours');
INSERT INTO messages (phone, brand_id, sender, message_type, content, created_at)
VALUES ('+919876543213', 1, 'USER', 'TEXT', 'Yes, I want it 😍', CURRENT_TIMESTAMP - INTERVAL '3 hours');
INSERT INTO messages (phone, brand_id, sender, message_type, content, created_at)
VALUES ('+919876543213', 1, 'BOT', 'TEXT', 'Great! Please provide your delivery details: Full Name, Mobile Number, and Address.', CURRENT_TIMESTAMP - INTERVAL '3 hours');
INSERT INTO messages (phone, brand_id, sender, message_type, content, created_at)
VALUES ('+919876543213', 1, 'USER', 'TEXT', 'Vikram Singh, +919876543213, House 89, Gali 3, Karol Bagh, Delhi, DL - 110005', CURRENT_TIMESTAMP - INTERVAL '3 hours');
INSERT INTO messages (phone, brand_id, sender, message_type, content, created_at)
VALUES ('+919876543213', 1, 'BOT', 'TEXT', 'Got it! How would you like to pay? Buttons: Cash on Delivery 💵, Pay with GPay / UPI, Pay later', CURRENT_TIMESTAMP - INTERVAL '3 hours');
INSERT INTO messages (phone, brand_id, sender, message_type, content, created_at)
VALUES ('+919876543213', 1, 'USER', 'TEXT', 'Cash on Delivery 💵', CURRENT_TIMESTAMP - INTERVAL '3 hours');
INSERT INTO messages (phone, brand_id, sender, message_type, content, created_at)
VALUES ('+919876543213', 1, 'BOT', 'TEXT', 'Thank you Vikram! Your order for Oversized Black Graphic Tee (amount: ₹809.10) has been confirmed via COD. 🎉', CURRENT_TIMESTAMP - INTERVAL '3 hours');
