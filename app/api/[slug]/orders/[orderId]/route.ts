const BACKEND_URL =
  "https://nonmythologically-undefensible-tracie.ngrok-free.dev/";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const response = await fetch(`${BACKEND_URL}/orders/${orderId}/`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: "Failed to update order" }, { status: 500 });
  }
}
