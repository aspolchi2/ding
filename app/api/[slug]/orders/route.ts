const BACKEND_URL =
  "https://nonmythologically-undefensible-tracie.ngrok-free.dev/";

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/orders/`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });

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
  } catch (error: undefined | any) {
    console.error("Fetch error:", error);
    return Response.json(
      { error: "Failed to fetch orders", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_URL}/orders/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
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
      { error: "Failed to create order", details: error.message },
      { status: 500 }
    );
  }
}
