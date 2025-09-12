// File: src/app/api/recipe/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb.connection";
import Recipe from "@/models/recipe.model";

/**
 * Handles GET requests to fetch a single recipe by its ID.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await dbConnect();
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return NextResponse.json(
        { success: false, message: "Recipe not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: recipe });
  } catch (error: any) {
    console.error("GET recipe error:", error);
    // Handle cases like invalid ObjectId format
    if (error.kind === 'ObjectId') {
        return NextResponse.json({ success: false, message: "Invalid recipe ID format" }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, message: "An internal server error occurred" },
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

/**
 * Handles DELETE requests to remove a recipe by its ID.
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await dbConnect();
    const deletedRecipe = await Recipe.findById(id);

    if (!deletedRecipe) {
        return NextResponse.json({ success: false, message: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Recipe deleted successfully" });
  } catch (error: any) {
    console.error("DELETE recipe error:", error);
    return NextResponse.json(
      { success: false, message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}