"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X } from "lucide-react";
import api from "@/lib/api";

interface ImageUploadProps {
    onUploadComplete: (url: string) => void;
    folder?: string;
    defaultImage?: string | null;
}

export function ImageUpload({ onUploadComplete, folder = "codekori_uploads", defaultImage }: ImageUploadProps) {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(defaultImage || null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            alert("Please upload an image file");
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB
            alert("File size too large (max 5MB)");
            return;
        }

        setLoading(true);
        // Temporary preview
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        try {
            // 1. Get Signature
            const signatureRes = await api.get(`/upload/signature?folder=${folder}`);
            const { timestamp, signature, cloudName, apiKey } = signatureRes.data;

            // 2. Upload to Cloudinary
            const formData = new FormData();
            formData.append("file", file);
            formData.append("api_key", apiKey);
            formData.append("timestamp", timestamp.toString());
            formData.append("signature", signature);
            formData.append("folder", folder);

            const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: "POST",
                body: formData
            });

            const data = await uploadRes.json();

            if (data.secure_url) {
                onUploadComplete(data.secure_url);
            } else {
                throw new Error("Upload failed");
            }
        } catch (error) {
            console.error("Upload error", error);
            alert("Failed to upload image");
            setPreview(defaultImage || null); // Revert
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onUploadComplete("");
    };

    return (
        <div className="flex items-center gap-4">
            {preview ? (
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20 group">
                    <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Button variant="ghost" size="icon" className="text-white hover:text-red-400" onClick={handleRemove}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="relative h-24 w-24 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center bg-muted/50 hover:bg-muted transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                        disabled={loading}
                    />
                </div>
            )}

            <div className="flex flex-col gap-1">
                <Button variant="outline" size="sm" className="relative w-fit" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    {loading ? "Uploading..." : "Upload Image"}
                    <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                        disabled={loading}
                    />
                </Button>
                <p className="text-xs text-muted-foreground">Max 5MB. JPG, PNG, WEBP.</p>
            </div>
        </div>
    );
}
