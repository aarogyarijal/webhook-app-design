import { type NextRequest, NextResponse } from "next/server"

// In-memory store
const webhookLogs: any[] = []

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const payload = await request.json()

    // Simulate webhook processing
    // In production: validate, transform, and trigger consumers

    return NextResponse.json(
      {
        success: true,
        message: "Webhook received",
        producerId: id,
        timestamp: new Date(),
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 400 })
  }
}
