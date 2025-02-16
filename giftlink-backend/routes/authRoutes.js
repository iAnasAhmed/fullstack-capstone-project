const express = require("express");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connectToDatabase = require("../models/db");
const router = express.Router();
const dotenv = require("dotenv");
const pino = require("pino");
const { body, validationResult } = require("express-validator");

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const logger = pino();

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const db = await connectToDatabase();
      const collection = db.collection("users");

      const existingUser = await collection.findOne({ email: req.body.email });
      if (existingUser) {
        logger.error("Email already exists");
        return res.status(400).json({ error: "Email already exists" });
      }

      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(req.body.password, salt);

      const newUser = await collection.insertOne({
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: hashedPassword,
        createdAt: new Date(),
      });

      const payload = { user: { id: newUser.insertedId.toString() } };
      const authtoken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

      logger.info("User registered successfully");
      res.status(201).json({ authtoken, email: req.body.email });
    } catch (error) {
      logger.error("Registration error:", error);
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  }
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const db = await connectToDatabase();
      const collection = db.collection("users");

      const user = await collection.findOne({ email: req.body.email });
      if (!user) {
        logger.error("User not found");
        return res.status(404).json({ error: "User not found" });
      }

      const isMatch = await bcryptjs.compare(req.body.password, user.password);
      if (!isMatch) {
        logger.error("Invalid credentials");
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const payload = { user: { id: user._id.toString() } };
      const authtoken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

      logger.info("User logged in successfully");
      res
        .status(200)
        .json({ authtoken, userName: user.firstName, userEmail: user.email });
    } catch (error) {
      logger.error("Login error:", error);
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  }
);

router.put(
  "/update",
  [
    body("firstName")
      .optional()
      .notEmpty()
      .withMessage("First name cannot be empty"),
    body("lastName")
      .optional()
      .notEmpty()
      .withMessage("Last name cannot be empty"),
    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error("Validation errors in update request:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const email = req.headers.email;
    if (!email) {
      logger.error("Email not found in request headers");
      return res
        .status(400)
        .json({ error: "Email not found in request headers" });
    }

    try {
      const db = await connectToDatabase();
      const collection = db.collection("users");

      const existingUser = await collection.findOne({ email });
      if (!existingUser) {
        logger.error("User not found");
        return res.status(404).json({ error: "User not found" });
      }

      const updatedData = {};
      if (req.body.firstName) updatedData.firstName = req.body.firstName;
      if (req.body.lastName) updatedData.lastName = req.body.lastName;
      if (req.body.password) {
        const salt = await bcryptjs.genSalt(10);
        updatedData.password = await bcryptjs.hash(req.body.password, salt);
      }
      updatedData.updatedAt = new Date();

      const updatedUser = await collection.findOneAndUpdate(
        { email },
        { $set: updatedData },
        { returnDocument: "after" }
      );

      const payload = { user: { id: updatedUser._id.toString() } };
      const authtoken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

      logger.info("User updated successfully");
      res.status(200).json({ authtoken });
    } catch (error) {
      logger.error("Update error:", error);
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  }
);

module.exports = router;
