"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InputField } from "@/components/ui/InputField"; // <-- import

export default function SignupPage() {
  const router = useRouter();
  const [registrationType, setRegistrationType] = useState("INDIVIDUAL");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(e.target);
    formData.append("registrationType", registrationType);

    const res = await fetch("/api/auth/signup", { method: "POST", body: formData });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      if (data.firmCode) alert(`Your Firm Registration Code: ${data.firmCode}`);
      router.replace(data.redirect);
      e.target.reset();
    } else setMessage(data.error);
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 dark:bg-gray-950 p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-2xl shadow-xl p-8">

        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
          Create Your Account
        </h2>

        {/* SELECT USER TYPE TABS */}
        <div className="grid grid-cols-3 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 mb-8">
          {[
            { key: "INDIVIDUAL", label: "Individual" },
            { key: "FIRM_OWNER", label: "Firm Registration" },
            { key: "EMPLOYEE", label: "Join Firm" },
          ].map((t) => (
            <button
              type="button"
              key={t.key}
              onClick={() => setRegistrationType(t.key)}
              className={`py-2 text-sm font-semibold transition
                ${registrationType === t.key ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-300"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">

          {/* COMMON FIELDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InputField label="Full Name (Owner)" name="name" />
            <InputField label="Email Address" type="email" name="email" />

            <InputField label="Mobile Number" name="mobile" />
            <InputField label="Date of Birth" type="date" name="dob" />

            <InputField label="Aadhaar / PAN Number" name="adharPan" />
            <InputField label="Upload Profile Pic" type="file" name="file" />
          </div>

          {/* FIRM OWNER */}
          <AnimatePresence>
            {registrationType === "FIRM_OWNER" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="text-lg font-semibold mt-4 text-gray-700 dark:text-gray-300">
                  Firm Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
                  <InputField label="Firm Name" name="firmName" />
                  <InputField label="Firm GST / Registration Number" name="gstNumber" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* EMPLOYEE */}
          <AnimatePresence>
            {registrationType === "EMPLOYEE" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-4">
                  Join Existing Firm
                </h3>
                <InputField label="Firm Referral Code" name="firmCode" />
              </motion.div>
            )}
          </AnimatePresence>

          <InputField label="Password" type="password" name="password" />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 
              text-white font-semibold rounded-xl shadow transition">
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        {message && <p className="text-center text-red-500 mt-3">{message}</p>}

        <button
          onClick={() => router.push("/login")}
          className="mt-5 w-full py-2 rounded-lg bg-gray-200 dark:bg-gray-800 
            text-gray-800 dark:text-white hover:bg-gray-300 transition">
          Already have an account? Login
        </button>

      </motion.div>
    </div>
  );
}
