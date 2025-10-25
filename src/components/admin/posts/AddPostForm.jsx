// src/components/admin/posts/AddPostForm.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, X, Loader2, Upload } from "lucide-react";
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

  // State for image handling
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [imageError, setImageError] = useState("");


  const [authors, setAuthors] = useState([]);
  const [allSubCats, setAllSubCats] = useState([]);

  const [loading, setLoading] = useState(false); // Main form submission loading
  const [error, setError] = useState(""); // Main form error

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

  // New handler for file input
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImageError("");
      // Clear current image URL in state if a new file is selected
      setValues(s => ({ ...s, featured_image: "" }));
    } else {
      setSelectedFile(null);
    }
  };

  // Function to upload image to the server/Cloudinary
  const uploadImage = useCallback(async (file) => {
    setImageUploadLoading(true);
    setImageError("");

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Call the new API route
      const res = await fetch('/api/admin/posts/imageUpload', {
        method: 'POST',
        headers: API_HEADERS, // Pass API key for server auth
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Image upload failed');

      // Success: return the secured URL
      return json.imageUrl;
    } catch (err) {
      console.error("Image upload error:", err);
      setImageError(err.message);
      setValues(s => ({ ...s, featured_image: "" })); // Clear URL on error
      return null;
    } finally {
      setImageUploadLoading(false);
    }
  }, []);

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
    setImageError("");

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

    let finalImageUrl = values.featured_image;

    if (selectedFile) {
      // Stop if image upload is already in progress, though the button is disabled, this is a safety check
      if (imageUploadLoading) {
        setLoading(false);
        return;
      }

      const url = await uploadImage(selectedFile);

      if (!url) {
        setLoading(false);
        return;
      }
      finalImageUrl = url;
    }

    const payload = {
      ...values,
      featured_image: finalImageUrl, // Use the final confirmed URL
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
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Server error");

      onPostAdded(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      // Clear file selection after successful submission
      if (finalImageUrl) setSelectedFile(null);
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

  // URL for image preview (either uploaded URL or local file preview)
  const imagePreviewUrl = values.featured_image
    ? values.featured_image
    : selectedFile
      ? URL.createObjectURL(selectedFile)
      : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-sm bg-red-100 text-red-700 p-3 rounded border border-red-300">
          {error}
        </div>
      )}

      {/* FEATURED IMAGE UPLOAD SECTION */}
      <div className="border p-4 rounded-lg bg-gray-50 space-y-3">
        <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center">
          <Upload className="w-4 h-4 mr-2" /> Featured Image
        </label>

        {imageError && (
          <div className="text-xs bg-red-100 text-red-700 p-2 rounded border border-red-300">
            {imageError}
          </div>
        )}

        {/* Display Current or Preview Image */}
        {imagePreviewUrl && (
          <div className="relative w-full max-w-sm h-40 overflow-hidden rounded-lg shadow-md">
            <img
              src={imagePreviewUrl}
              alt="Featured Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setValues(s => ({ ...s, featured_image: "" }));
                setImageError("");
              }}
              className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition"
              aria-label="Remove Image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <p className="text-xs text-gray-500">
          Select a file to upload or enter a public URL below.
        </p>

        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          disabled={imageUploadLoading || !!values.featured_image}
          className="w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-red-50 file:text-red-700
                  hover:file:bg-red-100"
        />

        {imageUploadLoading && (
          <div className="flex items-center text-red-600 text-sm mt-1">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading to Cloudinary...
          </div>
        )}

        {/* Fallback/Manual URL Input */}
        <input
          name="featured_image"
          value={values.featured_image}
          onChange={handleChange}
          placeholder="https://existing-image-url.com/image.jpg"
          disabled={imageUploadLoading || !!selectedFile}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
        />
      </div>
      {/* END FEATURED IMAGE UPLOAD SECTION */}


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
          value={values.content}
          onChange={handleChange}
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
          isClearable={false}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Sub-categories (Multi-select) *</label>
        <Select
          options={subcategoryOptions}
          value={currentSubcatValues}
          onChange={(newValue) => handleMultiSelectChange('subcategory_ids', newValue)}
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
          isClearable={false}
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
          disabled={loading || imageUploadLoading}
          className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100"
        >
          <X className="inline w-4 h-4 mr-1" /> Cancel
        </button>

        <button
          type="submit"
          disabled={loading || imageUploadLoading}
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