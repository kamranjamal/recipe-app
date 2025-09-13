// File: src/app/api/recipe/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb.connection";
import Recipe from "@/models/recipe.model";
import { getDataFromToken } from "@/helpers/jwt.helper";

// Get a single recipe, ensuring it belongs to the user
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = await getDataFromToken(request);
    await dbConnect();

    const recipe = await Recipe.findOne({ _id: id, userId });

    if (!recipe) {
      return NextResponse.json(
        { success: false, message: "Recipe not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: recipe });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Delete a recipe, ensuring it belongs to the user
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = await getDataFromToken(request);
    await dbConnect();

    const deletedRecipe = await Recipe.findOneAndDelete({ _id: id, userId });

    if (!deletedRecipe) {
      return NextResponse.json(
        { success: false, message: "Recipe not found or access denied" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: "Recipe deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handles PATCH requests to update a recipe (e.g., likes, ingredients, etc.).
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await dbConnect();

    const body = await request.json();
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return NextResponse.json(
        { success: false, message: "Recipe not found" },
        { status: 404 }
      );
    }

    // Process the update based on the action
    switch (body.action) {
      case "like":
        recipe.likes = (recipe.likes || 0) + 1;
        break;
      case "add-ingredient":
        if (body.ingredient) {
          recipe.ingredients.push(body.ingredient);
        }
        break;
      case "add-step":
        if (body.step) {
          recipe.steps.push(body.step);
        }
        break;
      case "add-note":
        if (body.note) {
          recipe.notes.push({ text: body.note, createdAt: new Date() });
        }
        break;
      default:
        return NextResponse.json(
          { success: false, message: "Invalid action provided" },
          { status: 400 }
        );
    }

    const updatedRecipe = await recipe.save();
    return NextResponse.json({ success: true, data: updatedRecipe });
  } catch (error: any) {
    console.error("PATCH recipe error:", error);
    return NextResponse.json(
      { success: false, message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
