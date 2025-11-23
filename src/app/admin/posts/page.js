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
    return [];
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
    return Promise.reject({
      message: "Failed to fetch posts",
    });
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
    return Promise.reject({
      message: "Failed to fetch categories",
    });
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
    return Promise.reject({
      message: "Failed to fetch authors",
    });
  }
};

/* ------------------------------------------------------------------ */
/* Column definitions                                                */
/* ------------------------------------------------------------------ */
// (POSTS_COLUMNS remains unchanged, as it correctly calls handleEdit/handleDelete)

const POSTS_COLUMNS = [
  {
    key: "title",
    header: "Title",
    sortable: true,
    className: "font-bold max-w-xs truncate",
  },
  {
    key: "author_name",
    header: "Author",
    sortable: true,
  },
  {
    key: "created_at",
    header: "Date",
    sortable: true,
    className: "text-gray-600",
    render: (p) => new Date(p.created_at).toLocaleDateString(),
  },
  {
    key: "views",
    header: "Views",
    sortable: true,
    className: "text-center",
    render: (p) => (
      <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
        {p.views}
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
/* Page component                                                    */
/* ------------------------------------------------------------------ */
export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [categories, setCats] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // MODIFIED: State to handle both Add and Edit modal flows
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null); // Tracks the ID of the post being edited

  const [catFilter, setCatFilter] = useState("");

  // Helper to open the modal for creating a new post
  const openCreateModal = () => {
    setEditingPostId(null); // Explicitly clear any editing ID
    setIsModalOpen(true);
  };

  // Helper to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    // Reset editingPostId after closing animation finishes (optional delay)
    setTimeout(() => setEditingPostId(null), 300); 
  };
  
  const load = async () => {
    setLoading(true);
    try {
      const [p, c, a] = await Promise.all([fetchPosts(), fetchCats(), fetchAuthors()]);
      setPosts(p.data || []);
      setCats(c.data || []);
      setAuthors(a.data || []);
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
    // MODIFIED: Replaced confirm with window.confirm (standard DOM API)
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
      setPosts((prev) => prev.filter((p) => p._id !== id));
      console.log("Post deleted successfully:", id);
    } catch (error) {
      console.error("Delete post error:", error);
      // Removed alert, using console error as instructed
      console.error("Could not delete post.");
    }
  };

  // MODIFIED: handleEdit now sets the state to open the Edit modal
  const handleEdit = (id) => {
    setEditingPostId(id);
    setIsModalOpen(true);
  };

  // Handler for successful ADDITION
  const handleAdded = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    closeModal();
  };
  
  // NEW Handler for successful UPDATE
  const handleUpdated = (updatedPost) => {
      // Find the updated post by ID and replace it in the array
      setPosts(prev => prev.map(post => 
          post._id === updatedPost._id ? updatedPost : post
      ));
      closeModal();
  };

  /* ------------- filtering ------------- */
  const filtered = useMemo(() => {
    if (!catFilter) return posts;
    return posts.filter((p) => p.category_name === catFilter);
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
          searchPlaceholder="Search by title, author, or category…"
          emptyMessage="No posts found."
          searchKeys={["title", "author_name", "category_name"]}
          onReload={load}
          handlers={{ handleEdit, handleDelete }}
        />
      </main>

      {/* MODAL: Handles both Add and Edit */}
      <Modal
        // Key ensures component remounts when switching between Add/Edit
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