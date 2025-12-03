import { type NextRequest, NextResponse } from "next/server"

// In-memory store (replace with database later)
const producers: any[] = []

export async function GET() {
  return NextResponse.json(producers)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const producer = {
      id: Math.random().toString(36).substring(2, 11),
      ...body,
      createdAt: new Date(),
      endpoint: `/api/producers/${body.id || Math.random().toString(36).substring(2, 11)}`,
    }

    producers.push(producer)
    return NextResponse.json(producer, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create producer" }, { status: 400 })
  }
}
