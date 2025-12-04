// src/components/admin/posts/AddPostForm.jsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Save, Loader2 } from "lucide-react";
import Select from "@/components/ui/select/Select";
import RichTextEditor from "../ui/text-editor/TextEditor";

// Utils
import { slugify } from "@/utils/slugify";

// Sub-Components
import FeaturedImageSection from "./form-sections/FeaturedImageSection";
import ClassificationSection from "./form-sections/ClassificationSection";
import PermissionsSection from "./form-sections/PermissionsSection";

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const API_HEADERS = { "x-api-key": API_KEY };

export default function AddPostForm({ onPostAdded, onCancel }) {
  // --- STATE MANAGEMENT ---
  const [values, setValues] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author_id: "",
    category_ids: [],
    subcategory_ids: [],
    tags: "",
    status: "draft",
    featured_image: "",
    comments_enabled: true,
  });

  const [permissions, setPermissions] = useState({
    is_featured: false,
    is_premium: false,
    is_slide_article: false,
  });

  const [classificationMode, setClassificationMode] = useState("category");

  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [imageError, setImageError] = useState("");

  // Data State (Raw Data)
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  // Form Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- DATA LOADING ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const [authorsRes, catsRes, subcatsRes] = await Promise.all([
          fetch("/api/admin/authors", { headers: API_HEADERS }),
          fetch("/api/admin/categories", { headers: API_HEADERS }),
          fetch("/api/admin/subcategories", { headers: API_HEADERS }),
        ]);

        const aData = await authorsRes.json();
        const catsData = await catsRes.json();
        const subCatsData = await subcatsRes.json();

        setAuthors(Array.isArray(aData.data) ? aData.data : []);
        setCategories(Array.isArray(catsData) ? catsData : []);
        setSubCategories(Array.isArray(subCatsData) ? subCatsData : []);
      } catch (err) {
        console.error("Error loading form data", err);
      }
    };
    loadData();
  }, []);

  // --- DERIVED OPTIONS (The Update Logic) ---
  
  // 1. Identify Parent Category IDs (Categories that act as parents to subcategories)
  const parentCategoryIds = useMemo(() => {
    return new Set(subCategories.map((sub) => sub.parent_id));
  }, [subCategories]);

  // 2. Create Option Lists
  const allCategoryOptions = useMemo(() => 
    categories.map((c) => ({ label: c.name, value: c._id })), 
    [categories]
  );

  // 3. Filtered list: Only categories that are NOT parents (Leaf nodes)
  const leafCategoryOptions = useMemo(() => 
    categories
      .filter((c) => !parentCategoryIds.has(c._id))
      .map((c) => ({ label: c.name, value: c._id })), 
    [categories, parentCategoryIds]
  );

  const subCategoryOptions = useMemo(() => 
    subCategories.map((s) => ({ label: s.name, value: s._id })), 
    [subCategories]
  );

  const authorOptions = useMemo(
    () => authors.map((a) => ({ label: a.name, value: a._id })),
    [authors]
  );

  // --- AUTO SLUGIFY ---
  useEffect(() => {
    if (values.title && !values.slug) {
      setValues((s) => ({ ...s, slug: slugify(values.title) }));
    }
  }, [values.title, values.slug]);

  // --- HANDLERS ---
  const handleChange = (e) => {
    if (typeof e === "string") {
      setValues((s) => ({ ...s, content: e }));
      setError("");
      return;
    }
    const { name, value, type, checked } = e.target;
    setError("");
    setValues((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    setPermissions((prev) => ({ ...prev, [name]: checked }));
  };

  const handleModeChange = (mode) => {
    setClassificationMode(mode);
    setValues((prev) => ({
      ...prev,
      // If switching to subcategory only, clear categories
      category_ids: mode === "subcategory" ? [] : prev.category_ids,
      // If switching to category only, clear subcategories
      subcategory_ids: mode === "category" ? [] : prev.subcategory_ids,
    }));
  };

  // Image Handlers
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImageError("");
      setValues((s) => ({ ...s, featured_image: "" }));
    }
  };

  const uploadImage = useCallback(async (file) => {
    setImageUploadLoading(true);
    setImageError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/posts/imageUpload", {
        method: "POST",
        headers: API_HEADERS,
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Upload failed");
      return json.imageUrl;
    } catch (err) {
      setImageError(err.message);
      return null;
    } finally {
      setImageUploadLoading(false);
    }
  }, []);

  const uploadInlineImage = useCallback(async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/posts/inlineImageUpload", {
        method: "POST",
        headers: API_HEADERS,
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Inline upload failed");
      return json.imageUrl;
    } catch (err) {
      console.error(err);
      throw new Error(err.message || "Failed to upload inline image.");
    }
  }, []);

  // Select Handlers
  const handleSingleSelectChange = (name, newValue) => {
    setValues((s) => ({ ...s, [name]: newValue ? newValue.value : "" }));
  };

  const handleMultiSelectChange = (name, newValue) => {
    setValues((s) => ({ ...s, [name]: newValue.map((item) => item.value) }));
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setImageError("");

    // Validation
    if (!values.title || !values.slug || !values.content || !values.author_id) {
      setError("Title, slug, Content, and Author are required.");
      setLoading(false);
      return;
    }

    if (classificationMode === "category" && values.category_ids.length === 0) {
      setError("Please select at least one Category.");
      setLoading(false);
      return;
    }
    if (
      classificationMode === "subcategory" &&
      values.subcategory_ids.length === 0
    ) {
      setError("Please select at least one Subcategory.");
      setLoading(false);
      return;
    }
    if (classificationMode === "both") {
      if (
        values.category_ids.length === 0 ||
        values.subcategory_ids.length === 0
      ) {
        setError("Both Category and Subcategory selections are required.");
        setLoading(false);
        return;
      }
    }

    const hasContent =
      values.content.replace(/<[^>]*>/g, "").trim().length > 0;
    if (!hasContent) {
      setError("Content must contain actual text.");
      setLoading(false);
      return;
    }

    // Image Upload
    let finalImageUrl = values.featured_image;
    if (selectedFile) {
      const url = await uploadImage(selectedFile);
      if (!url) {
        setLoading(false);
        return;
      }
      finalImageUrl = url;
    }

    const payload = {
      ...values,
      featured_image: finalImageUrl,
      author_id: values.author_id || null,
      tags: values.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      permissions: permissions,
    };

    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error || json.message || "Server error");

      onPostAdded(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER HELPERS ---
  const currentAuthorValue =
    authorOptions.find((opt) => opt.value === values.author_id) || null;
  
  const statusOptions = [
    { label: "Draft", value: "draft" },
    { label: "Published", value: "published" },
    { label: "Archived", value: "archived" },
  ];
  const currentStatusValue =
    statusOptions.find((opt) => opt.value === values.status) || null;

  // Determine which Category Options to pass based on mode
  const activeCategoryOptions = 
    classificationMode === "category" ? leafCategoryOptions : allCategoryOptions;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-sm bg-red-100 text-red-700 p-3 rounded border border-red-300">
          {error}
        </div>
      )}

      {/* 1. Featured Image */}
      <FeaturedImageSection
        featuredImage={values.featured_image}
        selectedFile={selectedFile}
        imageUploadLoading={imageUploadLoading}
        imageError={imageError}
        onFileChange={handleFileChange}
        onUrlChange={handleChange}
        onRemoveImage={() => {
          setSelectedFile(null);
          setValues((s) => ({ ...s, featured_image: "" }));
          setImageError("");
        }}
      />

      {/* 2. Basic Info (Title/Slug) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            name="title"
            value={values.title}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
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
      </div>

      {/* 3. Excerpt */}
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

      {/* 4. Content */}
      <div>
        <label className="block text-sm font-medium mb-1">Content *</label>
        <RichTextEditor
          value={values.content}
          onChange={handleChange}
          onImageUpload={uploadInlineImage}
        />
      </div>

      {/* 5. Classification */}
      <ClassificationSection
        mode={classificationMode}
        onModeChange={handleModeChange}
        // Pass the dynamically filtered options here
        categoryOptions={activeCategoryOptions}
        subCategoryOptions={subCategoryOptions}
        selectedCategoryIds={values.category_ids}
        selectedSubCategoryIds={values.subcategory_ids}
        onCategoryChange={(val) => handleMultiSelectChange("category_ids", val)}
        onSubCategoryChange={(val) =>
          handleMultiSelectChange("subcategory_ids", val)
        }
      />

      {/* 6. Author & Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Author *</label>
          <Select
            options={authorOptions}
            value={currentAuthorValue}
            onChange={(val) => handleSingleSelectChange("author_id", val)}
            placeholder="Select an Author"
            isSearchable={true}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <Select
            options={statusOptions}
            value={currentStatusValue}
            onChange={(val) => handleSingleSelectChange("status", val)}
            placeholder="Select Status"
            isClearable={false}
          />
        </div>
      </div>

      {/* 7. Tags */}
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

      {/* 8. Permissions */}
      <PermissionsSection
        permissions={permissions}
        commentsEnabled={values.comments_enabled}
        onPermissionChange={handlePermissionChange}
        onCommentsChange={handleChange}
      />

      {/* 9. Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading || imageUploadLoading}
          className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading || imageUploadLoading}
          className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-60 flex items-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" /> Save Post
            </>
          )}
        </button>
      </div>
    </form>
  );
}