// src/components/admin/posts/EditPostForm.jsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Save, X, Loader2, Upload, RotateCw } from "lucide-react";
import Select from "@/components/ui/select/Select";
import RichTextEditor from "../ui/text-editor/TextEditor";
import Image from "next/image";

// --- MALAYALAM SLUGIFY UTILS ---
const MALAYALAM_MAP = {
  അ: "a", ആ: "aa", ഇ: "i", ഈ: "ee", ഉ: "u", ഊ: "oo", ഋ: "ru", എ: "e", ഏ: "e", ഐ: "ai",
  ഒ: "o", ഓ: "o", ഔ: "au", ക: "ka", ഖ: "kha", ഗ: "ga", ഘ: "gha", ങ: "nga", ച: "cha",
  ഛ: "chha", ജ: "ja", ഝ: "jha", ഞ: "nja", ട: "ta", ഠ: "tha", ഡ: "da", ഢ: "dha", ണ: "na",
  ത: "ta", ഥ: "tha", ദ: "da", ധ: "dha", ന: "na", പ: "pa", ഫ: "pha", ബ: "ba", ഭ: "bha",
  മ: "ma", യ: "ya", ര: "ra", ല: "la", വ: "va", ശ: "sha", ഷ: "sha", സ: "sa", ഹ: "ha",
  ള: "la", ഴ: "zha", റ: "ra", ൺ: "n", ൻ: "n", ർ: "r", ൽ: "l", ൾ: "l", ൿ: "k",
  "ാ": "aa", "ി": "i", "ീ": "ee", "ു": "u", "ൂ": "oo", "ൃ": "ru", "െ": "e", "േ": "e",
  "ൈ": "ai", "ൊ": "o", "ോ": "o", "ൗ": "au", "ൌ": "au", "ം": "m", "ഃ": "h", "്": "",
  "0": "0", "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8", "9": "9"
};

const CONSONANTS = new Set([
  "ക", "ഖ", "ഗ", "ഘ", "ങ", "ച", "ഛ", "ജ", "ഝ", "ഞ", "ട", "ഠ", "ഡ", "ഢ", "ണ",
  "ത", "ഥ", "ദ", "ധ", "ന", "പ", "ഫ", "ബ", "ഭ", "മ", "യ", "ര", "ല", "വ", "ശ",
  "ഷ", "സ", "ഹ", "ള", "ഴ", "റ"
]);

const VOWEL_SIGNS = new Set([
  "ാ", "ി", "ീ", "ു", "ൂ", "ൃ", "െ", "േ", "ൈ", "ൊ", "ോ", "ൗ", "ൌ"
]);

const VIRAMA = "്";

const slugify = (text) => {
  if (!text) return "";

  const normalized = text.toString().toLowerCase();
  let result = "";

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const nextChar = normalized[i + 1];

    if (CONSONANTS.has(char)) {
      const baseConsonant = MALAYALAM_MAP[char];

      if (nextChar === VIRAMA) {
        result += baseConsonant.slice(0, -1);
        i++; 
        continue;
      }

      if (VOWEL_SIGNS.has(nextChar)) {
        const consonantWithoutA = baseConsonant.slice(0, -1);
        const vowelSound = MALAYALAM_MAP[nextChar];
        result += consonantWithoutA + vowelSound;
        i++;
        continue;
      }

      result += baseConsonant;
    }
    else if (MALAYALAM_MAP[char] !== undefined) {
      result += MALAYALAM_MAP[char];
    } else {
      result += char;
    }
  }
  return result
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+|-+$/g, "");
};
// --- END UTILS ---

// --- NEW TOGGLE COMPONENT (Matched AddPostForm) ---
const ToggleSwitch = ({ label, name, checked, onChange }) => (
  <label className="inline-flex items-center cursor-pointer group p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-200">
    <input
      type="checkbox"
      name={name}
      className="sr-only peer"
      checked={checked}
      onChange={onChange}
    />
    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
    <span className="ms-3 text-sm font-medium text-gray-700 group-hover:text-gray-900 select-none">
      {label}
    </span>
  </label>
);
// --- END COMPONENT ---

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const API_HEADERS = { "x-api-key": API_KEY };

const fetchPost = async (postId) => {
    const res = await fetch(`/api/admin/posts?id=${postId}`);
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch post");
    }
    return res.json();
};

const fetchAuthors = async () => {
  const res = await fetch("/api/admin/authors", { headers: API_HEADERS });
  if (!res.ok) throw new Error("Failed");
  return res.json();
};

const fetchSubcategories = async () => {
  const res = await fetch("/api/admin/subcategories", { headers: API_HEADERS });
  if (!res.ok) throw new Error("Failed");
  return res.json();
};

