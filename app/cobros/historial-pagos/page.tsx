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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <div className="w-full md:w-auto">
              <div className="sm:hidden relative w-full">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full bg-[#DDE1E4] text-[#2E2E2E] text-sm font-medium rounded-md p-3 flex justify-between items-center">
                  {activeTab === "pendientes" ? "PAGOS PENDIENTES" : activeTab === "realizados" ? "PAGOS REALIZADOS" : "PAGOS RECHAZADOS"}
                  <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white text-[#2E2E2E] rounded-md shadow-lg overflow-hidden">
                    <button onClick={() => { setActiveTab("pendientes"); setIsDropdownOpen(false); }} className={`w-full text-left px-4 py-3 text-sm ${activeTab === "pendientes" ? "bg-gray-200 font-semibold" : ""}`}>PAGOS PENDIENTES</button>
                    <button onClick={() => { setActiveTab("realizados"); setIsDropdownOpen(false); }} className={`w-full text-left px-4 py-3 text-sm ${activeTab === "realizados" ? "bg-gray-200 font-semibold" : ""}`}>PAGOS REALIZADOS</button>
                    <button onClick={() => { setActiveTab("rechazados"); setIsDropdownOpen(false); }} className={`w-full text-left px-4 py-3 text-sm ${activeTab === "rechazados" ? "bg-gray-200 font-semibold" : ""}`}>PAGOS RECHAZADOS</button>
                  </div>
                )}
              </div>
              <TabsList className="hidden sm:flex gap-2 bg-transparent p-0">
                <TabsTrigger value="pendientes" className="px-4 py-2 text-sm font-medium rounded-md bg-[#DDE1E4] text-[#2E2E2E] hover:bg-[#DAD3C7] data-[state=active]:bg-[#1F3A4D] data-[state=active]:text-[#ffffff] data-[state=active]:shadow-sm transition">
                  PAGOS PENDIENTES
                </TabsTrigger>
                <TabsTrigger value="realizados" className="px-4 py-2 text-sm font-medium rounded-md bg-[#DDE1E4] text-[#2E2E2E] hover:bg-[#DAD3C7] data-[state=active]:bg-[#1F3A4D] data-[state=active]:text-[#ffffff] data-[state=active]:shadow-sm transition">
                  PAGOS REALIZADOS
                </TabsTrigger>
                <TabsTrigger value="rechazados" className="px-4 py-2 text-sm font-medium rounded-md bg-[#DDE1E4] text-[#2E2E2E] hover:bg-[#DAD3C7] data-[state=active]:bg-[#1F3A4D] data-[state=active]:text-[#ffffff] data-[state=active]:shadow-sm transition">
                  PAGOS RECHAZADOS
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="bg-[#F4EFE6] text-[#6B7280] text-sm px-3 py-1.5 inline-flex gap-3 items-center rounded-sm w-full md:w-auto justify-between md:justify-start">
              <span className="font-medium text-[#2E2E2E]">Filtrar:</span>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className="w-[130px] justify-between text-left font-normal bg-white border-[#E5E0D8] text-[#2E2E2E] h-8 px-2 hover:bg-gray-50 text-xs">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="h-3.5 w-3.5 text-gray-600" />
                        {fechaFiltro ? format(fechaFiltro, "dd/MM/yyyy", { locale: es }) : <span>Seleccionar</span>}
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white border border-[#E5E0D8]" align="end">
                    <Calendar mode="single" selected={fechaFiltro} onSelect={setFechaFiltro} locale={es} initialFocus captionLayout="dropdown" fromYear={2024} toYear={2030} />
                  </PopoverContent>
                </Popover>
                {fechaFiltro && (
                  <button onClick={() => setFechaFiltro(undefined)} className="text-xs font-bold text-[#C26E5A] hover:text-red-700 underline underline-offset-2 transition-colors">
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