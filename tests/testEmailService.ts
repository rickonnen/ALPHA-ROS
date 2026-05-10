import { enviarNotificacionDeGrupo } from "../lib/email/emailService";
import { prisma } from "../lib/prisma";

async function testEnviarNotificacionDeGrupo() {
  const email = "test@example.com";
  const nombre = "Usuario de Prueba";
  const titulo = "Título de Prueba";
  const mensaje = "Este es un mensaje de prueba para verificar la funcionalidad.";
  const grupo = "Grupo de Prueba";
  const id_notificacion = "notificacion_prueba";

  // Crear una notificación de prueba en la base de datos
  await prisma.notificacion.create({
    data: {
      id_notificacion,
      email_enviado: false,
      fecha_envio_email: null,
      estado_envio: "pendiente",
    },
  });

  // Llamar a la función para enviar la notificación
  try {
    const resultado = await enviarNotificacionDeGrupo(
      email,
      nombre,
      titulo,
      mensaje,
      grupo,
      id_notificacion
    );

    console.log("Resultado del envío:", resultado);
  } catch (error) {
    console.error("Error al enviar la notificación:", error);
  }
}

testEnviarNotificacionDeGrupo();