export default function EditPostForm({ postId, onPostUpdated, onCancel }) {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [initialPostData, setInitialPostData] = useState(null);
  const [originalTitle, setOriginalTitle] = useState("");

  const [values, setValues] = useState({
    _id: postId,
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

  // Permissions State
  const [permissions, setPermissions] = useState({
    is_featured: false,
    is_premium: false,
    is_slide_article: false,
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [imageError, setImageError] = useState("");

  const [authors, setAuthors] = useState([]);
  const [allSubCats, setAllSubCats] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Data Loading and Initialization ---
  useEffect(() => {
    const loadData = async () => {
      setIsInitialLoading(true);
      try {
        const [postRes, authorsRes, subcategoriesRes] = await Promise.all([
          fetchPost(postId),
          fetchAuthors(),
          fetchSubcategories(),
        ]);

        const post = postRes.data;

        // Populate Permissions State
        if (post.permissions) {
            setPermissions({
                is_featured: post.permissions.is_featured || false,
                is_premium: post.permissions.is_premium || false,
                is_slide_article: post.permissions.is_slide_article || false,
            });
        }

        const formattedTags = Array.isArray(post.tags) ? post.tags.join(", ") : "";
        const authorId = post.author_id ? (post.author_id._id || post.author_id) : "";
        const subcategoryIds = Array.isArray(post.subcategory_ids)
            ? post.subcategory_ids.map(id => id._id || id)
            : [];

        const initialValues = {
            _id: post._id,
            title: post.title || "",
            slug: post.slug || "",
            excerpt: post.excerpt || "",
            content: post.content || "",
            author_id: authorId,
            subcategory_ids: subcategoryIds,
            tags: formattedTags,
            status: post.status || "draft",
            featured_image: post.featured_image || "",
            comments_enabled: post.comments_enabled ?? true,
        };

        setValues(initialValues);
        setOriginalTitle(post.title);
        setInitialPostData(post); 
        
        setAuthors(authorsRes.data || authorsRes || []);
        setAllSubCats(subcategoriesRes.data || subcategoriesRes || []);

      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message || "Failed to load post and form data");
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadData();
  }, [postId]);

  // --- Slug Generation Logic ---
  useEffect(() => {
    const isSlugManuallyEdited = values.slug !== slugify(originalTitle);
    
    if (values.title && !isSlugManuallyEdited && values.title !== originalTitle) {
      setValues((s) => ({ ...s, slug: slugify(values.title) }));
    }
  }, [values.title, originalTitle, values.slug]);


  const handleChange = (e) => {
    if (typeof e === "string") {
      setValues((s) => ({ ...s, content: e }));
      setError("");
      return;
    }

    const { name, value, type, checked } = e.target;
    setError("");

    if (name === 'slug') {
        const newSlug = slugify(value);
        setValues((s) => ({ ...s, [name]: newSlug }));
    } else {
        setValues((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    setPermissions((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleRegenerateSlug = () => {
    if (values.title) {
        setValues((s) => ({ ...s, slug: slugify(values.title) }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImageError("");
      setValues((s) => ({ ...s, featured_image: "" }));
    } else {
      setSelectedFile(null);
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
      if (!res.ok) throw new Error(json.message || "Image upload failed");

      return json.imageUrl;
    } catch (err) {
      console.error("Image upload error:", err);
      setImageError(err.message);
      setValues((s) => ({ ...s, featured_image: initialPostData?.featured_image || "" }));
      return null;
    } finally {
      setImageUploadLoading(false);
    }
  }, [initialPostData]); 

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
      if (!res.ok)
        throw new Error(json.message || "Inline image upload failed");

      return json.imageUrl;
    } catch (err) {
      console.error("Inline image upload error:", err);
      throw new Error(err.message || "Failed to upload inline image.");
    }
  }, []);

  const handleSingleSelectChange = (name, newValue) => {
    setValues((s) => ({
      ...s,
      [name]: newValue ? newValue.value : "",
    }));
  };

  const handleMultiSelectChange = (name, newValue) => {
    setValues((s) => ({
      ...s,
      [name]: newValue.map((item) => item.value),
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

    const hasContent = values.content.replace(/<[^>]*>/g, "").trim().length > 0;
    if (!hasContent) {
      setError("Content must contain actual text.");
      setLoading(false);
      return;
    }
    
    if (values.slug.trim() === '') {
        setError("Slug cannot be empty.");
        setLoading(false);
        return;
    }

    let finalImageUrl = values.featured_image;

    if (selectedFile) {
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

    const formattedTagsArray = values.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);


    const payload = {
      ...values,
      featured_image: finalImageUrl,
      author_id: values.author_id === "" ? null : values.author_id,
      tags: formattedTagsArray,
      permissions: permissions, // Updated permissions
      _id: postId,
    };

    try {
      const res = await fetch("/api/admin/posts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");

      onPostUpdated(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Select Option Definitions ---
  const authorOptions = useMemo(() => authors.map((author) => ({
    label: author.name,
    value: author._id,
  })), [authors]);

  const currentAuthorValue =
    authorOptions.find((opt) => opt.value === values.author_id) || null;

  const statusOptions = [
    { label: "Draft", value: "draft" },
    { label: "Published", value: "published" },
    { label: "Archived", value: "archived" },
  ];
  const currentStatusValue =
    statusOptions.find((opt) => opt.value === values.status) || null;

  const subcategoryOptions = useMemo(() => allSubCats.map((subCat) => ({
    label: subCat.name,
    value: subCat._id,
  })), [allSubCats]);

  const currentSubcatValues = subcategoryOptions.filter((opt) =>
    values.subcategory_ids.includes(opt.value)
  );
  // --- End Select Option Definitions ---

  const imagePreviewUrl = values.featured_image
    ? values.featured_image
    : selectedFile
    ? URL.createObjectURL(selectedFile)
    : null;

    if (isInitialLoading) {
        return (
            <div className="flex justify-center items-center h-40 text-blue-600">
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Loading post data...
            </div>
        );
    }

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

        {imagePreviewUrl && (
          <div className="relative w-full max-w-sm h-40 overflow-hidden rounded-lg shadow-md">
            <Image
              src={imagePreviewUrl}
              alt="Featured Preview"
              fill
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setValues((s) => ({ ...s, featured_image: "" }));
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
          disabled={imageUploadLoading || (!!values.featured_image && !selectedFile)}
          className="w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-red-50 file:text-red-700
                  hover:file:bg-red-100"
        />

        {imageUploadLoading && (
          <div className="flex items-center text-red-600 text-sm mt-1">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading to
            Cloudinary...
          </div>
        )}

        <input
          name="featured_image"
          value={values.featured_image}
          onChange={handleChange}
          placeholder="https://existing-image-url.com/image.jpg"
          disabled={imageUploadLoading || !!selectedFile}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
        />
      </div>

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
        <div className="flex gap-2">
            <input
                name="slug"
                value={values.slug}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
                type="button"
                onClick={handleRegenerateSlug}
                title="Regenerate slug from current title"
                className="px-3 py-2 text-sm border rounded-md bg-gray-100 hover:bg-gray-200 transition flex items-center"
            >
                <RotateCw className="w-4 h-4" />
            </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Slug is auto-generated but can be manually edited or regenerated.</p>
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
          onImageUpload={uploadInlineImage}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Author *</label>
          <Select
            options={authorOptions}
            value={currentAuthorValue}
            onChange={(newValue) =>
            handleSingleSelectChange("author_id", newValue)
            }
            placeholder="Select an Author"
            isSearchable={true}
            isClearable={false}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <Select
            options={statusOptions}
            value={currentStatusValue}
            onChange={(newValue) => handleSingleSelectChange("status", newValue)}
            placeholder="Select Status"
            isClearable={false}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Sub-categories (Multi-select) *
        </label>
        <Select
          options={subcategoryOptions}
          value={currentSubcatValues}
          onChange={(newValue) =>
            handleMultiSelectChange("subcategory_ids", newValue)
          }
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

      {/* Permissions Section (New Grid Layout) */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <label className="block text-sm font-bold text-gray-700 mb-3">Permissions & Settings</label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <ToggleSwitch
            name="is_featured"
            label="Is Featured"
            checked={permissions.is_featured}
            onChange={handlePermissionChange}
          />

          <ToggleSwitch
            name="is_premium"
            label="Is Premium"
            checked={permissions.is_premium}
            onChange={handlePermissionChange}
          />

          <ToggleSwitch
            name="is_slide_article"
            label="Is Slide Article"
            checked={permissions.is_slide_article}
            onChange={handlePermissionChange}
          />

          <ToggleSwitch
            name="comments_enabled"
            label="Enable Comments"
            checked={values.comments_enabled}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading || imageUploadLoading}
          className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition"
        >
          <X className="inline w-4 h-4 mr-1" /> Cancel
        </button>

        <button
          type="submit"
          disabled={loading || imageUploadLoading}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 transition" 
        >
          {loading ? (
            <>
              <Loader2 className="inline w-4 h-4 mr-1 animate-spin" />
              Updating…
            </>
          ) : (
            <>
              <Save className="inline w-4 h-4 mr-1" />
              Update Post
            </>
          )}
        </button>
      </div>
    </form>
  );
}