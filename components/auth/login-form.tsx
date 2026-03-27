"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [loginMode, setLoginMode] = useState<"email" | "mobile">("email");

  const handleToggle = () => {
    setLoginMode(prev => (prev === "email" ? "mobile" : "email"));
    setMessage("");
  };

  function validate(form: HTMLFormElement, mode: "email" | "mobile") {
    const email = (form.email as HTMLInputElement)?.value;
    const mobile = (form.mobile as HTMLInputElement)?.value;
    const password = (form.password as HTMLInputElement).value;

    if (mode === "email") {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return "Invalid email format";
      }
    }

    if (mode === "mobile") {
      if (!mobile || !/^\d{10}$/.test(mobile)) {
        return "Mobile number must be 10 digits";
      }
    }

    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      return "Password must be 8+ chars with 1 uppercase & 1 number";
    }

    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    const form = e.currentTarget;

    const validationError = validate(form, loginMode);
    if (validationError) {
      setMessage("❌ " + validationError);
      return;
    }

    setLoading(true);

    const payload: any = {
      mode: loginMode,
      password: form.password.value,
    };

    if (loginMode === "email") {
      payload.email = form.email.value;
    } else {
      payload.mobile = form.mobile.value;
    }

    let res: Response;
    let data: any = null;

    try {
      res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 🔥 REQUIRED for Amplify cookies
        body: JSON.stringify(payload),
      });

      try {
        data = await res.json(); // safe parse
      } catch {
        data = null;
      }

      if (!res.ok) {
        throw new Error(data?.error || "Login failed. Please try again.");
      }

      router.push("/");
    } catch (err: any) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {loginMode === "email" ? (
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full border p-2 rounded"
            />
          ) : (
            <input
              name="mobile"
              placeholder="Mobile No"
              className="w-full border p-2 rounded"
            />
          )}

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full border p-2 rounded"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Logging..." : "Login"}
          </button>

          <button
            type="button"
            onClick={handleToggle}
            className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
          >
            Switch to {loginMode === "email" ? "Mobile" : "Email"} Login
          </button>

          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Switch to Signup
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-red-600">{message}</p>
        )}

        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-4 w-full text-gray-600 hover:underline"
        >
          Close
        </button>
      </div>
    </div>
  );
}
