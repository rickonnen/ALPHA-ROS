import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const bodyReq = await req.json();
    const apiKey = process.env.NOWPAYMENTS_API_KEY;

    const paymentBody = {
      price_amount: bodyReq.precio,
      price_currency: "usd",
      pay_currency: "trx",
      order_id: `PAGO-${bodyReq.planId}-${Date.now()}`,
      order_description: "pago a inmobiliaria propbol",
      case: "success", 
    };

    const response = await fetch(`${process.env.NOWPAYMENTS_API_URL}/v1/payment`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentBody),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Error al crear pago", details: data }, 
        { status: response.status }
      );
    }

    // Retornamos los datos (pay_address, payment_id, etc.)
    return NextResponse.json(data);

  } catch (error) {
    console.error("🔥 Error crítico:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}