// src/app/admin/posts/page.js
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { PlusCircle, Edit, Eye, Trash2 } from "lucide-react";

import Table from "@/components/admin/ui/Table";
import Modal from "@/components/admin/ui/modal/Modal";
import AddPostForm from "@/components/admin/posts/AddPostForm";
import EditPostForm from "@/components/admin/posts/EditPostForm"; 

const API_KEY_TO_SEND = process.env.NEXT_PUBLIC_API_KEY;

const fetchPosts = async () => {
  if (!API_KEY_TO_SEND) {
    const msg = "API Key is missing. Check your .env.local file.";
    console.error(msg);
    return { data: [] }; // Return empty structure matching expected format
  }

  try {
    const res = await fetch("/api/admin/posts", {
      method: "GET",
      headers: {
        "x-api-key": API_KEY_TO_SEND,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.message || `Failed to fetch posts: ${res.status}`
      );
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Fetch posts error:", error);
    // Return empty array wrapper to prevent .data crash
    return { data: [] };
  }
};

const fetchCats = async () => {
  try {
    const res = await fetch("/api/admin/categories", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY_TO_SEND,
      },
    });
    if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Fetch categories error:", error);
    return { data: [] };
  }
};

const fetchAuthors = async () => {
  try {
    const res = await fetch("/api/admin/authors", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY_TO_SEND,
      },
    });
    if (!res.ok) throw new Error(`Failed to fetch authors: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Fetch authors error:", error);
    return { data: [] };
  }
};

/* ------------------------------------------------------------------ */
/* Column definitions                                                */
/* ------------------------------------------------------------------ */

const POSTS_COLUMNS = [
  {
    key: "title",
    header: "Title",
    sortable: true,
    className: "font-bold max-w-xs truncate",
    render: (p) => p.title || "Untitled",
  },
  {
    // FIX 1: Changed key to 'author_id' (the actual field name in DB)
    key: "author_id", 
    header: "Author",
    sortable: true,
    // FIX 2: Added render function to safely access the nested .name property
    render: (p) => {
        // If author_id is an object (populated), show name. 
        // If it's just a string ID (not populated), show ID.
        // If missing, show Unknown.
        return p.author_id?.name || "Unknown Author";
    }
  },
  {
    key: "created_at",
    header: "Date",
    sortable: true,
    className: "text-gray-600",
    render: (p) => p.created_at ? new Date(p.created_at).toLocaleDateString() : "-",
  },
  {
    key: "views",
    header: "Views",
    sortable: true,
    className: "text-center",
    render: (p) => (
      <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
        {p.views || 0}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (p) => (
      <span
        className={`px-2 py-1 rounded text-xs font-semibold border ${p.status === "published"
          ? "bg-green-100 text-green-800 border-green-300"
          : "bg-yellow-100 text-yellow-800 border-yellow-300"
          }`}
      >
        {p.status}
      </span>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    sortable: false,
    render: (post, { handleEdit, handleDelete }) => (
      <div className="flex gap-2">
        <button
          className="p-1 rounded-full hover:bg-yellow-100"
          aria-label="Edit"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(post._id);
          }}
        >
          <Edit className="w-4 h-4 text-yellow-600" />
        </button>

        <Link
          href={`/${post.slug || post._id}`}
          target="_blank"
          className="p-1 rounded-full hover:bg-blue-100"
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
          className="p-1 rounded-full hover:bg-red-100"
          aria-label="Delete"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>
    ),
  },
];


/* ------------------------------------------------------------------ */
/* Page component                                                    */
/* ------------------------------------------------------------------ */
export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [categories, setCats] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null); 

  const [catFilter, setCatFilter] = useState("");

  const openCreateModal = () => {
    setEditingPostId(null); 
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setEditingPostId(null), 300); 
  };
  
  const load = async () => {
    setLoading(true);
    try {
      const [p, c, a] = await Promise.all([fetchPosts(), fetchCats(), fetchAuthors()]);
      // Ensure we always default to arrays to prevent .filter crashes
      setPosts(Array.isArray(p.data) ? p.data : []);
      setCats(Array.isArray(c.data) ? c.data : []);
      setAuthors(Array.isArray(a.data) ? a.data : []);
    } catch (error) {
      console.error("Initial data load failed:", error);
      setPosts([]);
      setCats([]);
      setAuthors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return; 
    try {
      const res = await fetch("/api/admin/posts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY_TO_SEND
        },
        body: JSON.stringify({ _id: id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      
      // Update local state to remove item immediately
      setPosts((prev) => prev.filter((p) => p._id !== id));
      console.log("Post deleted successfully:", id);
    } catch (error) {
      console.error("Delete post error:", error);
      console.error("Could not delete post.");
    }
  };

  const handleEdit = (id) => {
    setEditingPostId(id);
    setIsModalOpen(true);
  };

  const handleAdded = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    closeModal();
  };
  
  const handleUpdated = (updatedPost) => {
      setPosts(prev => prev.map(post => 
          post._id === updatedPost._id ? updatedPost : post
      ));
      closeModal();
  };

  /* ------------- filtering ------------- */
  const filtered = useMemo(() => {
    if (!catFilter) return posts;
    // Updated filter to check subcategory_ids array if that's what backend returns
    // Or fallback to checking if the category name exists in the populated array
    return posts.filter((p) => {
        // If posts have subcategory_ids array populated with objects
        if (Array.isArray(p.subcategory_ids)) {
            return p.subcategory_ids.some(sub => sub.name === catFilter);
        }
        return false;
    });
  }, [posts, catFilter]);

  /* ------------- render ------------- */
  const modalTitle = editingPostId ? "Edit Post" : "Add New Post";
  
  return (
    <div className="container mx-auto px-6 pb-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 uppercase">Posts</h1>

      <main>
        {/* top bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={openCreateModal}
            className="flex items-center text-sm px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            New Post
          </button>

          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="bg-[#ffedd9] border border-black rounded-lg px-4 py-2 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* table */}
        <Table
          data={filtered}
          columns={POSTS_COLUMNS}
          loading={loading}
          searchable
          sortable
          searchPlaceholder="Search by title..."
          emptyMessage="No posts found."
          // Removed 'author_name' from searchKeys as it doesn't exist on the root object
          searchKeys={["title"]} 
          onReload={load}
          handlers={{ handleEdit, handleDelete }}
        />
      </main>

      {/* MODAL */}
      <Modal
        key={`post-modal-${editingPostId || 'new'}`} 
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalTitle}
        className="max-w-4xl"
      >
        {editingPostId ? (
            <EditPostForm
                postId={editingPostId}
                onPostUpdated={handleUpdated}
                onCancel={closeModal}
            />
        ) : (
            <AddPostForm
                onPostAdded={handleAdded}
                onCancel={closeModal}
            />
        )}
      </Modal>
    </div>
  );
}