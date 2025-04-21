import { NextResponse } from "next/server"
import { getCheckoutSession } from "@/lib/stripe"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    const session = await getCheckoutSession(sessionId)
    return NextResponse.json(session)
  } catch (error: any) {
    console.error("Error retrieving checkout session:", error)
    return NextResponse.json({ error: error.message || "Failed to retrieve checkout session" }, { status: 500 })
  }
}
