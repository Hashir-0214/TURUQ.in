// src/components/admin/posts/EditPostForm.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, X, Loader2, Upload, RotateCw } from "lucide-react";
// Assuming these imports exist in the user's project structure
import Select from "@/components/ui/select/Select";
import RichTextEditor from "../ui/text-editor/TextEditor";

// --- START: Copied and adapted helper functions from AddPostForm.jsx ---

// NOTE: Retaining the Malayalam slugify map and logic for consistency.
const MALAYALAM_MAP = {
  // Vowels (independent)
  അ: "a", ആ: "aa", ഇ: "i", ഈ: "ee", ഉ: "u", ഊ: "oo", ഋ: "ru", എ: "e", ഏ: "e", ഐ: "ai", ഒ: "o", ഓ: "o", ഔ: "au",
  // Consonants (with inherent 'a')
  ക: "ka", ഖ: "kha", ഗ: "ga", ഘ: "gha", ങ: "nga", ച: "cha", ഛ: "chha", ജ: "ja", ഝ: "jha", ഞ: "nja", ട: "ta", ഠ: "tha", ഡ: "da", ഢ: "dha", ണ: "na", ത: "ta", ഥ: "tha", ദ: "da", ധ: "dha", ന: "na", പ: "pa", ഫ: "pha", ബ: "ba", ഭ: "bha", മ: "ma", യ: "ya", ര: "ra", ല: "la", വ: "va", ശ: "sha", ഷ: "sha", സ: "sa", ഹ: "ha", ള: "la", ഴ: "zha", റ: "ra",
  // Chillu characters
  ൺ: "n", ൻ: "n", ർ: "r", ൽ: "l", ൾ: "l", ൿ: "k",
  // Vowel signs
  "ാ": "aa", "ി": "i", "ീ": "ee", "ു": "u", "ൂ": "oo", "ൃ": "ru", "െ": "e", "േ": "e", "ൈ": "ai", "ൊ": "o", "ോ": "o", "ൗ": "au", "ൌ": "au",
  // Other signs
  "ം": "m", "ഃ": "h", "്": "",
  // Digits
  "൦": "0", "൧": "1", "൨": "2", "൩": "3", "൪": "4", "൫": "5", "൬": "6", "൭": "7", "൮": "8", "൯": "9",
};

const CONSONANTS = new Set([
  "ക", "ഖ", "ഗ", "ഘ", "ങ", "ച", "ഛ", "ജ", "ഝ", "ഞ", "ട", "ഠ", "ഡ", "ഢ", "ണ", "ത", "ഥ", "ദ", "ധ", "ന", "പ", "ഫ", "ബ", "ഭ", "മ", "യ", "ര", "ല", "വ", "ശ", "ഷ", "സ", "ഹ", "ള", "ഴ", "റ",
]);

const VOWEL_SIGNS = new Set([
  "ാ", "ി", "ീ", "ു", "ൂ", "ൃ", "െ", "േ", "ൈ", "ൊ", "ോ", "ൗ", "ൌ",
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

  // Apply standard slug rules
  return result
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+|-+$/g, "");
};
// --- END: Copied helper functions ---


const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const API_HEADERS = { "x-api-key": API_KEY };

// Fetch single post data, including populated author and subcategories
const fetchPost = async (postId) => {
    // Note: The API route is updated to handle 'id' as a query param for single fetches
    const res = await fetch(`/api/admin/posts?id=${postId}`, { headers: API_HEADERS });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch post data");
    }
    return res.json();
};

const fetchAuthors = async () => {
  const res = await fetch("/api/admin/authors", { headers: API_HEADERS });
  if (!res.ok) throw new Error("Failed to fetch authors");
  return res.json();
};

const fetchSubcategories = async () => {
  const res = await fetch("/api/admin/subcategories", {
    method: "GET",
    headers: API_HEADERS,
  });
  if (!res.ok) throw new Error("Failed to fetch subcategories");
  return res.json();
};

