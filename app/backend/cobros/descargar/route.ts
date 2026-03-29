// app/backend/controllers/cobros/descargar/route.ts
import { NextResponse } from 'next/server';
import { obtenerQrRealBD } from '@/app/backend/cobros/cobros-plataforma/cobros.service'; 
import { prisma } from '@/app/backend/prisma'; 

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');

    const qrData = await prisma.qrUrl.findUnique({
        where: { id_metodo: parseInt(planId || '1') }
    });

    // IMPORTANTE: Verifica que envíes 'url' como nombre de propiedad
    return NextResponse.json({ url: qrData?.qr_URL });
}