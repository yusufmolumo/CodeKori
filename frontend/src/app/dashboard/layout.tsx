import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ChatWidget } from "@/components/chat/chat-widget";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-muted/20">
            <Sidebar />
            <div className="flex flex-col md:pl-64 transition-all duration-200 ease-in-out">
                <Header />
                <main className="flex-1 p-6">
                    {children}
                </main>
                <ChatWidget />
            </div>
        </div>
    );
}
