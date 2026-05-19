"use client";
import { Suspense, useState } from "react"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ListaPagos from "../../../components/cobros/lista-pagos";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/auth/AuthContext";

function HistorialPagosContent() {
  const { user } = useAuth();
  const id_usuario = user?.id ?? "";
  const [activeTab, setActiveTab] = useState("pendientes");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [fechaFiltro, setFechaFiltro] = useState<Date | undefined>(undefined);
  
  return (
    <Card className="border-none bg-transparent shadow-none text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold border-b border-white/20 pb-2 tracking-tight w-full">
          Historial de pagos
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-4">
            <div className="w-full md:w-auto">
              <div className="sm:hidden relative w-full">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full bg-[#e7e1d7] text-[#2e2e2e] text-sm font-medium rounded-md p-3 flex justify-between items-center">
                  {activeTab === "pendientes" ? "PAGOS PENDIENTES" : activeTab === "realizados" ? "PAGOS REALIZADOS" : "PAGOS RECHAZADOS"}
                  <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-[#f4efe6] text-[#2e2e2e] rounded-md shadow-lg overflow-hidden border border-[#d6cfc3]">
                    <button onClick={() => { setActiveTab("pendientes"); setIsDropdownOpen(false); }} className={`w-full text-left px-4 py-3 text-sm hover:bg-[#e7e1d7]/50 ${activeTab === "pendientes" ? "bg-[#e7e1d7] font-semibold" : ""}`}>PAGOS PENDIENTES</button>
                    <button onClick={() => { setActiveTab("realizados"); setIsDropdownOpen(false); }} className={`w-full text-left px-4 py-3 text-sm hover:bg-[#e7e1d7]/50 ${activeTab === "realizados" ? "bg-[#e7e1d7] font-semibold" : ""}`}>PAGOS REALIZADOS</button>
                    <button onClick={() => { setActiveTab("rechazados"); setIsDropdownOpen(false); }} className={`w-full text-left px-4 py-3 text-sm hover:bg-[#e7e1d7]/50 ${activeTab === "rechazados" ? "bg-[#e7e1d7] font-semibold" : ""}`}>PAGOS RECHAZADOS</button>
                  </div>
                )}
              </div>
              <TabsList className="hidden sm:flex gap-2 bg-transparent p-0">
                <TabsTrigger value="pendientes" className="px-4 py-2 text-sm font-medium rounded-md transition data-[state=inactive]:bg-[#e7e1d7] data-[state=inactive]:text-[#2e2e2e] data-[state=inactive]:hover:bg-[#e7e1d7]/80 data-[state=active]:bg-white/15 data-[state=active]:text-white data-[state=active]:shadow-sm">
                  PAGOS PENDIENTES
                </TabsTrigger>
                <TabsTrigger value="realizados" className="px-4 py-2 text-sm font-medium rounded-md transition data-[state=inactive]:bg-[#e7e1d7] data-[state=inactive]:text-[#2e2e2e] data-[state=inactive]:hover:bg-[#e7e1d7]/80 data-[state=active]:bg-white/15 data-[state=active]:text-white data-[state=active]:shadow-sm">
                  PAGOS REALIZADOS
                </TabsTrigger>
                <TabsTrigger value="rechazados" className="px-4 py-2 text-sm font-medium rounded-md transition data-[state=inactive]:bg-[#e7e1d7] data-[state=inactive]:text-[#2e2e2e] data-[state=inactive]:hover:bg-[#e7e1d7]/80 data-[state=active]:bg-white/15 data-[state=active]:text-white data-[state=active]:shadow-sm">
                  PAGOS RECHAZADOS
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="bg-[#f4efe6] text-[#7a756d] text-sm px-3 py-1.5 inline-flex gap-3 items-center rounded-md w-full md:w-auto justify-between md:justify-start transition-all duration-300">
              <span className="font-medium text-[#2e2e2e]">Filtrar:</span>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className="w-[135px] justify-between text-left font-normal bg-[#f4efe6] border-[#d6cfc3] text-[#2e2e2e] h-8 px-3 hover:bg-[#e7e1d7] text-xs rounded-md transition-colors">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-3.5 w-3.5 text-[#7a756d]" />
                        {fechaFiltro ? format(fechaFiltro, "dd/MM/yyyy", { locale: es }) : <span>Seleccionar</span>}
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-[#7a756d]" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 bg-[#f4efe6] border border-[#d6cfc3] rounded-xl shadow-lg translate-x-2 light-calendar-popover"
                    align="end"
                    sideOffset={8}
                  >
                    <style>{`
                      .light-calendar-popover button:not([data-selected]),
                      .light-calendar-popover select,
                      .light-calendar-popover span {
                        color: #2e2e2e !important;
                      }
                      .light-calendar-popover button:hover:not([data-selected]) {
                        background-color: #e7e1d7 !important;
                      }
                      .light-calendar-popover .rdp-head_cell,
                      .light-calendar-popover .rdp-weekday {
                        color: #7a756d !important;
                      }
                      .light-calendar-popover .rdp-day_outside {
                        color: #7a756d !important;
                        opacity: 0.4 !important;
                      }
                      .light-calendar-popover select {
                        background-color: transparent !important;
                      }
                    `}</style>
                    <Calendar mode="single" selected={fechaFiltro} onSelect={setFechaFiltro} locale={es} initialFocus captionLayout="dropdown" fromYear={2024} toYear={2030} />
                  </PopoverContent>
                </Popover>
                {fechaFiltro && (
                  <button onClick={() => setFechaFiltro(undefined)} className="text-xs font-semibold text-secondary hover:text-secondary/80 hover:underline underline-offset-2 px-1 transition-all animate-in fade-in">
                    Limpiar
                  </button>
                )}
              </div>
            </div>
          </div>
          <TabsContent value="pendientes">
            <ListaPagos estado="pendiente" id_usuario={id_usuario} fechaFiltro={fechaFiltro} />
          </TabsContent>
          <TabsContent value="realizados">
            <ListaPagos estado="realizado" id_usuario={id_usuario} fechaFiltro={fechaFiltro} />
          </TabsContent>
          <TabsContent value="rechazados">
            <ListaPagos estado="rechazado" id_usuario={id_usuario} fechaFiltro={fechaFiltro} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default function HistorialPagosPage() {
  return (
    <Suspense fallback={<p className="text-sm text-white/50 p-6">Cargando historial...</p>}>
      <HistorialPagosContent />
    </Suspense>
  );
}