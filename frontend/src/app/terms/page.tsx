import React from "react";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
    return (
        <div className="container py-12 max-w-4xl mx-auto">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
            </Link>
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
            <p className="mb-4">
                Last updated: {new Date().toLocaleDateString()}
            </p>
            <div className="prose dark:prose-invert">
                <p>
                    Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the CodeKori website and application operated by CodeKori ("us", "we", or "our").
                </p>
                <h2 className="text-xl font-semibold mt-4 mb-2">Conditions of Use</h2>
                <p>
                    Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users and others who access or use the Service.
                </p>
                <p>
                    By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
                </p>
                <h2 className="text-xl font-semibold mt-4 mb-2">Accounts</h2>
                <p>
                    When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                </p>
                <h2 className="text-xl font-semibold mt-4 mb-2">Intellectual Property</h2>
                <p>
                    The Service and its original content, features and functionality are and will remain the exclusive property of CodeKori and its licensors.
                </p>
            </div>
        </div>
    );
}
