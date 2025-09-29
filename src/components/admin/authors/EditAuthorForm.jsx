// src/components/admin/authors/EditAuthorForm.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { LoaderCircle, Save, X } from 'lucide-react';

// Utility function to generate a slug from a string (same as in AddAuthorForm)
const slugify = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s-]+/g, '-');
};

export const EditAuthorForm = ({ authorId, onAuthorUpdated, onCancel }) => {
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const API_KEY_TO_SEND = process.env.NEXT_PUBLIC_API_KEY;

    // 1. Fetch current author data on load
    useEffect(() => {
        if (!authorId) {
            setLoading(false);
            return;
        }

        const fetchAuthorData = async () => {
            setLoading(true);
            setError('');
            try {
                // NOTE: Assuming your GET /api/admin/authors endpoint can handle a query parameter for a single ID.
                // If not, you may need a separate endpoint like GET /api/admin/authors/[id]
                const res = await fetch(`/api/admin/authors?id=${authorId}`, { 
                    headers: { 'x-api-key': API_KEY_TO_SEND },
                });
                
                if (!res.ok) {
                    throw new Error(`Failed to fetch author data (Status: ${res.status})`);
                }
                
                const data = await res.json();
                
                // Assuming the backend returns the full author object
                // If the backend returns an array of one item, use data[0]
                setFormData(data.length ? data[0] : data); 

            } catch (err) {
                console.error('Fetch Author Data Error:', err.message);
                setError(err.message || 'Could not load author details.');
            } finally {
                setLoading(false);
            }
        };

        fetchAuthorData();
    }, [authorId, API_KEY_TO_SEND]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };

            // Optional: Automatically update slug if name is changed
            if (name === 'name') {
                newState.slug = slugify(value);
            }

            return newState;
        });
        setError('');
    };

    // 2. Handle PUT request for update
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        if (!formData || !formData.name || !formData.email || !formData.slug) {
            setError('Name, Email, and Slug are required.');
            setSubmitting(false);
            return;
        }

        try {
            const res = await fetch('/api/admin/authors', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY_TO_SEND,
                },
                // Send the ID along with the update data
                body: JSON.stringify({ _id: authorId, ...formData }), 
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || `Failed to update author (Status: ${res.status})`);
            }

            // Success! Call the parent handler to update the table data and close the modal
            onAuthorUpdated(result); 

        } catch (err) {
            console.error('Update Author Error:', err.message);
            setError(err.message || 'An unknown error occurred during submission.');
        } finally {
            setSubmitting(false);
        }
    };
    
    // UI rendering based on state
    if (loading) {
        return (
            <div className="p-8 flex justify-center items-center text-gray-500">
                <LoaderCircle className="w-6 h-6 animate-spin mr-2" /> Loading details...
            </div>
        );
    }

    if (error && !formData) {
        return (
            <div className="p-8 text-sm text-red-700">
                Error: {error}
            </div>
        );
    }
    
    // Main form render
    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Display error message */}
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
                    value={formData?.name || ''}
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
                    value={formData?.email || ''}
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
                    value={formData?.slug || ''}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-red-500 focus:ring-red-500 text-sm bg-gray-50"
                />
            </div>
            
            {/* Phone */}
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData?.phone || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-red-500 focus:ring-red-500 text-sm"
                />
            </div>
            
            {/* Biography */}
            <div>
                <label htmlFor="biography" className="block text-sm font-medium text-gray-700">Biography</label>
                <textarea
                    id="biography"
                    name="biography"
                    value={formData?.biography || ''}
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
                    disabled={submitting}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md shadow-sm hover:bg-gray-300 transition-colors"
                >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                    {submitting ? (
                        <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    {submitting ? 'Updating...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}