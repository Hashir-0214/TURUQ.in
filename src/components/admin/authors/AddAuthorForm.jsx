// src/components/admin/authors/AddAuthorForm.jsx

'use client';

import React, { useState } from 'react';
import { LoaderCircle, Save, X } from 'lucide-react';

// Utility function to generate a slug from a string
const slugify = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric characters (except spaces and hyphens)
        .replace(/[\s-]+/g, '-');      // Replace spaces and multiple hyphens with a single hyphen
};

export const AddAuthorForm = ({ onAuthorAdded, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        slug: '',
        phone: '',
        biography: '',
        avatar: '',
        // avatar is typically handled by a separate file upload component, keeping it simple for now
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_KEY_TO_SEND = process.env.NEXT_PUBLIC_API_KEY;

    // Handle input changes, including automatic slug generation for the name field
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const newState = { ...prev, [name]: value };

            // Automatically generate slug when name changes
            if (name === 'name') {
                newState.slug = slugify(value);
            }

            return newState;
        });
        setError(''); // Clear error on change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Basic validation
        if (!formData.name || !formData.email || !formData.slug) {
            setError('Name, Email, and Slug are required.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/admin/authors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Pass the API key for authentication
                    'x-api-key': API_KEY_TO_SEND,
                },
                body: JSON.stringify(formData),
            });

            const result = await res.json();

            if (!res.ok) {
                // Handle API error messages (e.g., 409 Conflict, 400 Validation)
                throw new Error(result.message || `Failed to add author (Status: ${res.status})`);
            }

            // Success! Call the parent handler to update the table data
            onAuthorAdded(result); 

        } catch (err) {
            console.error('Add Author Error:', err.message);
            setError(err.message || 'An unknown error occurred during submission.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {error && (
                <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded">
                    {error}
                </div>
            )}

            {/* Name */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Author Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-red-500 focus:ring-red-500 text-sm"
                />
            </div>

            {/* Email */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-red-500 focus:ring-red-500 text-sm"
                />
            </div>

            {/* Slug */}
            <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                    Slug <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-red-500 focus:ring-red-500 text-sm bg-gray-50"
                    placeholder="Auto-generated from name"
                />
            </div>

            {/* Phone (Optional) */}
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                </label>
                <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-red-500 focus:ring-red-500 text-sm"
                />
            </div>

            {/* Biography (Optional) */}
            <div>
                <label htmlFor="biography" className="block text-sm font-medium text-gray-700">
                    Biography
                </label>
                <textarea
                    id="biography"
                    name="biography"
                    value={formData.biography}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-red-500 focus:ring-red-500 text-sm"
                />
            </div>


            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md shadow-sm hover:bg-gray-300 transition-colors"
                >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                    {loading ? (
                        <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    {loading ? 'Adding Author...' : 'Add Author'}
                </button>
            </div>
        </form>
    );
}