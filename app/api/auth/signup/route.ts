export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { sendFirmRegistrationMail } from "@/lib/mail";
import { uploadToLocal } from "@/lib/uploadToS3";

/* ===============================
   HELPERS
================================ */

// Generate firm code
function generateFirmCode() {
  return (
    Math.random().toString(36).substring(2, 8).toUpperCase() +
    Math.random().toString(36).substring(2, 6).toUpperCase()
  );
}

/* ===============================
   SIGNUP ROUTE
================================ */

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const role = formData.get("registrationType") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const mobile = formData.get("mobile") as string;
    const dob = new Date(formData.get("dob") as string);
    const adharPan = formData.get("adharPan") as string;
    const password = formData.get("password") as string;
    const file = formData.get("file") as File | null;

    // Firm fields
    const firmName = formData.get("firmName") as string;
    const gstNumber = formData.get("gstNumber") as string;
    const firmCodeInput = formData.get("firmCode") as string;

    /* ===============================
       BASIC VALIDATION
    ================================ */
    if (!name || !email || !mobile || !password || !role || !file) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      );
    }

    /* ===============================
       FILE VALIDATION
    ================================ */
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type" },
        { status: 400 }
      );
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 2MB)" },
        { status: 400 }
      );
    }

    /* ===============================
       USER EXISTS CHECK
    ================================ */
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { mobile }, { adharPan }] },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    /* ===============================
       FILE UPLOAD (S3)
    ================================ */
    const uploadRes = await uploadToLocal(file, "user_docs");

    const hashedPassword = await bcrypt.hash(password, 10);

    let createdUser: any;
    let newFirmCode: string | null = null;

    /* ===============================
       FIRM OWNER
    ================================ */
    if (role === "FIRM_OWNER") {
      newFirmCode = generateFirmCode();

      const firm = await prisma.firm.create({
        data: {
          firmName,
          gstNumber,
          firmCode: newFirmCode,
          owner: {
            create: {
              name,
              email,
              mobile,
              dob,
              adharPan,
              docUrl: uploadRes.url,
              password: hashedPassword,
              role: "FIRM_OWNER",
            },
          },
        },
        include: { owner: true },
      });

      createdUser = firm.owner;

      await sendFirmRegistrationMail({
        to: email,
        ownerName: name,
        firmName,
        firmCode: newFirmCode,
      });
    }

    /* ===============================
       EMPLOYEE
    ================================ */
    else if (role === "EMPLOYEE") {
      if (!firmCodeInput) {
        return NextResponse.json(
          { error: "Firm code required" },
          { status: 400 }
        );
      }

      const firm = await prisma.firm.findUnique({
        where: { firmCode: firmCodeInput.toUpperCase() },
      });

      if (!firm) {
        return NextResponse.json(
          { error: "Invalid firm code" },
          { status: 404 }
        );
      }

      createdUser = await prisma.user.create({
        data: {
          name,
          email,
          mobile,
          dob,
          adharPan,
          docUrl: uploadRes.url,
          password: hashedPassword,
          role: "EMPLOYEE",
          firmId: firm.id,
        },
      });
    }

    /* ===============================
       INDIVIDUAL
    ================================ */
    else {
      createdUser = await prisma.user.create({
        data: {
          name,
          email,
          mobile,
          dob,
          adharPan,
          docUrl: uploadRes.url,
          password: hashedPassword,
          role: "INDIVIDUAL",
        },
      });
    }

    /* ===============================
       JWT + COOKIE
    ================================ */
    const token = await signToken({
      id: createdUser.id,
      email: createdUser.email,
      subscription: createdUser.subscription,
    });

    const res = NextResponse.json({
      success: true,
      user: {
        id: createdUser.id,
        name: createdUser.name,
        role: createdUser.role,
      },
      firmCode: newFirmCode,
      redirect: "/",
    });

    res.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err: any) {
    console.error("SIGNUP ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
