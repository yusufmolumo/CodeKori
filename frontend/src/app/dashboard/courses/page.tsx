"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { CourseCatalogCard } from "@/components/dashboard/course-catalog-card";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";

export default function CoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get("/courses");
                setCourses(res.data.data || []);
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Course Catalog</h1>
                    <p className="text-muted-foreground">
                        Explore our library of premium coding courses.
                    </p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search courses..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredCourses.length > 0 ? (
                        filteredCourses.map((course) => (
                            <CourseCatalogCard
                                key={course.id}
                                id={course.id}
                                title={course.title}
                                description={course.description}
                                thumbnailUrl={course.thumbnailUrl}
                                difficulty={course.difficulty}
                                durationHours={course.durationHours}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                            No courses found matching your search.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
