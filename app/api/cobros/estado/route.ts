import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 

//el GET pide informacion SIN modificar
//esa funcion busca todos los detallepagos de un usuario, si tiene uno en pendiente devuelve 1, si no encutra ninguno null
export async function GET(request: Request) {
  try {
    //el searchparams obtiene 
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Falta el ID de usuario" }, { status: 400 });
    }

    //llamamos aca a prisma y que busque el PRIMER DATO que tenga el id correspondiente y que el estado sea 1 (pendiente)
    //pago pendiente tendra tanto el valor de id, como el valor de estado osea un 2x1
    const pagoPendiente = await prisma.detallePago.findFirst({
      where: {
        id_usuario: userId,
        estado: 1, 
      },
    });
    //aqui se devolvera la variable estado, si encontro algo la variable estado tendra el valor del pagopendiente(id y estado)
    //si la variable pagopendiente no encontro nada, devuelve un null
    //la vriable tienePendientes es un objeto existente (!!) true, si no es existente(osea un null) false
    return NextResponse.json({ 
      estado: pagoPendiente ? pagoPendiente.estado : null,
      tienePendientes: !!pagoPendiente 
    });

  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}