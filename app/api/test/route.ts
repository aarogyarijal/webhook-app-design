import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url, payload } = await request.json()

    if (!url || !payload) {
      return NextResponse.json({ error: "Missing url or payload" }, { status: 400 })
    }

    // Call the webhook URL with the payload
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    // Try to parse as JSON, but handle non-JSON responses
    let data
    const contentType = response.headers.get("content-type")
    
    try {
      if (contentType?.includes("application/json")) {
        data = await response.json()
      } else {
        const text = await response.text()
        data = text || "No response body"
      }
    } catch {
      data = "Unable to parse response"
    }

    return NextResponse.json(
      {
        status: response.status,
        statusText: response.statusText,
        data,
        success: response.ok,
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to send test webhook",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
