"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                style: {
                    background: "#1a1a2e",
                    color: "#e2e8f0",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    borderRadius: "12px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                },
                duration: 5000,
            }}
            richColors
            closeButton
        />
    );
}
