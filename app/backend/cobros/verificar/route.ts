import { NextResponse } from 'next/server';
import { prisma } from '@/app/backend/prisma'; 

// estas son funciones del backend

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const idDetalle = searchParams.get('id'); // El ID que ves en la columna 'id_detalle'

    if (!idDetalle) return NextResponse.json({ error: "Falta ID" }, { status: 400 });

    const transaccion = await prisma.detallePago.findUnique({
        where: { id_detalle: parseInt(idDetalle) }
    });

    return NextResponse.json(transaccion);
}

// POST: El que se activa al presionar el botón verde
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id_detalle, id_usuario } = body;

        // Buscamos la transacción en la tabla real
        const registro = await prisma.detallePago.findUnique({
            where: { id_detalle: parseInt(id_detalle),
                     id_usuario: id_usuario
             }
        });

        if (!registro) {
            return NextResponse.json({ titulo: "Error", mensaje: "No existe el registro", estado: 0 });
        }

        // Lógica de respuesta según la columna 'estado'
        // 1 = Pendiente, 2 = Verificado, 3 = Rechazado
        if (registro.estado === 2) {
            return NextResponse.json({
                titulo: "¡PAGO EXITOSO!",
                mensaje: "El pago fue procesado con exito, puede consultar su tranasccion en historial de pagos",
            });
        } else if (registro.estado === 3) {
            return NextResponse.json({
                titulo: "PAGO RECHAZADO",
                mensaje: "Hubo un problema con la transferencia. Por favor, intenta de nuevo.",
            });
        } else {
            return NextResponse.json({
                titulo: "PAGO PENDIENTE",
                mensaje: "El pago se esta procesando, esto puede durar algunas horas",
            });
        }
    } catch (error) {
        return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
    }
}