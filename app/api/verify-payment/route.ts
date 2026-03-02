import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get("id");

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: "ID de transacción no proporcionado" },
        { status: 400 }
      );
    }

    console.log("🔍 Verificando transacción:", transactionId);

    // 🔥 PRODUCCIÓN
    const wompiResponse = await fetch(
      `https://api.wompi.co/v1/transactions/${transactionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const wompiData = await wompiResponse.json();

    console.log("📄 Respuesta de Wompi:", JSON.stringify(wompiData, null, 2));

    if (!wompiResponse.ok) {
      console.error("❌ Error Wompi:", wompiData);
      return NextResponse.json(
        {
          success: false,
          error: wompiData.error?.messages?.[0]?.message || 
                 wompiData.error?.reason || 
                 "Error consultando la transacción",
        },
        { status: 400 }
      );
    }

    const status = wompiData.data?.status || "ERROR";

    // 🔥 DEVOLVER EN EL FORMATO QUE ESPERA EL CALLBACK
    return NextResponse.json({
      success: true,
      status,
      message: wompiData.data?.status_message || "Estado consultado correctamente",
      data: wompiData.data, // ← CAMBIAR "raw" por "data"
    });

  } catch (error: any) {
    console.error("❌ Error verifying payment:", error);

    return NextResponse.json(
      { success: false, error: "Error interno al verificar el pago" },
      { status: 500 }
    );
  }
}