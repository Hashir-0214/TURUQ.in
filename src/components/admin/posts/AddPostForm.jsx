// src/components/admin/posts/AddPostForm.jsx
"use client";

import { useState, useEffect } from "react";
import { Save, X, Loader2 } from "lucide-react";

/* ---------- tiny helpers ---------- */
const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

export default function AddPostForm({ onPostAdded, onCancel }) {
  /* ---------- form state ---------- */
  const [values, setValues] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author_id: "",
    category_id: "",
    subcategory_id: "",
    tags: "",
    status: "draft",
    featured_image: "",
    comments_enabled: true,
  });

  const [authors, setAuthors] = useState([]);
  const [cats, setCats] = useState([]);
  const [subCats, setSubCats] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------- initial data ---------- */
  useEffect(() => {
    Promise.all([
      fetch("/api/admin/authors").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ])
      .then(([aRes, cRes]) => {
        setAuthors(aRes.data || []);
        setCats(cRes.data || []);
      })
      .catch(() => setAuthors([]) || setCats([]));
  }, []);

  /* ---------- auto-slug ---------- */
  useEffect(() => {
    if (values.title) setValues((s) => ({ ...s, slug: slugify(values.title) }));
  }, [values.title]);

  /* ---------- handlers ---------- */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
    setError("");
  };

  const handleCatChange = (e) => {
    const catId = e.target.value;
    setValues((s) => ({ ...s, category_id: catId, subcategory_id: "" }));
    if (!catId) return setSubCats([]);

    fetch(`/api/admin/categories/${catId}/subcategories`)
      .then((r) => r.json())
      .then((res) => setSubCats(res.data || []))
      .catch(() => setSubCats([]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    /* basic guard */
    if (!values.title || !values.slug) {
      setError("Title & slug are required.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          tags: values.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Server error");

      onPostAdded(json.data); // parent callback
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- render ---------- */
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-sm bg-red-100 text-red-700 p-3 rounded border border-red-300">
          {error}
        </div>
      )}
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1">Title *</label>
        <input
          name="title"
          value={values.title}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
      {/* Slug */}
      <div>
        <label className="block text-sm font-medium mb-1">Slug *</label>
        <input
          name="slug"
          value={values.slug}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
        />
      </div>
      {/* Excerpt */}
      <div>
        <label className="block text-sm font-medium mb-1">Excerpt</label>
        <textarea
          name="excerpt"
          value={values.excerpt}
          onChange={handleChange}
          rows={2}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>
      {/* Content */}
      <div>
        <label className="block text-sm font-medium mb-1">Content</label>
        <textarea
          name="content"
          value={values.content}
          onChange={handleChange}
          rows={6}
          className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
        />
      </div>
      {/* Author */}
      <div>
        <label className="block text-sm font-medium mb-1">Author</label>
        <select
          name="author_id"
          value={values.author_id}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">— Select —</option>
          {authors.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>
      {/* Category → Subcategory */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={values.category_id}
            onChange={handleCatChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">— Select —</option>
            {cats.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sub-category</label>
          <select
            name="subcategory_id"
            value={values.subcategory_id}
            onChange={handleChange}
            disabled={!subCats.length}
            className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100"
          >
            <option value="">— Select —</option>
            {subCats.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Tags */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Tags (comma separated)
        </label>
        <input
          name="tags"
          value={values.tags}
          onChange={handleChange}
          placeholder="travel, food, morocco"
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>
      {/* Status */}
      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select
          name="status"
          value={values.status}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      /* Featured Image */
      <div>
        <label className="block text-sm font-medium mb-1">
          Featured Image URL
        </label>
        <input
          name="featured_image"
          value={values.featured_image}
          onChange={handleChange}
          placeholder="https://……"
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>
      /* Comments enabled */
      <div className="flex items-center gap-2">
        <input
          id="comments"
          name="comments_enabled"
          type="checkbox"
          checked={values.comments_enabled}
          onChange={handleChange}
          className="h-4 w-4"
        />
        <label htmlFor="comments" className="text-sm">
          Enable comments
        </label>
      </div>
      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100"
        >
          <X className="inline w-4 h-4 mr-1" /> Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="inline w-4 h-4 mr-1 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="inline w-4 h-4 mr-1" />
              Save Post
            </>
          )}
        </button>
      </div>
    </form>
  );
}
