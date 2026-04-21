import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const formData = await req.formData()

  const from   = formData.get('From')   // "whatsapp:+591..."
  const body   = formData.get('Body')   // texto del mensaje

  console.log(`Mensaje recibido de ${from}: ${body}`)

  // Twilio requiere respuesta en formato TwiML
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
    { headers: { 'Content-Type': 'text/xml' } }
  )
}