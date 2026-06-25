CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    store_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    whatsapp_number VARCHAR(20),
    meta_access_token VARCHAR(255),
    webhook_token VARCHAR(100) NOT NULL,
    discount_percent INT DEFAULT 5,
    logo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    brand_id INT REFERENCES brands(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    colours VARCHAR(100) NOT NULL, -- Stored as comma-separated string to match plain JDBC/JPA easily
    image_url VARCHAR(511),
    in_stock BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bot_sessions (
    phone VARCHAR(20) PRIMARY KEY,
    brand_id INT REFERENCES brands(id) ON DELETE CASCADE,
    current_step VARCHAR(50) NOT NULL,
    budget INT,
    category VARCHAR(50),
    colour VARCHAR(50),
    product_id INT REFERENCES products(id) ON DELETE SET NULL,
    order_id INT,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    brand_id INT REFERENCES brands(id) ON DELETE CASCADE,
    customer_name VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    product_id INT REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    discount_applied DECIMAL(10, 2) DEFAULT 0.00,
    payment_method VARCHAR(20),
    status VARCHAR(50) DEFAULT 'PENDING',
    razorpay_payment_id VARCHAR(100),
    razorpay_payment_link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    brand_id INT REFERENCES brands(id) ON DELETE CASCADE,
    sender VARCHAR(10) NOT NULL,
    message_type VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
