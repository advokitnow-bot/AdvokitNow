"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

function SubscribeContent() {
  const params = useSearchParams();
  const router = useRouter();
  const plan = params.get("plan") || "Pro";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl"
      >
        <Card className="shadow-xl bg-white dark:bg-gray-900 dark:text-white">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Subscribe to {plan} Plan
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-lg">
                You are choosing the <b>{plan}</b> subscription.
              </p>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Secure payment integration will be added here.
              </p>
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => alert("Payment Integration Pending")}
            >
              Proceed to Payment
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/")}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubscribeContent />
    </Suspense>
  );
}