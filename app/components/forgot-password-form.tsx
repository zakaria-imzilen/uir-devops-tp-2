"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mail, Send, CheckCircle, RefreshCw, Sparkles } from "lucide-react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendAnother = () => {
    setSuccess(false);
    setEmail("");
    setError(null);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Glassmorphism Card */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl shadow-purple-500/10">
        {success ? (
          // Success State
          <>
            <CardHeader className="text-center pb-8">
              {/* Success Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                Check Your Email
              </CardTitle>
              <CardDescription className="text-white/70 text-lg">
                Password reset instructions have been sent
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Success Message */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center">
                <div className="flex justify-center mb-4">
                  <Mail className="w-12 h-12 text-green-400" />
                </div>
                <p className="text-white/90 mb-4">
                  We&#39;ve sent password reset instructions to:
                </p>
                <p className="text-green-300 font-semibold text-lg">{email}</p>
                <p className="text-white/70 text-sm mt-4">
                  If you don&#39;t see the email in your inbox, please check your spam folder.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleSendAnother}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 text-white font-semibold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02]"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Send Another Email
                </Button>
                
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-12 bg-white/5 backdrop-blur-sm border-white/20 text-white hover:bg-white/10 font-semibold text-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  <Link href="/auth/login">
                    Return to Login
                  </Link>
                </Button>
              </div>

              {/* Help Text */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                <p className="text-sm text-white/70">
                  Need help? Contact our support team at{" "}
                  <a href="mailto:support@flowcraft.studio" className="text-purple-300 hover:text-purple-200 underline">
                    support@flowcraft.studio
                  </a>
                </p>
              </div>
            </CardContent>
          </>
        ) : (
          // Form State
          <>
            <CardHeader className="text-center pb-8">
              {/* Logo/Brand */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <RefreshCw className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
                Reset Password
              </CardTitle>
              <CardDescription className="text-white/70 text-lg">
                Enter your email address and we&#39;ll send you a reset link
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/90 font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-orange-400 focus:ring-orange-400/20 h-12"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                {/* Info Box */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-white/90 font-medium mb-1">How it works:</p>
                      <p className="text-sm text-white/70">
                        We&#39;ll send a secure reset link to your email. Click the link to create a new password and regain access to your FlowCraft Studio account.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Send Reset Button */}
                <Button
                  onClick={handleForgotPassword}
                  className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 border-0 text-white font-semibold text-lg shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending Reset Link...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-5 h-5" />
                      Send Reset Link
                    </div>
                  )}
                </Button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gradient-to-r from-indigo-950 via-purple-900 to-pink-900 text-white/60">
                    Remember your password?
                  </span>
                </div>
              </div>

              {/* Sign In Link */}
              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors font-medium"
                >
                  Back to Sign In
                  <span className="text-orange-300">→</span>
                </Link>
              </div>
            </CardContent>
          </>
        )}
      </Card>

      {/* Back to Home */}
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white/80 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}

