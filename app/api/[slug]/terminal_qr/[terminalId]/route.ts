import { BACKEND_URL } from "@/app/config/constant";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; terminalId: string }> }
) {
  try {
    const { slug, terminalId } = await params;
    console.log("Fetching orders for slug:", slug);
    console.log("Fetching orders for terminalId:", terminalId);

    const response = await fetch(
      `${BACKEND_URL}/qr/${slug}/terminal/${terminalId}`
    );

    console.log(response);

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
    const body = await request.json();
    console.log(body);
    const response = await fetch(`${BACKEND_URL}/view_order/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
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
