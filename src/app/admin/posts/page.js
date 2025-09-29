// app/admin/posts/page.js

'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
    Plus,
    Edit,
    Eye,
    Trash2,
    PlusCircle,
} from 'lucide-react';
// Import the new Table component (adjust path if needed)
import Table from '@/components/admin/ui/Table';
/* ------------------------------------------------------------------ */
// Dummy Data and Fetching Functions (Replace with actual API calls)
/* ------------------------------------------------------------------ */
const fetchPosts = () =>
    // Simulating API response delay
    new Promise(resolve => setTimeout(() => resolve([
        {
            _id: '66f7f63102431b9d4c728e20', // Example ObjectId for date parsing
            title: 'First Post: The Rise of AI',
            author_name: 'John Doe',
            category_name: 'Tech',
            created_at: '2024-09-25T10:00:00.000Z',
            views: 123,
            status: 'published',
        },
        {
            _id: '66f7f63102431b9d4c728e21',
            title: 'Draft Idea for Travel Blog',
            author_name: 'Jane Smith',
            category_name: 'Travel',
            created_at: '2024-09-24T10:00:00.000Z',
            views: 0,
            status: 'draft',
        },
        {
            _id: '66f7f63102431b9d4c728e22',
            title: 'A Recipe for Success',
            author_name: 'Gordon Ramsay',
            category_name: 'Food',
            created_at: '2024-09-23T10:00:00.000Z',
            views: 500,
            status: 'published',
        },
    ]), 500));

const fetchCategories = () =>
    Promise.resolve([
        { id: '1', name: 'Travel' },
        { id: '2', name: 'Tech' },
        { id: '3', name: 'Food' },
    ]);

/* ------------------------------------------------------------------ */
// Column Definitions
/* ------------------------------------------------------------------ */
const POSTS_COLUMNS = [
    {
        key: 'title',
        header: 'Title',
        sortable: true,
        className: 'font-bold max-w-xs truncate',
    },
    {
        key: 'author_name',
        header: 'Author',
        sortable: true,
    },
    {
        key: 'category_name',
        header: 'Category',
        sortable: true,
    },
    {
        key: 'created_at',
        header: 'Date',
        sortable: true,
        className: 'text-gray-600',
        render: (post) => {
            // Use created_at field, fallback to _id parsing
            const dateStr = post.created_at
                ? post.created_at
                : (post._id ? parseInt(post._id.substring(0, 8), 16) * 1000 : null);

            if (dateStr) {
                return new Date(dateStr).toLocaleDateString();
            }
            return 'N/A';
        },
    },
    {
        key: 'views',
        header: 'Views',
        sortable: true,
        className: 'text-center',
        render: (post) => (
            <span className="bg-gray-300 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
                {post.views}
            </span>
        ),
    },
    {
        key: 'status',
        header: 'Status',
        sortable: true,
        render: (post) => (
            <span
                className={`px-2 py-1 rounded text-xs font-semibold border ${post.status === 'published'
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                    }`}
            >
                {post.status}
            </span>
        ),
    },
    {
        key: 'actions',
        header: 'Actions',
        sortable: false,
        // The render function receives the row and the handlers object (from the 'handlers' prop)
        render: (post, { handleEdit, handleDelete }) => (
            <div className="flex gap-2">
                <button
                    className="p-1 rounded-full hover:bg-yellow-100 transition-colors"
                    aria-label="Edit"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(post._id);
                    }}
                >
                    <Edit className="w-4 h-4 text-yellow-600" />
                </button>
                <Link
                    href={`/post/${post.slug || post._id}`} // Assuming a slug exists or fallback
                    className="p-1 rounded-full hover:bg-blue-100 transition-colors"
                    aria-label="View"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Eye className="w-4 h-4 text-blue-600" />
                </Link>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(post._id);
                    }}
                    className="p-1 rounded-full hover:bg-red-100 transition-colors"
                    aria-label="Delete"
                >
                    <Trash2 className="w-4 h-4 text-red-600" />
                </button>
            </div>
        ),
    },
];

/* ------------------------------------------------------------------ */
// Main Page Component
/* ------------------------------------------------------------------ */

export default function PostsPage() {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [categoryFilter, setCategoryFilter] = useState('');

    // State to trigger a data refresh
    const [refreshKey, setRefreshKey] = useState(0);

    // Load data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [postsData, categoriesData] = await Promise.all([
                    fetchPosts(),
                    fetchCategories(),
                ]);
                setPosts(postsData);
                setCategories(categoriesData);
            } catch (error) {
                console.error("Failed to load posts data:", error);
                // In a real app, you'd use a notification here
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [refreshKey]); // Dependency on refreshKey to trigger reload

    /* ------------- Handlers ------------- */

    const handleEdit = (id) => {
        console.log(`Edit post with ID: ${id}`);
        // Implement navigation to edit page
    };

    const handleDelete = (id) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        setPosts((prev) => prev.filter((p) => p._id !== id));
        // Implement API call to delete post
    };

    const handleReload = () => {
        setRefreshKey(prev => prev + 1);
    }

    // Filter posts by category before passing to Table
    const filteredPosts = useMemo(() => {
        if (!categoryFilter) return posts;
        return posts.filter((p) => p.category_name === categoryFilter);
    }, [posts, categoryFilter]);

    /* ------------- Render ------------- */

    return (
        <div className="container mx-auto px-6 pb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 uppercase">Posts Page</h1>

            <main>
                {/* Header bar */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        href="/admin/posts/new" // Link to the new post creation page
                        className="flex items-center text-sm px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors cursor-pointer"
                    >
                        <PlusCircle className="w-5 h-5" />
                        <span className="font-medium ml-2">New Post</span>
                    </button>

                    {/* Category Filter */}
                    <div className="flex items-center relative">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            // Match the Table's background style
                            className="bg-[#ffedd9] border border-black rounded-lg px-4 py-2 pr-10 text-sm cursor-pointer"
                        >
                            <option value="">All Categories</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.name}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table Component */}
                <Table
                    data={filteredPosts}
                    columns={POSTS_COLUMNS}
                    loading={loading}
                    searchable={true}
                    sortable={true}
                    searchPlaceholder="Search by title, author, or category..."
                    emptyMessage="No posts found."
                    searchKeys={['title', 'author_name', 'category_name']}
                    onReload={handleReload}
                    onRowClick={(row) => console.log('Post row clicked:', row)}
                    handlers={{ handleEdit, handleDelete }}
                />

            </main>
        </div>
    );
}