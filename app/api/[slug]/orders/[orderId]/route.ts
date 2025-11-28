import { BACKEND_URL } from "@/app/config/constant";
import { cookies } from "next/headers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string; orderId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const { orderId } = await params;
    const bearer_token = cookieStore.get("bearer_token")?.value;
    const body = await request.json();
    const response = await fetch(`${BACKEND_URL}/orders/${orderId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${bearer_token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    console.log("PATCH response data:", data);
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: "Failed to update order" }, { status: 500 });
  }
}