export default function EditPostForm({ postId, onPostUpdated, onCancel }) {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [initialPostData, setInitialPostData] = useState(null); // The original post data
  const [originalTitle, setOriginalTitle] = useState(""); // For slug re-generation check

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

  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [imageError, setImageError] = useState("");

  const [authors, setAuthors] = useState([]);
  const [allSubCats, setAllSubCats] = useState([]);

  const [loading, setLoading] = useState(false); // Main form submission loading
  const [error, setError] = useState(""); // Main form error

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

        // Flatten tags array to comma-separated string for input field
        const formattedTags = Array.isArray(post.tags) ? post.tags.join(", ") : "";

        // Extract ID from populated author/subcategories
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
        setOriginalTitle(post.title); // Store original title for slug logic
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
    // Determine if the slug was manually changed from the slug generated by the original title
    const isSlugManuallyEdited = values.slug !== slugify(originalTitle);
    
    // Only auto-generate slug if: 
    // 1. Title has content
    // 2. The slug has NOT been manually edited (i.e., it matches the slug generated from the *original* title)
    // 3. The title has changed from the original title
    if (values.title && !isSlugManuallyEdited && values.title !== originalTitle) {
      setValues((s) => ({ ...s, slug: slugify(values.title) }));
    }
  }, [values.title, originalTitle, values.slug]);


  const handleChange = (e) => {
    // RichTextEditor onChange passes a string directly
    if (typeof e === "string") {
      setValues((s) => ({ ...s, content: e }));
      setError("");
      return;
    }

    const { name, value, type, checked } = e.target;
    setError("");

    // Use slugify for the slug input field to normalize characters immediately
    if (name === 'slug') {
        const newSlug = slugify(value);
        setValues((s) => ({ ...s, [name]: newSlug }));
    } else {
        setValues((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
    }
  };

  // Handler to manually regenerate slug from current title
  const handleRegenerateSlug = () => {
    if (values.title) {
        setValues((s) => ({ ...s, slug: slugify(values.title) }));
    }
  };


  // Handler for file input
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImageError("");
      setValues((s) => ({ ...s, featured_image: "" })); // Clear URL if new file selected
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
      // Reset to original image URL on error if available
      setValues((s) => ({ ...s, featured_image: initialPostData?.featured_image || "" }));
      return null;
    } finally {
      setImageUploadLoading(false);
    }
  }, [initialPostData]); 

  // Function to upload inline images for the RichTextEditor
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
      _id: postId, // Ensure the ID is passed for the update query
    };

    try {
      const res = await fetch("/api/admin/posts", {
        method: "PUT", // Use PUT for updating
        headers: {
          "Content-Type": "application/json",
          ...API_HEADERS,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Server error during update");

      onPostUpdated(json.data); // Call the update handler
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      if (selectedFile) setSelectedFile(null);
    }
  };

  // --- Select Option Definitions ---
  const authorOptions = authors.map((author) => ({
    label: author.name,
    value: author._id,
  }));
  const currentAuthorValue =
    authorOptions.find((opt) => opt.value === values.author_id) || null;

  const statusOptions = [
    { label: "Draft", value: "draft" },
    { label: "Published", value: "published" },
    { label: "Archived", value: "archived" },
  ];
  const currentStatusValue =
    statusOptions.find((opt) => opt.value === values.status) || null;

  const subcategoryOptions = allSubCats.map((subCat) => ({
    label: subCat.name,
    value: subCat._id,
  }));

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
            <div className="flex justify-center items-center h-40 text-red-600">
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

      <div className="flex items-center gap-2">
        <input
          id="comments"
          name="comments_enabled"
          type="checkbox"
          checked={values.comments_enabled}
          onChange={handleChange}
          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
        />
        <label htmlFor="comments" className="text-sm select-none">
          Enable comments
        </label>
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
          // Changed color to blue to visually differentiate from the red 'Add Post' button
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