export async function DELETE(req: Request) {
  const body = await req.json();

  const { numero, codigo_pais, id_usuario } = body;

  return Response.json({ ok: true });
}