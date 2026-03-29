export async function GET(req: Request) {

  
  return Response.json({
    telefonos: [
      { numero: "76543210", codigo_pais: "591" },
      { numero: "77777777", codigo_pais: "591" },
    ],
  });
}