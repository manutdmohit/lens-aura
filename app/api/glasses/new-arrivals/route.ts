import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/api/db";
import Product from "@/models/Product";

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

    
        const products = await Product.find({
            status: "active",
            productType: "glasses",
        })
        .sort({ createdAt: -1 })
        .select("name slug productType price imageUrl gender")
        .limit(5);

        return NextResponse.json({ products });
    } catch (error) {
        console.error("Error fetching new arrivals:", error);
        return NextResponse.json({ error: "Failed to fetch new arrivals" }, { status: 500 });
    } 
}   
