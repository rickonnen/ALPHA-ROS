export async function GET() {
  return Response.json([
    { id: 1, titulo: "Casa en venta", precio: "$120,000" },
    { id: 2, titulo: "Depto alquiler", precio: "$500" }
  ]);
}