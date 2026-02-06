import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BarChart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";


// Simplified Badge component since we didn't create it in UI folder yet, 
// or I can just use a span with classes. I'll use a span for now to avoid dependency errors.

interface CourseCatalogCardProps {
    id: string;
    title: string;
    description: string;
    thumbnailUrl?: string | null;
    difficulty: string;
    durationHours: number;
}

export function CourseCatalogCard({
    id,
    title,
    description,
    thumbnailUrl,
    difficulty,
    durationHours
}: CourseCatalogCardProps) {
    return (
        <Card className="flex flex-col overflow-hidden h-full hover:shadow-lg transition-shadow">
            <div className="relative h-48 w-full bg-muted">
                {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={title} className="object-cover w-full h-full" />
                ) : (
                    <div className="flex items-center justify-center h-full bg-secondary/10 text-secondary">
                        <span className="font-semibold text-lg">CodeKori Course</span>
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground shadow hover:bg-secondary/80 capitalize">
                        {difficulty}
                    </span>
                </div>
            </div>
            <CardHeader className="p-4">
                <CardTitle className="line-clamp-1 text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-4 pt-0 text-sm text-muted-foreground">
                <p className="line-clamp-2">{description}</p>
                <div className="mt-4 flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{durationHours}h</span>
                    </div>
                    {/* Placeholder for rating or other stats */}
                    <div className="flex items-center gap-1">
                        <BarChart className="h-3.5 w-3.5" />
                        <span>Beginner Friendly</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Link href={`/dashboard/courses/${id}`} className="w-full">
                    <Button className="w-full">View Course</Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
