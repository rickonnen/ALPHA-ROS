// ─────────────────────────────────────────────
//  imagenesDB.ts
//  Helper para guardar/leer/limpiar imágenes
//  en IndexedDB del navegador.
//  No necesita instalación, viene en todos los browsers.
// ─────────────────────────────────────────────

const DB_NAME    = 'propbol_formulario'
const DB_VERSION = 1
const STORE_NAME = 'imagenes'
const SESSION_KEY = 'formularioActivo'

// ── Abre (o crea) la base de datos ───────────
function abrirDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    // Se ejecuta solo la primera vez o al cambiar DB_VERSION
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result)
    request.onerror   = ()      => reject(new Error('No se pudo abrir IndexedDB'))
  })
}

// ── Guarda la lista de archivos ───────────────
// Llama esto cada vez que el usuario agrega o elimina una imagen
export async function guardarImagenes(archivos: File[]): Promise<void> {
  try {
    const db          = await abrirDB()
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store       = transaction.objectStore(STORE_NAME)

    // Limpia lo anterior y guarda los archivos actuales
    store.clear()
    archivos.forEach((archivo, index) => {
      store.put({ id: index, archivo })
    })

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror    = () => reject(new Error('Error al guardar imágenes'))
    })
  } catch {
    // Si IndexedDB falla silenciosamente, el formulario sigue funcionando
    console.warn('IndexedDB no disponible, las imágenes no persistirán al recargar')
  }
}

// ── Lee los archivos guardados ────────────────
// Llama esto al montar el componente
export async function leerImagenes(): Promise<File[]> {
  try {
    const db          = await abrirDB()
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store       = transaction.objectStore(STORE_NAME)
    const request     = store.getAll()

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const registros = request.result as { id: number; archivo: File }[]
        // Ordena por id para mantener el orden original
        const archivos = registros
          .sort((a, b) => a.id - b.id)
          .map(r => r.archivo)
        resolve(archivos)
      }
      request.onerror = () => reject(new Error('Error al leer imágenes'))
    })
  } catch {
    return []
  }
}

// ── Limpia IndexedDB ──────────────────────────
// Llama esto al publicar, cancelar o salir del formulario
export async function limpiarImagenes(): Promise<void> {
  try {
    const db          = await abrirDB()
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store       = transaction.objectStore(STORE_NAME)
    store.clear()

    return new Promise((resolve) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror    = () => resolve() // falla silenciosamente
    })
  } catch {
    // silencioso
  }
}

// ── Manejo de sesión activa ───────────────────
// sessionStorage se borra solo cuando el usuario cierra la pestaña

export function marcarSesionActiva(): void {
  try { sessionStorage.setItem(SESSION_KEY, 'true') } catch {}
}

export function haySecionActiva(): boolean {
  try { return sessionStorage.getItem(SESSION_KEY) === 'true' } catch { return false }
}

export function limpiarSesion(): void {
  try { sessionStorage.removeItem(SESSION_KEY) } catch {}
}