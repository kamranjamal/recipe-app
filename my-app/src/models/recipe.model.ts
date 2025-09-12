// models/recipe.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IRecipe extends Document {
  name: string;
  slug?: string;
  description?: string;
  ingredients?: string[]; // simple list
  steps?: string[]; // step-by-step instructions
  notes?: { text: string; createdAt: Date }[]; // user notes
  imageUrl: string;
  imagePublicId?: string; // cloudinary public id (for deletion if needed)
  categoryId: mongoose.Types.ObjectId;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

const RecipeSchema = new Schema<IRecipe>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name for this recipe."],
      maxlength: [120, "Name cannot be more than 120 characters"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: [2000, "Description too long"],
    },
    ingredients: {
      type: [String],
      default: [],
    },
    steps: {
      type: [String],
      default: [],
    },
    notes: {
      type: [
        {
          text: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    imageUrl: {
      type: String,
      required: [true, "Please provide an image URL for this recipe."],
    },
    imagePublicId: {
      type: String,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required."],
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

RecipeSchema.index({ name: "text", description: "text" });

export default mongoose.models.Recipe ||
  mongoose.model<IRecipe>("Recipe", RecipeSchema);
