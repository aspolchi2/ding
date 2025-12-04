import { BACKEND_URL } from "@/app/config/constant";
import { cookies } from "next/headers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const cookieStore = await cookies();
  try {
    const body = await request.json();
    const response = await fetch(
      `${BACKEND_URL}/view_order/${body.order_id}/check/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurant_uuid: body.restaurant_uuid,
          terminal_id: body.terminal_id,
        }),
      }
    );

    if (!response.ok) {
      console.error("Backend response not ok:", response.status);
      return Response.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(data, "data")
    if (data.status === "RETRIEVED") {
      cookieStore.delete("order_id");
    }
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
