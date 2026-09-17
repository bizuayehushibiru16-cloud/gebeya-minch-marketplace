const jwt = require("jsonwebtoken");
const db = require("../db");


// ======================================
// AUTH MIDDLEWARE
// ======================================

function auth(req, res, next) {

  try {

    const header =
      req.headers.authorization;

    if (!header) {

      return res.status(401).json({
        error: "Authentication required."
      });

    }

    if (
      !header.startsWith("Bearer ")
    ) {

      return res.status(401).json({
        error: "Invalid authorization format."
      });

    }

    const token =
      header.substring(7);

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
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
          status,
          created_at

        FROM users

        WHERE id = ?
      `).get(decoded.id);

    if (!user) {

      return res.status(401).json({
        error: "User not found."
      });

    }

    if (
      user.status !== "active"
    ) {

      return res.status(403).json({
        error: "Account is not active."
      });

    }

    req.user = user;

    next();

  } catch (error) {

    console.error(
      "Authentication error:",
      error.message
    );

    return res.status(401).json({
      error: "Invalid or expired token."
    });

  }

}


// ======================================
// ADMIN MIDDLEWARE
// ======================================

function admin(req, res, next) {

  if (!req.user) {

    return res.status(401).json({
      error: "Authentication required."
    });

  }

  if (
    req.user.role !== "admin"
  ) {

    return res.status(403).json({
      error: "Admin access required."
    });

  }

  next();

}


module.exports = {
  auth,
  admin
};
