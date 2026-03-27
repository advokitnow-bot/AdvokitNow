export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Safe JSON parse
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { mode, email, mobile, password } = body;

    if (!mode || !password) {
      return NextResponse.json(
        { error: "Mode and password required" },
        { status: 400 }
      );
    }

    let user = null;

    console.time("DB_QUERY");

    // EMAIL LOGIN
    if (mode === "email") {
      if (!email) {
        return NextResponse.json(
          { error: "Email required" },
          { status: 400 }
        );
      }

      user = await prisma.user.findUnique({
        where: { email },
      });
    }

    // MOBILE LOGIN
    else if (mode === "mobile") {
      if (!mobile) {
        return NextResponse.json(
          { error: "Mobile required" },
          { status: 400 }
        );
      }

      user = await prisma.user.findUnique({
        where: { mobile },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid login mode" },
        { status: 400 }
      );
    }

    console.timeEnd("DB_QUERY");

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // PASSWORD CHECK
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // TOKEN GENERATION
    const token = await signToken({
      id: user.id,
      email: user.email,
      subscription: user.subscription,
    });

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      redirect: "/",
    });

    // COOKIE (PRODUCTION SAFE)
    res.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;

  } catch (err) {
    console.error("LOGIN API ERROR:", err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}