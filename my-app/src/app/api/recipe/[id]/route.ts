import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb.connection";
import Recipe from "@/models/recipe.model";

// GET recipe by id
export async function GET(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const recipe = await Recipe.findById(params.id);
  if (!recipe) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: recipe });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const body = await req.json();
  const recipe = await Recipe.findById(params.id);

  if (!recipe) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  switch (body.action) {
    case "like":
      recipe.likes = (recipe.likes || 0) + 1;
      break;
    case "add-ingredient":
      if (body.ingredient) {
        recipe.ingredients = [...(recipe.ingredients || []), body.ingredient];
      }
      break;
    case "add-step":
      if (body.step) {
        recipe.steps = [...(recipe.steps || []), body.step];
      }
      break;
    case "add-note":
      if (body.note) {
        recipe.notes = [
          ...(recipe.notes || []),
          { text: body.note, createdAt: new Date() },
        ];
      }
      break;
    default:
      return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  }

  await recipe.save();
  return NextResponse.json({ success: true, data: recipe });
}

// DELETE recipe
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    await Recipe.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE recipe error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
