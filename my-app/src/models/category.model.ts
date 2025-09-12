import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  _id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema<ICategory> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name for this category."],
      maxlength: [60, "Name cannot be more than 60 characters"],
      trim: true,
    },
  },
  { timestamps: true }
);

const CategoryModel: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);

export default CategoryModel;
