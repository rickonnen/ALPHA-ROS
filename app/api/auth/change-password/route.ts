import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordChangeEmail} from '@/lib/email/emailService';

export async function POST(request: NextRequest) {
  try {
    const { email, userName } = await request.json();

    // Validar datos
    if (!email || !userName) {
      return NextResponse.json(
        { error: 'Email y userName son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Enviar email de cambio de contraseña
    const emailResult = await sendPasswordChangeEmail(email, userName);

    // Verificar que se envió en menos de 10 segundos
    if (!emailResult.success) {
      return NextResponse.json(
        { 
          error: 'Error al enviar el correo',
          details: emailResult.error 
        },
        { status: 500 }
      );
    }

    if (emailResult.timeTakenMs > 10000) {
      console.warn(
        `⚠️ Email enviado en ${emailResult.timeTakenMs}ms (exceede 10 segundos)`
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email de cambio de contraseña enviado correctamente',
      timeTakenMs: emailResult.timeTakenMs,
      withinTimeLimit: emailResult.timeTakenMs <= 10000,
    });
  } catch (error) {
    console.error('Error en change-password:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
