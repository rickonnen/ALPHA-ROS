import { NextResponse } from "next/server";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { numero, id_usuario } = body;

    const phone = parsePhoneNumberFromString(numero);

    if (!phone || !phone.isValid()) {
      return NextResponse.json(
        { error: "Número inválido" },
        { status: 400 }
      );
    }

    const codigo_pais = phone.countryCallingCode;
    const numero_nacional = phone.nationalNumber;

    console.log({
      numero: numero_nacional,
      codigo_pais,
      id_usuario,
    });

    return NextResponse.json({
      ok: true,
      data: {
        numero: numero_nacional,
        codigo_pais,
      },
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}