import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, customer, shipping, items, userId } = body;

    // ═══════════════════════════════════════════════
    // 🐛 DEBUG 1: Variables de entorno
    // ═══════════════════════════════════════════════
    console.log("═══════════ DEBUG CREATE-PAYMENT ═══════════");
    console.log("🔑 WOMPI_PRIVATE_KEY existe:", !!process.env.WOMPI_PRIVATE_KEY);
    console.log("🔑 WOMPI_PRIVATE_KEY primeros 20 chars:", process.env.WOMPI_PRIVATE_KEY?.slice(0, 20));
    console.log("🌐 NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL);
    console.log("🔗 redirect_url completo:", `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`);

    // ═══════════════════════════════════════════════
    // 🐛 DEBUG 2: Datos recibidos del frontend
    // ═══════════════════════════════════════════════
    console.log("💰 amount recibido:", amount);
    console.log("💰 amount_in_cents que se enviará:", Math.round(amount * 100));
    console.log("👤 customer:", JSON.stringify(customer));
    console.log("📦 items.length:", items?.length);
    console.log("🚚 shipping:", JSON.stringify(shipping));
    console.log("🆔 userId:", userId);
    console.log("═══════════════════════════════════════════");

    if (!amount || amount < 1000) {
      console.log("❌ FALLO: monto inválido:", amount);
      return NextResponse.json(
        { success: false, error: "El monto mínimo es $1.000 COP" },
        { status: 400 }
      );
    }

    if (!customer?.email) {
      console.log("❌ FALLO: email faltante");
      return NextResponse.json(
        { success: false, error: "Email del cliente es obligatorio" },
        { status: 400 }
      );
    }

    const reference = `ORDER-${Date.now()}-${userId?.slice(0, 6) || "GUEST"}`;
    console.log("📋 Referencia generada:", reference);

    // ═══════════════════════════════════════════════
    // 🐛 DEBUG 3: Body exacto que se envía a Wompi
    // ═══════════════════════════════════════════════
    const wompiBody = {
      name: `Pedido #${reference}`,
      description: `Compra en FashionJAS - ${items.length} producto(s)`,
      single_use: true,
      collect_shipping: false,
      currency: "COP",
      amount_in_cents: Math.round(amount * 100),
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback?ref=${reference}`,
      metadata: {
        reference,
        customerName: customer.name,
        customerEmail: customer.email,
        items: JSON.stringify(items),
        shipping: JSON.stringify(shipping),
      },
    };

    console.log("📤 Body enviado a Wompi:", JSON.stringify(wompiBody, null, 2));

    const wompiResponse = await fetch("https://api.wompi.co/v1/payment_links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
      },
      body: JSON.stringify(wompiBody),
    });

    const wompiResult = await wompiResponse.json();

    // ═══════════════════════════════════════════════
    // 🐛 DEBUG 4: Respuesta completa de Wompi
    // ═══════════════════════════════════════════════
    console.log("📥 Wompi HTTP status:", wompiResponse.status);
    console.log("📥 Wompi respuesta completa:", JSON.stringify(wompiResult, null, 2));

    if (!wompiResponse.ok) {
      console.log("❌ WOMPI RECHAZÓ LA PETICIÓN");
      console.log("❌ Status code:", wompiResponse.status);
      console.log("❌ Error detallado:", JSON.stringify(wompiResult?.error, null, 2));
      console.log("❌ Mensajes:", JSON.stringify(wompiResult?.error?.messages, null, 2));

      return NextResponse.json(
        {
          success: false,
          error:
            wompiResult.error?.messages?.[0]?.message ||
            wompiResult.error?.reason ||
            "Error creando el pago en Wompi",
          // 🐛 Exponer el error completo de Wompi temporalmente
          debug_wompi_error: wompiResult.error,
        },
        { status: 400 }
      );
    }

    console.log("✅ Payment link creado:", wompiResult.data?.id);

    return NextResponse.json({
      success: true,
      paymentUrl: `https://checkout.wompi.co/l/${wompiResult.data.id}`,
      reference,
      paymentId: wompiResult.data.id,
    });

  } catch (error: any) {
    console.error("💥 ERROR INTERNO:", error);
    console.error("💥 Stack:", error?.stack);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        debug_message: error?.message,
      },
      { status: 500 }
    );
  }
}