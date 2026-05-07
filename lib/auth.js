import { jwtVerify, SignJWT } from "jose";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET;
const secretKey = new TextEncoder().encode(JWT_SECRET);

/**
 * Generate JWT
 */
export async function signToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secretKey);
}

/**
 * Verify JWT
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (err) {
    console.error("JWT verify error:", err);
    return null;
  }
}

/**
 * Get user from token
 */
export async function getUserFromToken(token) {
  try {
    const decoded = await verifyToken(token);
    if (!decoded) return null;

    return await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        subscription: true,
      },
    });
  } catch (err) {
    console.error("getUser error:", err);
    return null;
  }
}
