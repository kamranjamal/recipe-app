import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb.connection";
import RecipeModel from "@/models/recipe.model";
import cloudinary from "@/lib/cloudinary.config";

// Stream upload helper
async function uploadToCloudinary(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "recipes" }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      })
      .end(buffer);
  });
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const categoryId = url.searchParams.get("categoryId") || undefined;

    const filter: any = {};
    if (categoryId) filter.categoryId = categoryId;

    const recipes = await RecipeModel.find(filter)
      .select("name imageUrl categoryId likes createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: recipes }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const form = await req.formData();

    const name = form.get("name")?.toString().trim();
    const categoryId = form.get("categoryId")?.toString();
    const file = form.get("file") as File | null;

    if (!name || !categoryId || !file) {
      return NextResponse.json(
        { success: false, message: "Name, categoryId and file required" },
        { status: 400 }
      );
    }

    const uploadRes: any = await uploadToCloudinary(file);

    const recipe = await RecipeModel.create({
      name,
      categoryId,
      imageUrl: uploadRes.secure_url,
      imagePublicId: uploadRes.public_id,
    });

    return NextResponse.json({ success: true, data: recipe }, { status: 201 });
  } catch (err) {
    console.error("POST /api/recipe error", err);
    return NextResponse.json(
      { success: false, message: "Failed to create recipe" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { action, recipeId, noteText } = body;

    if (!action || !recipeId) {
      return NextResponse.json(
        { success: false, message: "action and recipeId required" },
        { status: 400 }
      );
    }

    if (action === "like") {
      const updated = await RecipeModel.findByIdAndUpdate(
        recipeId,
        { $inc: { likes: 1 } },
        { new: true, lean: true }
      ).select("likes _id");
      return NextResponse.json({ success: true, data: updated }, { status: 200 });
    }

    if (action === "add-note") {
      if (!noteText) {
        return NextResponse.json(
          { success: false, message: "noteText required" },
          { status: 400 }
        );
      }

      const updated = await RecipeModel.findByIdAndUpdate(
        recipeId,
        { $push: { notes: { text: noteText, createdAt: new Date() } } },
        { new: true, lean: true }
      ).select("notes _id");
      return NextResponse.json({ success: true, data: updated }, { status: 200 });
    }

    return NextResponse.json(
      { success: false, message: "Unknown action" },
      { status: 400 }
    );
  } catch (err) {
    console.error("PATCH /api/recipe error", err);
    return NextResponse.json(
      { success: false, message: "Failed to update recipe" },
      { status: 500 }
    );
  }
}
