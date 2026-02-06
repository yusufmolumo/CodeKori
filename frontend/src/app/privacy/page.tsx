import React from "react";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
    return (
        <div className="container py-12 max-w-4xl mx-auto">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
            </Link>
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <p className="mb-4">
                Last updated: {new Date().toLocaleDateString()}
            </p>
            <div className="prose dark:prose-invert">
                <p>
                    At CodeKori, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website or use our application.
                </p>
                <h2 className="text-xl font-semibold mt-4 mb-2">Information We Collect</h2>
                <p>
                    We collect information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website or otherwise when you contact us.
                </p>
                <h2 className="text-xl font-semibold mt-4 mb-2">How We Use Your Information</h2>
                <p>
                    We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
                </p>
                <ul className="list-disc pl-6 mt-2">
                    <li>To facilitate account creation and logon process.</li>
                    <li>To send you marketing and promotional communications.</li>
                    <li>To send administrative information to you.</li>
                    <li>To protect our Services.</li>
                </ul>
            </div>
        </div>
    );
}
