"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings as SettingsIcon, Save, Bell, Shield, Palette } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-12">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences and system configuration.</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notifications
                        </CardTitle>
                        <CardDescription>Configure how you receive updates and alerts.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-2 border-b">
                            <div>
                                <p className="font-medium">Email Notifications</p>
                                <p className="text-sm text-muted-foreground">Receive course updates via email.</p>
                            </div>
                            <Button variant="outline" size="sm">Enabled</Button>
                        </div>
                        <div className="flex items-center justify-between p-2">
                            <div>
                                <p className="font-medium">In-app Alerts</p>
                                <p className="text-sm text-muted-foreground">Show popup notifications for events.</p>
                            </div>
                            <Button variant="outline" size="sm">Enabled</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Security
                        </CardTitle>
                        <CardDescription>Update your password and manage security sessions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="secondary">Change Password</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            Appearance
                        </CardTitle>
                        <CardDescription>Customize the look and feel of your dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <Button variant="outline" className="border-primary">Light</Button>
                            <Button variant="outline">Dark</Button>
                            <Button variant="outline">System</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end">
                <Button className="gap-2">
                    <Save className="h-4 w-4" /> Save Changes
                </Button>
            </div>
        </div>
    );
}
