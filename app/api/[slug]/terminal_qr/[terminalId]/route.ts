import { BACKEND_URL } from "@/app/config/constant";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; terminalId: string }> }
) {
  try {
    const { slug, terminalId } = await params;

    const response = await fetch(
      `${BACKEND_URL}/${slug}/terminal_qr/${terminalId}`
    );

    if (!response.ok) {
      console.error(
        "Backend response not ok:",
        response.status,
        response.statusText
      );
      return Response.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Fetch error:", error);
    return Response.json(
      //@ts-expect-error message might not exist on all error types
      { error: "Failed to fetch orders", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; terminalId: string }> }
) {
  try {
    const { slug, terminalId } = await params;
    const body = await request.json();
    const response = await fetch(`${BACKEND_URL}/terminal_qr/${terminalId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error("Backend response not ok:", response.status);
      return Response.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Create order error:", error);
    return Response.json(
      //@ts-expect-error message might not exist on all error types
      { error: "Failed to create order", details: error.message },
      { status: 500 }
    );
  }
}
