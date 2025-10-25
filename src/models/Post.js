// src/models/Post.js
import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
    },
    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Author',
      required: true,
    },
    subcategory_ids: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
      default: [],
    }],
    tags: [{
      type: String,
      trim: true,
    }],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    permissions: {
      is_slide_article: {
        type: Boolean,
        default: false,
      },
      is_premium: {
        type: Boolean,
        default: false,
      },
      is_featured: {
        type: Boolean,
        default: false,
      },
    },
    featured_image: {
      type: String,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
    comments_enabled: {
      type: Boolean,
      default: true,
    },
    published_at: {
      type: Date,
      default: null,
    },
  },
  {
    collection: 'posts',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

PostSchema.statics.findPublished = function () {
  return this.find({ status: 'published' });
};

export default mongoose.models.Post || mongoose.model('Post', PostSchema);