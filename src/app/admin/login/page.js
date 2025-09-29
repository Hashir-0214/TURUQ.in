// src/app/admin/login/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/ui/notification/NotificationProvider";
import Button from "@/components/ui/button/Button";
import { LoaderCircle } from "lucide-react";

export default function LoginForm() {
    const [loading, setLoading] = useState(false);
    const { addNotification } = useNotification();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const router = useRouter();
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch("/api/auth/login", {
                method: 'POST',
                headers: {
                    'x-api-key': "itstheprivateKeY",
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const result = await response.json();
            console.log(result);
            if (response.ok) {
                addNotification("success", "Login successful!");
                router.push("/admin");
            } else {
                addNotification("error", result.message || "Login failed. Please try again.");
            }
        } catch (error) {
            console.error("An error occurred:", error);
            addNotification("error", "An error occurred. Please try again.");
        }
    };
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="john.doe@example.com"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="********"
                        required
                    />
                </div>
                <div className="flex items-center justify-between">
                    <Button
                        type="submit"
                        onClick={() => setLoading(true)}
                        variant="secondary"
                    >
                        {loading ? (<div className="flex items-center justify-center"><p>Login </p> <LoaderCircle className="animate-spin" /></div>) : "Login"}
                    </Button>
                </div>
            </form>
        </div>
    );
}