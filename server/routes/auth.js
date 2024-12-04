import { Router } from "express";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import pgPkg from "pg";
import 'dotenv/config';

const { Client } = pgPkg;
const router = Router();

// Database connection
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

client.connect()
  .then(() => console.log("Connected to database for Auth"))
  .catch((err) => console.error("Database connection error:", err));

// Utility: Validate email format
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Register User Route
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const hashedPassword = await hash(password, 10);
    const userCheck = await client.query(`SELECT * FROM Users WHERE email = $1`, [email]);

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    await client.query(`INSERT INTO Users (email, password_hash) VALUES ($1, $2)`, [email, hashedPassword]);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const userResult = await client.query(`SELECT * FROM Users WHERE email = $1`, [email]);
    const user = userResult.rows[0];

    if (!user || !(await compare(password, user.password_hash))) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Error during login" });
  }
});

export default router;
