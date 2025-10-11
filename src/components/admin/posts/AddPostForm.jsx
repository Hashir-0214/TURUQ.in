// src/components/admin/posts/AddPostForm.jsx
"use client";

import { useState, useEffect } from "react";
import { Save, X, Loader2 } from "lucide-react";
import Select from "@/components/ui/select/Select";
import RichTextEditor from "../ui/text-editor/TextEditor";

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const API_HEADERS = { "x-api-key": API_KEY };

const fetchAuthors = async () => {
  const res = await fetch("/api/admin/authors", { headers: API_HEADERS });
  if (!res.ok) throw new Error('Failed to fetch authors');
  return res.json();
};

const fetchSubcategories = async () => {
  const res = await fetch('/api/admin/subcategories', {
    method: 'GET',
    headers: API_HEADERS
  });
  if (!res.ok) throw new Error('Failed to fetch subcategories');
  return res.json();
};

export default function AddPostForm({ onPostAdded, onCancel }) {
  const [values, setValues] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author_id: "",
    subcategory_ids: [],
    tags: "",
    status: "draft",
    featured_image: "",
    comments_enabled: true,
  });

  const [authors, setAuthors] = useState([]);
  const [allSubCats, setAllSubCats] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // FIX: Properly handle async operations in useEffect
  useEffect(() => {
    const loadData = async () => {
      try {
        const [authorsData, subcategoriesData] = await Promise.all([
          fetchAuthors(),
          fetchSubcategories()
        ]);
        setAuthors(authorsData || []);
        setAllSubCats(subcategoriesData || []);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load form data");
      }
    };

    console.log("Api Key:", API_KEY)
    loadData();
  }, []);

  useEffect(() => {
    if (values.title) {
      setValues((s) => ({ ...s, slug: slugify(values.title) }));
    }
  }, [values.title]);

  const handleChange = (e) => {
    if (typeof e === 'string') {
      setValues((s) => ({ ...s, content: e }));
      setError("");
      return;
    }

    const { name, value, type, checked } = e.target;
    setError("");

    setValues((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSingleSelectChange = (name, newValue) => {
    setValues(s => ({
      ...s,
      [name]: newValue ? newValue.value : ''
    }));
  };

  const handleMultiSelectChange = (name, newValue) => {
    setValues(s => ({
      ...s,
      [name]: newValue.map(item => item.value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!values.title || !values.slug || !values.content || !values.author_id) {
      setError("Title, slug, Content, and Author are required.");
      setLoading(false);
      return;
    }

    const hasContent = values.content.replace(/<[^>]*>/g, '').trim().length > 0;
    if (!hasContent) {
      setError("Content must contain actual text.");
      setLoading(false);
      return;
    }

    const payload = {
      ...values,
      author_id: values.author_id === "" ? null : values.author_id,
      tags: values.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...API_HEADERS
        },
        body: JSON.stringify(payload), // Use the cleaned payload
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Server error");

      onPostAdded(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ADDED: Definition for Author Select options (Missing in original code)
  const authorOptions = authors.map(author => ({
    label: author.name,
    value: author._id,
  }));
  const currentAuthorValue = authorOptions.find(opt => opt.value === values.author_id) || null;

  // ADDED: Definition for Status Select options (Missing in original code)
  const statusOptions = [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
    { label: 'Archived', value: 'archived' },
  ];
  const currentStatusValue = statusOptions.find(opt => opt.value === values.status) || null;


  const subcategoryOptions = allSubCats.map(subCat => ({
    label: subCat.name,
    value: subCat._id, // Mongoose ID
  }));

  const currentSubcatValues = subcategoryOptions.filter(opt =>
    values.subcategory_ids.includes(opt.value)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto">
      {error && (
        <div className="text-sm bg-red-100 text-red-700 p-3 rounded border border-red-300">
          {error}
        </div>
      )}

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

      <div>
        <label className="block text-sm font-medium mb-1">Content</label>
        <RichTextEditor
          value={values.content} // Passes the state value
          onChange={handleChange} // Passes the function to update state
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Author *</label>
        <Select
          options={authorOptions}
          value={currentAuthorValue}
          onChange={(newValue) => handleSingleSelectChange('author_id', newValue)}
          placeholder="Select an Author"
          isSearchable={true}
          isClearable={false} // Author is required, so make it not clearable
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Sub-categories (Multi-select) *</label>
        <Select
          options={subcategoryOptions}
          value={currentSubcatValues}
          onChange={(newValue) => handleMultiSelectChange('subcategory_ids', newValue)} // Using the multi-select handler
          placeholder="Select one or more subcategories"
          isMulti={true}
          isSearchable={true}
          size="md"
          variant="default"
        />
      </div>

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

      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <Select
          options={statusOptions}
          value={currentStatusValue}
          onChange={(newValue) => handleSingleSelectChange('status', newValue)}
          placeholder="Select Status"
          isClearable={false} // Status should always have a value
        />
      </div>

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