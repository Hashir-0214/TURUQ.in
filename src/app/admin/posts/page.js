"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { PlusCircle, Edit, Eye, Trash2 } from "lucide-react";

import Table from "@/components/admin/ui/Table";
import Modal from "@/components/admin/ui/modal/Modal";
import AddPostForm from "@/components/admin/posts/AddPostForm";

/* ------------------------------------------------------------------ */
/*  API helpers                                                       */
/* ------------------------------------------------------------------ */
const fetchPosts = async (addNotification) => {
  const API_KEY_TO_SEND = process.env.NEXT_PUBLIC_API_KEY;

  if (!API_KEY_TO_SEND) {
    const msg = "API Key is missing. Check your .env.local file.";
    console.error(msg);
    addNotification("error", msg);
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
    if (addNotification) {
      addNotification("error", "Failed to fetch posts");
    }
    return Promise.reject({
      message: "Failed to fetch posts",
    });
  }
};
const fetchCats = (addNotification) => {
  return fetch("/api/admin/categories", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .catch((error) => {
      console.error("Fetch categories error:", error);
      if (addNotification) {
        addNotification("error", "Failed to fetch categories");
      }
      return Promise.reject({
        message: "Failed to fetch categories",
      });
    });
};

/* ------------------------------------------------------------------ */
/*  Column definitions                                                */
/* ------------------------------------------------------------------ */
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
    key: "category_name",
    header: "Category",
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
        className={`px-2 py-1 rounded text-xs font-semibold border ${
          p.status === "published"
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
          href={`/post/${post.slug || post._id}`}
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
/*  Page component                                                    */
/* ------------------------------------------------------------------ */
export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [categories, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  const [catFilter, setCatFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([fetchPosts(), fetchCats()]);
      setPosts(p.data || []);
      setCats(c.data || []);
    } catch {
      setPosts([]);
      setCats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ------------- handlers ------------- */
  const handleDelete = async (id) => {
    if (!confirm("Delete this post?")) return;
    try {
      const res = await fetch("/api/admin/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id }),
      });
      if (!res.ok) throw new Error();
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert("Could not delete post.");
    }
  };

  const handleEdit = (id) => {
    /* TODO: navigate to /admin/posts/edit/[id] */
    console.log("Edit post:", id);
  };

  const handleAdded = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setModal(false);
  };

  /* ------------- filtering ------------- */
  const filtered = useMemo(() => {
    if (!catFilter) return posts;
    return posts.filter((p) => p.category_name === catFilter);
  }, [posts, catFilter]);

  /* ------------- render ------------- */
  return (
    <div className="container mx-auto px-6 pb-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 uppercase">Posts</h1>

      <main>
        {/* top bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setModal(true)}
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

      {/* create modal */}
      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title="Add New Post"
        className="max-w-2xl"
      >
        <AddPostForm
          onPostAdded={handleAdded}
          onCancel={() => setModal(false)}
        />
      </Modal>
    </div>
  );
}
