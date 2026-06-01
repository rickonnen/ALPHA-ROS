// ─────────────────────────────────────────────
//  imagenesDB.ts
//  Helper para guardar/leer/limpiar imágenes
//  en IndexedDB del navegador.
// ─────────────────────────────────────────────

const DB_NAME    = 'propbol_formulario'
const DB_VERSION = 1
const STORE_NAME = 'imagenes'

// ── La key que identifica a qué sesión pertenecen las imágenes guardadas ──
// Ya NO se usa un booleano 'true'/'false'.
// Se guarda la sessionKey única del formulario actual.
// Si al montar la key no coincide → las imágenes son de otra sesión → limpiar.
const IDB_SESSION_KEY = 'imagenesForm_sessionKey'

// ── Abre (o crea) la base de datos ───────────
function abrirDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

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
export async function guardarImagenes(archivos: File[]): Promise<void> {
  try {
    const db          = await abrirDB()
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store       = transaction.objectStore(STORE_NAME)

    store.clear()
    archivos.forEach((archivo, index) => {
      store.put({ id: index, archivo })
    })

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror    = () => reject(new Error('Error al guardar imágenes'))
    })
  } catch {
    console.warn('IndexedDB no disponible, las imágenes no persistirán al recargar')
  }
}

// ── Lee los archivos guardados ────────────────
export async function leerImagenes(): Promise<File[]> {
  try {
    const db          = await abrirDB()
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store       = transaction.objectStore(STORE_NAME)
    const request     = store.getAll()

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const registros = request.result as { id: number; archivo: File }[]
        const archivos  = registros
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

// Limpia IndexedDB
export async function limpiarImagenes(): Promise<void> {
  try {
    const db          = await abrirDB()
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store       = transaction.objectStore(STORE_NAME)
    store.clear()

    return new Promise((resolve) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror    = () => resolve()
    })
  } catch { }
}

// ── Manejo de sessionKey ──────────────────────
// En lugar de un booleano, guardamos la key exacta de la sesión actual.
// Así podemos detectar si las imágenes en IndexedDB son de ESTA sesión
// o de una anterior (publicación distinta, edición distinta, etc.).

export function guardarSessionKey(key: string): void {
  try { sessionStorage.setItem(IDB_SESSION_KEY, key) } catch {}
}

export function leerSessionKey(): string | null {
  try { return sessionStorage.getItem(IDB_SESSION_KEY) } catch { return null }
}

export function limpiarSessionKey(): void {
  try { sessionStorage.removeItem(IDB_SESSION_KEY) } catch {}
}