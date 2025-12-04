import { BACKEND_URL } from "@/app/config/constant";
import { cookies } from "next/headers";

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
    const cookieStore = await cookies();
    const body = await request.json();
    const orderIDFromCookie = cookieStore.get("order_id")?.value;
    if (orderIDFromCookie) {
      console.log("Order ID from cookie:", orderIDFromCookie);
      const response = await fetch(
        `${BACKEND_URL}/view_order/${orderIDFromCookie}/check/`,
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
      const data = await response.json();
      if (data.status === "RETRIEVED") {
        cookieStore.delete("order_id");
      }
      return Response.json(data);
    }

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
    cookieStore.set("order_id", data.order_id);
    return Response.json(data);
  } catch (error) {
    console.error("terminalID error:", error);
    return Response.json(
      //@ts-expect-error message might not exist on all error types
      { error: "Failed to create order", details: error.message },
      { status: 500 }
    );
  }
}
