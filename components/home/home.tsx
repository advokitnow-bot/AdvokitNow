"use client";
import { Bell, Moon, Sun, User, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { setTheme, theme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Image
  src="/logo.png"
  alt="AdvokitNow Logo"
  width={150}
  height={40}
  priority
/>
          <ul className="flex space-x-6 font-medium items-center">
            <li>
              <a href="#home" className="hover:text-blue-600 dark:hover:text-blue-400">
                Home
              </a>
            </li>
            <li>
              <a href="#expertise" className="hover:text-blue-600 dark:hover:text-blue-400">
                Expertise
              </a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-blue-600 dark:hover:text-blue-400">
                Pricing
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-blue-600 dark:hover:text-blue-400">
                Contact
              </a>
            </li>

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* User */}
            <li>
              {!user ? (
                <Button
                  onClick={() => router.push("/signup")}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2"
                >
                  Signup
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer">
                      <AvatarImage src={`${user.docUrl} ` || "/default-avatar.png"} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-40 dark:bg-gray-800 dark:text-white">
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    {user.subscription ? (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">Workspace</Link>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem asChild>
                        <Link href="#pricing">Explore Plans</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={logout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-6 py-20"
      >
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="md:w-1/2"
        >
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Making litigation processes easier for you
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Say goodbye to scattered files and missed deadlines. We provide the
            control and clarity you need to manage your cases efficiently, so
            you can focus on what matters most.
            <br />
            <br />
            Our platform is a powerful tool designed to simplify the complexities
            of legal work. With intuitive features for{" "}
            <b>Case Management, Document Organization</b>.
          </p>
          <Button
            onClick={() => router.push("/signup")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
          >
            Get Started
          </Button>
        </motion.div>
        <motion.img
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          src="https://cdn-icons-png.flaticon.com/512/2910/2910768.png"
          alt="Legal Management"
          className="w-80 md:w-96 mt-10 md:mt-0"
        />
      </section>

      {/* Expertise Section */}
      <section id="expertise" className="py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mt-10 mb-10">
            Our Expertise
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Case Management", desc: "Real time case track." },
              { title: "Client Handling", desc: "Maintain strong client relationships." },
              { title: "Compliance & Security", desc: "Ensure data security and legal compliance." },
            ].map((exp, idx) => (
              <Card
                key={idx}
                className="shadow-md hover:shadow-xl transition bg-white dark:bg-gray-800 dark:text-white"
              >
                <CardHeader>
                  <CardTitle>{exp.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{exp.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-gray-50 dark:bg-gray-950 py-16 transition-colors">
        <div className="max-w-7xl mx-auto px-6 text-center mt-9">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-10">
            Our Plans
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: "Trial", price: "Free/mo", features: ["All Basic Features"] },
              { title: "Pro", price: "₹1000/mo", features: ["All Basic Features"] },
            ].map((plan, idx) => (
              <Card
                key={idx}
                className="shadow-lg hover:shadow-xl transition bg-white dark:bg-gray-800 dark:text-white"
              >
                <CardHeader>
                  <CardTitle className="text-xl">{plan.title}</CardTitle>
                  <p className="text-blue-600 dark:text-blue-400 text-2xl font-bold">
                    {plan.price}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                    {plan.features.map((f, i) => (
                      <li key={i}>✔ {f}</li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => router.push(`/subscribe?plan=${plan.title}`)}
                    className="mt-6 w-full bg-blue-600 text-white"
                  >
                    Subscribe
                  </Button>

                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>



      {/* Contact Section */}
      <section
        id="contact"
        className="bg-blue-600 text-white dark:bg-blue-700 py-16 text-center"
      >
        <h2 className="text-3xl font-bold mb-6">
          Ready to Simplify Your Legal Practice?
        </h2>
        <Button
          onClick={() => router.push("/signup")}
          className="bg-white text-blue-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800 px-6 py-3 rounded-xl"
        >
          Sign Up Now
        </Button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-950 text-white text-center py-6">
        © {new Date().getFullYear()} LegalEase. All Rights Reserved.
      </footer>
    </div>
  );
}
