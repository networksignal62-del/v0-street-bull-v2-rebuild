"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Loader2, Mail, Lock, Shield, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    adminCode: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (isAdminLogin) {
      // Admin Login Validation
      // Hardcoded for demo: email must contain "admin" and code "streetbull"
      if (formData.email.includes("admin") && formData.adminCode === "streetbull") {
        // Redirect to Admin Dashboard (assuming it exists or main dashboard with admin view)
        router.push("/dashboard/admin");
      } else {
        setError("Invalid Admin Credentials. Please check your Email and Admin Code.");
        setIsLoading(false);
      }
    } else {
      // Regular User Login
      // For demo purposes, accept any valid-looking credentials
      if (formData.email && formData.password.length >= 6) {
        router.push("/dashboard");
      } else {
        setError("Invalid email or password. Password must be at least 6 characters.");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0A1128] via-[#1E3A8A] to-[#0A1128] px-4 py-12">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF5722]">
              <span className="text-xl font-bold text-white">SB</span>
            </div>
            <span className="text-2xl font-bold text-white">STREET BULL</span>
          </Link>
        </div>

        <Card className={`border-white/10 bg-card/95 backdrop-blur-sm transition-all duration-500 ${isAdminLogin ? 'border-red-500/50 shadow-2xl shadow-red-900/20' : ''}`}>
          <CardHeader className="text-center relative">
            {isAdminLogin && <div className="absolute top-2 right-2 text-red-500 animate-pulse"><ShieldAlert className="h-6 w-6" /></div>}
            <CardTitle className="text-2xl">{isAdminLogin ? "Admin Access" : "Welcome Back"}</CardTitle>
            <CardDescription>{isAdminLogin ? "Enter your Secure Admin Code" : "Sign in to your account to continue"}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={isAdminLogin ? "admin@streetbull.com" : "name@example.com"}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {!isAdminLogin ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/reset-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="pl-10 pr-10"
                      required={!isAdminLogin}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="adminCode" className="text-red-500 font-bold">Admin Code</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
                    <Input
                      id="adminCode"
                      type="password"
                      placeholder="Enter Secure Admin Code"
                      value={formData.adminCode}
                      onChange={(e) =>
                        setFormData({ ...formData, adminCode: e.target.value })
                      }
                      className="pl-10 border-red-500/30 focus-visible:ring-red-500"
                      required={isAdminLogin}
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className={`w-full text-white ${isAdminLogin ? 'bg-red-600 hover:bg-red-700' : 'bg-[#FF5722] hover:bg-[#FF5722]/90'}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isAdminLogin ? "Verifying..." : "Signing in..."}
                  </>
                ) : (
                  isAdminLogin ? "Access Admin Panel" : "Sign In"
                )}
              </Button>

              <div className="flex justify-center mt-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { setIsAdminLogin(!isAdminLogin); setError(""); }}
                  className={isAdminLogin ? "text-white/50 hover:text-white" : "text-red-500 hover:text-red-400 hover:bg-red-500/10"}
                >
                  {isAdminLogin ? "Back to User Login" : "Admin Access"}
                </Button>
              </div>

              {!isAdminLogin && (
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
              )}

              {!isAdminLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <Button type="button" variant="outline">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button type="button" variant="outline">
                    <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    GitHub
                  </Button>
                </div>
              )}
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-sm text-white/50">
          &copy; {new Date().getFullYear()} Street Bull. All rights reserved.
        </p>
      </div>
    </div>
  );
}
