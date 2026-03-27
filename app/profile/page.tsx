"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/* ✅ FRONTEND SAFE USER TYPE */
type AuthUser = {
  id: number;
  name: string;
  email: string;
  role?: string;
  subscription: boolean;
  createdAt?: string;
  isActive?: boolean;
  docUrl?: string | null;
};

export default function ProfilePage() {
  const { user, loading, logout } = useAuth() as {
    user: AuthUser | null;
    loading: boolean;
    logout: () => void;
  };

  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg dark:bg-gray-900">
          <CardHeader className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={
                  user.docUrl
                    ? `/uploads/user_docs/${user.docUrl}`
                    : "/default-avatar.png"
                }
              />
              <AvatarFallback className="bg-blue-600 text-white text-2xl">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <CardTitle className="text-2xl text-center">
              {user.name}
            </CardTitle>

            <p className="text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="Name" value={user.name} />
              <InfoItem label="Email" value={user.email} />
              <InfoItem label="Role" value={user.role || "User"} />
              <InfoItem
                label="Subscription"
                value={user.subscription ? "Active" : "Free Trial"}
              />
              <InfoItem
                label="Joined On"
                value={formatDate(user.createdAt)}
              />
              <InfoItem
                label="Account Status"
                value={user.isActive ? "Active" : "Inactive"}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => router.push("/profile/edit")}
              >
                Edit Profile
              </Button>

              <Button
                variant="destructive"
                className="w-full"
                onClick={logout}
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- Helpers ---------------- */

function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-semibold text-gray-800 dark:text-white">
        {value || "-"}
      </p>
    </div>
  );
}

function formatDate(date?: string) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString();
}