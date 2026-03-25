import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function InformacionComercialPage() {
  const fieldClass =
    "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
  const selectClass =
    "h-10 w-full rounded-lg border border-input bg-background px-3 py-2 pr-9 text-sm text-foreground shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
  const textareaClass =
    "flex min-h-32 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
  const labelClass = "text-sm font-medium text-foreground"

  return (
    <main className="min-h-screen bg-muted/30">
      <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 md:py-14">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
          Crear publicacion
        </h1>

        <Card className="mx-auto mt-8 w-full max-w-3xl bg-card shadow-sm md:mt-10">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-base font-semibold tracking-wide uppercase text-primary">
              INFORMACION COMERCIAL
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <form className="space-y-5" action="#">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_170px]">
                <div className="space-y-2">
                  <label className={labelClass} htmlFor="titulo-aviso">
                    Titulo del aviso
                  </label>
                  <input
                    id="titulo-aviso"
                    name="titulo-aviso"
                    placeholder="Escribe un titulo"
                    className={fieldClass}
                  />
                </div>

                <div className="space-y-2">
                  <label className={labelClass} htmlFor="precio-publicacion">
                    Precio
                  </label>
                  <input
                    id="precio-publicacion"
                    name="precio-publicacion"
                    placeholder="0.00 Bs."
                    inputMode="decimal"
                    className={fieldClass}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass} htmlFor="tipo-propiedad">
                  Tipo de propiedad
                </label>
                <select
                  id="tipo-propiedad"
                  name="tipo-propiedad"
                  defaultValue=""
                  className={selectClass}
                >
                  <option value="" disabled>
                    Selecciona una opcion
                  </option>
                  <option value="casa">Casa</option>
                  <option value="departamento">Departamento</option>
                  <option value="terreno">Terreno</option>
                  <option value="oficina">Oficina</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className={labelClass} htmlFor="tipo-operacion">
                  Tipo de operacion
                </label>
                <select
                  id="tipo-operacion"
                  name="tipo-operacion"
                  defaultValue=""
                  className={selectClass}
                >
                  <option value="" disabled>
                    Selecciona una opcion
                  </option>
                  <option value="venta">Venta</option>
                  <option value="alquiler">Alquiler</option>
                  <option value="anticretico">Anticretico</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className={labelClass} htmlFor="descripcion-publicacion">
                  Descripcion
                </label>
                <textarea
                  id="descripcion-publicacion"
                  name="descripcion-publicacion"
                  placeholder="Texto para mensaje breve"
                  className={textareaClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2 sm:justify-end sm:pl-20 md:flex md:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 border-secondary text-secondary hover:bg-secondary/10"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="h-10 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  Siguiente
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}