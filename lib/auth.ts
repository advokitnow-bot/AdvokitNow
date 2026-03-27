import { jwtVerify, SignJWT, JWTPayload } from "jose";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET!;
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface JwtPayload {
  id: number;
  email: string;
  subscription: boolean;
  [key: string]: unknown;   // ⭐ REQUIRED FOR JOSE
}

/**
 * Generate JWT
 */
export async function signToken(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secretKey);
}

/**
 * Verify JWT
 */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as JwtPayload;
  } catch (err) {
    console.error("JWT verify error:", err);
    return null;
  }
}

export async function getUserFromToken(token: string) {
  try {
    const decoded = await verifyToken(token);
    if (!decoded) return null;

    return await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, subscription: true },
    });
  } catch (err) {
    console.error("getUser error:", err);
    return null;
  }
}