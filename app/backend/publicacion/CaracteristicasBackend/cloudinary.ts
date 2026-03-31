import { v2 as cloudinary } from 'cloudinary'

// ─── Configuration ────────────────────────────────────────────────────────────

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// ─── Upload function ──────────────────────────────────────────────────────────

export async function subirImagen(file: File): Promise<string> {

  // 1. Convertir el archivo a base64
  const bytes  = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

  // 2. Subir a Cloudinary y retornar la URL
  const result = await cloudinary.uploader.upload(base64, {
    folder: 'publicaciones',
  })

  return result.secure_url
}