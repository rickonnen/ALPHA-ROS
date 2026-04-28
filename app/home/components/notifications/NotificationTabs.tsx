"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings } from "lucide-react";

type Props = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount: number;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onOpenSettings: () => void;
};

export function NotificationTabs({
  activeTab,
  onTabChange,
  unreadCount,
  activeFilter,
  onFilterChange,
  onOpenSettings,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="bg-gray-200 p-1 rounded-xl inline-flex h-auto">
            <TabsTrigger
              value="all"
              className="text-sm px-3 py-1 rounded-lg data-[state=active]:bg-white"
            >
              Todas
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className="text-sm px-3 py-1 rounded-lg data-[state=active]:bg-white"
            >
              No leídas {unreadCount > 0 ? `(${unreadCount})` : ""}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          {/* Solo queda el engranaje, "Marcar todo" fue eliminado */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              onOpenSettings();
            }} 
            className="p-2 rounded-md hover:bg-gray-200 transition"
            type="button"
            title="Configuración"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => onFilterChange(activeFilter === "gmail" ? "all" : "gmail")}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition ${
              activeFilter === "gmail"
                ? "bg-gray-200 font-medium"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            type="button"
          >
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Gmail
          </button>

          <button
            onClick={() => onFilterChange(activeFilter === "whatsapp" ? "all" : "whatsapp")}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition ${
              activeFilter === "whatsapp"
                ? "bg-gray-200 font-medium"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            type="button"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}