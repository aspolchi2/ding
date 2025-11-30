import { cookies } from "next/headers";
import { BACKEND_URL } from "@/app/config/constant";

export async function GET() {
  const cookieStore = await cookies();
  const bearer_token = cookieStore.get("bearer_token")?.value;
  try {
    const response = await fetch(`${BACKEND_URL}/orders/`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${bearer_token}`,
      },
    });

    if (!response.ok) {
      console.error("Backend response not ok:", response.statusText);
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
  { params }: { params: Promise<{ slug: string }> }
) {
  const cookieStore = await cookies();
  const bearer_token = cookieStore.get("bearer_token")?.value;
  const { slug } = await params;
  console.log("Slug:", slug);

  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_URL}/orders/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        authorization: `Bearer ${bearer_token}`,
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
