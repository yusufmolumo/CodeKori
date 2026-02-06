"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<"loading" | "success" | "error">(token ? "loading" : "error");
    const [message, setMessage] = useState(token ? "Verifying your email..." : "No verification token found.");

    useEffect(() => {
        if (!token) return;

        const verify = async () => {
            try {
                await api.post("/auth/verify-email", { token });
                setStatus("success");
                setMessage("Email verified successfully! You can now log in.");
            } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
                setStatus("error");
                setMessage(err.response?.data?.error?.message || "Verification failed. Token may be invalid or expired.");
            }
        };

        verify();
    }, [token]);



    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-2xl text-center text-primary">Email Verification</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4 py-6">
                {status === "loading" && (
                    <>
                        <Loader2 className="h-12 w-12 text-primary animate-spin" />
                        <p className="text-muted-foreground">{message}</p>
                    </>
                )}
                {status === "success" && (
                    <>
                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                        <p className="text-center font-medium">{message}</p>
                        <Link href="/login" className="w-full">
                            <Button className="w-full mt-4">Go to Login</Button>
                        </Link>
                    </>
                )}
                {status === "error" && (
                    <>
                        <XCircle className="h-16 w-16 text-destructive" />
                        <p className="text-center font-medium text-destructive">{message}</p>
                        <Link href="/login" className="w-full">
                            <Button variant="outline" className="w-full mt-4">Back to Login</Button>
                        </Link>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
            <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
                <VerifyEmailContent />
            </Suspense>
        </div>
    )
}
