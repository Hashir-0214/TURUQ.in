// src/app/admin/layout.jsx

'use client';

import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import { NotificationProvider } from "@/components/ui/notification/NotificationProvider";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { LoaderCircle } from "lucide-react"; // Ensure LoaderCircle is imported if used here

export default function Layout({ children }) {
    const pathname = usePathname();
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const loginPage = pathname === '/admin/login';
    const registerPage = pathname === '/admin/register';
    // FIX: Combine both login and register into a single variable for clarity
    const authPage = loginPage || registerPage; 

    // Fetch current user data
    useEffect(() => {
        if (authPage) { // Use authPage here
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
                    // On error, redirect to login
                    // Only redirect if we are not already on the login page (to prevent infinite loops)
                    if (!loginPage) {
                        window.location.href = '/admin/login';
                    }
                }
            } catch (error) {
                console.error('Failed to fetch current user:', error);
                // On error, redirect to login
                if (!loginPage) {
                    window.location.href = '/admin/login';
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentUser();
    }, [authPage, loginPage]); // Add authPage and loginPage to dependency array

    // Show loading spinner while fetching user data
    if (loading && !authPage) { // Use authPage here
        return (
            <NotificationProvider>
                <div className="flex bg-[#ffedd9] min-h-screen items-center justify-center">
                    <LoaderCircle className="animate-spin h-8 w-8 text-black" />
                </div>
            </NotificationProvider>
        );
    }

    // FIX: Use authPage to decide whether to render the full layout or just the children
    return (
        <NotificationProvider>
            <div className="flex bg-[#ffedd9]">
                {authPage ? (
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
