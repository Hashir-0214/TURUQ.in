// src/app/admin/layout.jsx

'use client';

import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import { NotificationProvider } from "@/components/ui/notification/NotificationProvider";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Layout({ children }) {
    const pathname = usePathname();
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const loginPage = pathname === '/admin/login';

    // Fetch current user data
    useEffect(() => {
        if (loginPage) {
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
                    // If user is not authenticated, redirect to login
                    window.location.href = '/admin/login';
                }
            } catch (error) {
                console.error('Failed to fetch current user:', error);
                // On error, redirect to login
                window.location.href = '/admin/login';
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentUser();
    }, [loginPage]);

    // Show loading spinner while fetching user data
    if (loading && !loginPage) {
        return (
            <NotificationProvider>
                <div className="flex bg-[#ffedd9] min-h-screen items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
            </NotificationProvider>
        );
    }

    return (
        <NotificationProvider>
            <div className="flex bg-[#ffedd9]">
                {loginPage ? (
                    <div className="min-h-screen min-w-screen">{children}</div>
                ) : (
                    <>
                        <Header currentUser={currentUser} />
                        <div className="flex w-[90%] max-w-[1200px] mx-auto mt-[150px] min-h-screen gap-10">
                            <Sidebar />
                            <main className="flex-1 p-6">{children}</main>
                        </div>
                    </>
                )}
            </div>
        </NotificationProvider>
    );
}