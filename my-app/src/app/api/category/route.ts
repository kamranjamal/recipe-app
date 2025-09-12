import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb.connection";
import CategoryModel, { ICategory } from "@/models/category.model";

export async function GET(_req: NextRequest) {
  try {
    await dbConnect();
    const categories: ICategory[] = await CategoryModel.find({}).lean();
    return NextResponse.json({ success: true, data: categories }, { status: 200 });
  } catch (error) {
    console.error("GET /api/category error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body?.name || typeof body.name !== "string") {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 }
      );
    }

    await dbConnect();
    const category = await CategoryModel.create({ name: body.name.trim() });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    console.error("POST /api/category error:", error);
    return NextResponse.json({ success: false, message: "Failed to create category" }, { status: 400 });
  }
}
