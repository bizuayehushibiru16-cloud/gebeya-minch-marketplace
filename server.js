require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const db = require("./db");

const {
  auth,
  admin
} = require("./middleware/auth");

const app = express();

const PORT = process.env.PORT || 3000;


// ======================================
// MIDDLEWARE
// ======================================

app.use(cors());

app.use(
  express.json({
    limit: "5mb"
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "5mb"
  })
);


// ======================================
// UPLOAD DIRECTORY
// ======================================

const uploadDir =
  path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true
  });
}


// ======================================
// FILE UPLOAD
// ======================================

const storage = multer.diskStorage({

  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function(req, file, cb) {

    const ext =
      path.extname(file.originalname);

    const name =
      Date.now() +
      "-" +
      Math.round(
        Math.random() * 1000000000
      ) +
      ext;

    cb(null, name);
  }

});


const upload = multer({

  storage: storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 8
  },

  fileFilter: function(req, file, cb) {

    if (
      file.mimetype &&
      file.mimetype.startsWith("image/")
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only image files are allowed."
        )
      );
    }

  }

});


// ======================================
// STATIC FILES
// ======================================

app.use(
  "/uploads",
  express.static(uploadDir)
);

app.use(
  "/",
  express.static(
    path.join(__dirname, "public")
  )
);


// ======================================
// HELPER FUNCTIONS
// ======================================

function createToken(user) {

  return jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );

}


function cleanProduct(product) {

  if (!product) {
    return null;
  }

  const images =
    db.prepare(`
      SELECT id, url
      FROM product_images
      WHERE product_id = ?
      ORDER BY id
    `).all(product.id);

  return {
    ...product,

    negotiable:
      Boolean(product.negotiable),

    featured:
      Boolean(product.featured),

    trusted:
      Boolean(product.trusted),

    images
  };

}


// ======================================
// AUTH - REGISTER
// ======================================

app.post(
  "/api/auth/register",
  async function(req, res) {

    try {

      const {
        name,
        email,
        phone,
        password,
        city
      } = req.body;

      if (
        !name ||
        !email ||
        !password
      ) {

        return res.status(400).json({
          error:
            "Name, email and password are required."
        });

      }

      if (password.length < 6) {

        return res.status(400).json({
          error:
            "Password must be at least 6 characters."
        });

      }

      const existing =
        db.prepare(`
          SELECT id
          FROM users
          WHERE email = ?
        `).get(email);

      if (existing) {

        return res.status(409).json({
          error:
            "Email already registered."
        });

      }

      const hash =
        await bcrypt.hash(
          password,
          10
        );

      const result =
        db.prepare(`
          INSERT INTO users
          (
            name,
            email,
            phone,
            password_hash,
            city
          )
          VALUES (?, ?, ?, ?, ?)
        `).run(
          name,
          email,
          phone || "",
          hash,
          city || ""
        );

      const user =
        db.prepare(`
          SELECT
            id,
            name,
            email,
            phone,
            city,
            role,
            status
          FROM users
          WHERE id = ?
        `).get(
          result.lastInsertRowid
        );

      const token =
        createToken(user);

      res.json({
        message:
          "Registration successful.",
        token,
        user
      });

    }
