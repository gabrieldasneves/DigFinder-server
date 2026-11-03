// backend/src/routes/auth.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { authenticateToken } from "@/middlewares/authenticate";

const router = Router();
const prisma = new PrismaClient();

// user registration
router.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // verify email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        isVerified: false,
      },
    });

    // remove password from returned object
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ error: "Error creating user" });
  }
});

// login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    // remove password from returned object
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// logout
router.post("/logout", async (req, res) => {
  try {
    // since we are using JWT, we don't need to do anything on the server
    // the frontend should remove the token from localStorage
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

// forgot password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // generate password reset token
    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    // TODO: send email with the token
    // for now, we only return the token
    res.json({
      message: "Password reset token generated",
      resetToken, // in production, do not return the token, only send by email
    });
  } catch (error) {
    console.error("Error in forgot-password:", error);
    res.status(500).json({ error: "Failed to process password reset" });
  }
});

// get current user data
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // remove password from returned object
    const { password: _, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Error in me:", error);
    res.status(401).json({ error: "Invalid token" });
  }
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatarUrl: z.string().url().optional(),
});

router.put("/me", authenticateToken, async (req, res) => {
  try {
    const parsed = updateProfileSchema.parse(req.body);
    if (parsed.name === undefined && parsed.avatarUrl === undefined) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(parsed.name !== undefined ? { name: parsed.name } : {}),
        ...(parsed.avatarUrl !== undefined
          ? { avatarUrl: parsed.avatarUrl }
          : {}),
      },
    });

    const { password: _, ...userWithoutPassword } = updated;
    return res.json(userWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0]?.message });
    }
    console.error("Error in PUT /me:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

router.delete("/me", authenticateToken, async (req, res) => {
  try {
    // Firebase Storage files are not removed here — only DB records.
    await prisma.user.delete({ where: { id: req.user.id } });
    return res.status(204).send();
  } catch (error) {
    console.error("Error in DELETE /me:", error);
    return res.status(500).json({ error: "Failed to delete account" });
  }
});

export default router;
