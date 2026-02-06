"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import api from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!token) {
            setError("Invalid or missing reset token.");
            return;
        }

        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            await api.post("/auth/reset-password", { token, newPassword: password });
            setMessage("Password reset successful! Redirecting to login...");
            setStatus("success");
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            setMessage(err.response?.data?.error?.message || "Failed to reset password.");
            setStatus("error");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center text-destructive p-4">
                Invalid request. Missing reset token.
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
                <div className="bg-green-100 text-green-700 text-sm p-3 rounded-md text-center">
                    {message}
                </div>
            )}
            {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md text-center">
                    {error}
                </div>
            )}
            <div className="space-y-2">
                <Input
                    type="password"
                    placeholder="New Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Input
                    type="password"
                    placeholder="Confirm New Password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Reset Password"}
            </Button>
        </form>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center text-primary">Reset Password</CardTitle>
                    <CardDescription className="text-center">
                        Enter your new password below
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />}>
                        <ResetPasswordForm />
                    </Suspense>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link href="/login" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
