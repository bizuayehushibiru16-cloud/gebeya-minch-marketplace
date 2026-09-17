const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, {
    recursive: true
  });
}

const dbPath = path.join(
  dataDir,
  "gebya-minch.db"
);

const db = new Database(dbPath);

db.pragma("foreign_keys = ON");


// ===============================
// USERS
// ===============================

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  city TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  status TEXT NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);


// ===============================
// PRODUCTS
// ===============================

db.exec(`
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  negotiable INTEGER DEFAULT 0,
  condition TEXT DEFAULT 'Used',
  city TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  featured INTEGER DEFAULT 0,
  trusted INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
`);


// ===============================
// PRODUCT IMAGES
// ===============================

db.exec(`
CREATE TABLE IF NOT EXISTS product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  url TEXT NOT NULL,

  FOREIGN KEY(product_id)
    REFERENCES products(id)
    ON DELETE CASCADE
);
`);


// ===============================
// FAVORITES
// ===============================

db.exec(`
CREATE TABLE IF NOT EXISTS favorites (
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY(user_id, product_id),

  FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  FOREIGN KEY(product_id)
    REFERENCES products(id)
    ON DELETE CASCADE
);
`);


// ===============================
// BUSINESSES
// ===============================

db.exec(`
CREATE TABLE IF NOT EXISTS businesses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  phone TEXT,
  telegram TEXT,
  address TEXT,
  city TEXT,
  hours TEXT,
  logo TEXT,
  cover TEXT,
  verified INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
`);


// ===============================
// MESSAGES
// ===============================

db.exec(`
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  product_id INTEGER,
  body TEXT NOT NULL,
  read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY(sender_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  FOREIGN KEY(receiver_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  FOREIGN KEY(product_id)
    REFERENCES products(id)
    ON DELETE SET NULL
);
`);


// ===============================
// REVIEWS
// ===============================

db.exec(`
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY(product_id)
    REFERENCES products(id)
    ON DELETE CASCADE,

  FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
`);


// ===============================
// REPORTS
// ===============================

db.exec(`
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY(product_id)
    REFERENCES products(id)
    ON DELETE CASCADE,

  FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
`);


// ===============================
// PAYMENTS
// ===============================

db.exec(`
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  product_id INTEGER,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  provider TEXT,
  reference TEXT,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  FOREIGN KEY(product_id)
    REFERENCES products(id)
    ON DELETE SET NULL
);
`);


// ===============================
// ANNOUNCEMENTS
// ===============================

db.exec(`
CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);


// ===============================
// ADMIN ACCOUNT
// ===============================

const adminEmail =
  process.env.ADMIN_EMAIL ||
  "admin@gebyaminch.local";

const adminPassword =
  process.env.ADMIN_PASSWORD ||
  "ChangeMe123!";

const existingAdmin = db
  .prepare(`
    SELECT id
    FROM users
    WHERE email = ?
  `)
  .get(adminEmail);

if (!existingAdmin) {

  const hash = bcrypt.hashSync(
    adminPassword,
    10
  );

  db.prepare(`
    INSERT INTO users
    (
      name,
      email,
      password_hash,
      city,
      role,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    "Gebya Minch Admin",
    adminEmail,
    hash,
    "Hawassa",
    "admin",
    "active"
  );

}


// ===============================
// DEMO SELLER
// ===============================

let seller = db
  .prepare(`
    SELECT id
    FROM users
    WHERE email = ?
  `)
  .get(
    "seller@gebyaminch.local"
  );

if (!seller) {

  const hash = bcrypt.hashSync(
    "Seller123!",
    10
  );

  const result = db.prepare(`
    INSERT INTO users
    (
      name,
      email,
      phone,
      password_hash,
      city,
      role,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    "Demo Seller",
    "seller@gebyaminch.local",
    "+251916001122",
    hash,
    "Hawassa",
    "user",
    "active"
  );

  seller = {
    id: result.lastInsertRowid
  };

}


// ===============================
// DEMO PRODUCTS
// ===============================

const productCount = db
  .prepare(`
    SELECT COUNT(*) AS count
    FROM products
  `)
  .get().count;

if (productCount === 0) {

  const insertProduct =
    db.prepare(`
      INSERT INTO products
      (
        user_id,
        title,
        category,
        price,
        negotiable,
        condition,
        city,
        description,
        status,
        featured,
        trusted
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

  insertProduct.run(
    seller.id,
    "iPhone 14 Pro Max 256GB",
    "Phones & Tablets",
    115000,
    1,
    "New",
    "Hawassa",
    "Brand new iPhone 14 Pro Max 256GB.",
    "approved",
    1,
    1
  );

  insertProduct.run(
    seller.id,
    "Toyota Executive Suzuki Dzire 2023",
    "Vehicles",
    2350000,
    1,
    "New",
    "Arba Minch",
    "Well maintained Suzuki Dzire 2023.",
    "approved",
    1,
    1
  );

  insertProduct.run(
    seller.id,
    "Dell XPS 15 Intel i7 16GB RAM",
    "Electronics",
    75000,
    0,
    "Used",
    "Wolaita Sodo",
    "Dell XPS 15 with Intel Core i7 and 16GB RAM.",
    "approved",
    0,
    1
  );

  insertProduct.run(
    seller.id,
    "Men's Designer Leather Jackets",
    "Clothing",
    3500,
    1,
    "New",
    "Hawassa",
    "High quality men's leather jackets.",
    "approved",
    0,
    0
  );

}


// ===============================
// DEMO BUSINESS
// ===============================

const businessCount = db
  .prepare(`
    SELECT COUNT(*) AS count
    FROM businesses
  `)
  .get().count;

if (businessCount === 0) {

  db.prepare(`
    INSERT INTO businesses
    (
      user_id,
      name,
      description,
      phone,
      telegram,
      address,
      city,
      hours,
      verified
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    seller.id,
    "Ethio Phone Store",
    "Samsung and iPhone retailer.",
    "+251916001122",
    "gebyaseller",
    "Hawassa Piassa, next to Central Mall",
    "Hawassa",
    "Monday-Saturday 8:30 AM-7:00 PM",
    1
  );

}


module.exports = db;
