'use client';

import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import { NotificationProvider } from "@/components/ui/notification/NotificationProvider";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { LoaderCircle } from "lucide-react"; 

export default function Layout({ children }) {
    const pathname = usePathname();
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const loginPage = pathname === '/admin/login';
    const registerPage = pathname === '/admin/register';
    const authPage = loginPage || registerPage; 

    // Fetch current user data
    useEffect(() => {
        if (authPage) { 
            setLoading(false);
            return;
        }

        const fetchCurrentUser = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const userData = await response.json();
                    setCurrentUser(userData);
                } else {
                    if (!loginPage) {
                        window.location.href = '/admin/login';
                    }
                }
            } catch (error) {
                console.error('Failed to fetch current user:', error);
                if (!loginPage) {
                    window.location.href = '/admin/login';
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentUser();
    }, [authPage, loginPage]); 

    // Show loading spinner while fetching user data
    if (loading && !authPage) {
        return (
            <NotificationProvider>
                <div className="flex bg-[#ffedd9] min-h-screen items-center justify-center">
                    <LoaderCircle className="animate-spin h-8 w-8 text-black" />
                </div>
            </NotificationProvider>
        );
    }

    return (
        <NotificationProvider>
            {/* Use flex-col to stack Header (not shown) and content */}
            <div className="flex flex-col bg-[#ffedd9] min-h-screen">
                {authPage ? (
                    <div className="min-h-screen w-full">{children}</div>
                ) : (
                    <>
                        <Header currentUser={currentUser} />
                        {/* Content Wrapper: Uses a calculated height to reserve space above (150px) 
                          and ensures the content container fills the rest of the viewport.
                        */}
                        <div 
                            className="flex w-[90%] max-w-[1200px] mx-auto mt-[150px] gap-10"
                            style={{ minHeight: 'calc(100vh - 150px)', paddingBottom: '3rem' }} 
                        >
                            <Sidebar />
                            {/* FIX: Added overflow-y-auto to main to enable scrolling for its content */}
                            <main className="flex-1 p-6 overflow-y-auto">
                                {children}
                            </main>
                        </div>
                    </>
                )}
            </div>
        </NotificationProvider>
    );
}
