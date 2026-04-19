'use server'

import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key:    process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
})

export async function subirImagen(file: File): Promise<string> {
  console.log('[Cloudinary] config:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
    api_key:    process.env.CLOUDINARY_API_KEY?.trim() ? '✓ existe' : '✗ UNDEFINED',
    api_secret: process.env.CLOUDINARY_API_SECRET?.trim() ? '✓ existe' : '✗ UNDEFINED',
    file_name:  file.name,
    file_size:  file.size,
    file_type:  file.type,
  })

  if (!file.size) {
    throw new Error(`Archivo vacío: ${file.name}`)
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer      = Buffer.from(arrayBuffer)

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder:         'publicaciones',
          resource_type:  'image',
          allowed_formats: ['jpg', 'jpeg', 'png'],
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary] Error al subir:', error)
            return reject(new Error(error.message ?? 'Error desconocido de Cloudinary'))
          }
          if (!result) {
            return reject(new Error('Cloudinary no devolvió resultado'))
          }
          console.log('[Cloudinary] Subida exitosa:', result.secure_url)
          resolve(result.secure_url)
        },
      )
      .end(buffer)
  })
}