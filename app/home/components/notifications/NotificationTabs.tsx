"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Trash2 } from "lucide-react";

type Props = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount: number;
  trashCount: number;
  onMarkAll: () => void;
  onOpenSettings: () => void;
  onTrashClick?: () => void;
};

export function NotificationTabs({
  activeTab,
  onTabChange,
  unreadCount,
  trashCount,
  onMarkAll,
  onOpenSettings,
  onTrashClick,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-2">
      {/* Izquierda: tabs */}
      <Tabs value={activeTab} onValueChange={onTabChange} className="flex-1 min-w-0">
        <TabsList className="bg-gray-200 p-1.5 rounded-xl inline-flex h-auto dark:bg-[#263540]">
          <TabsTrigger
            value="all"
            className="text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-lg data-[state=active]:bg-white dark:text-slate-200 dark:data-[state=active]:bg-[#1f2c33]"
          >
            Todas
          </TabsTrigger>
          <TabsTrigger
            value="unread"
            className="text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-lg data-[state=active]:bg-white dark:text-slate-200 dark:data-[state=active]:bg-[#1f2c33]"
          >
            No leídas {unreadCount > 0 ? `(${unreadCount})` : ""}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Derecha: marcar todas + papelera + tuerca */}
      <div className="flex items-center gap-0.5 shrink-0 min-w-[80px] justify-end">
        {activeTab === "unread" && unreadCount > 0 && (
          <button
            onClick={onMarkAll}
            className="text-[10px] md:text-xs text-gray-500 hover:text-black whitespace-nowrap dark:text-slate-300/70 dark:hover:text-white"
          >
            Marcar todas
          </button>
        )}

        <button
          onClick={onTrashClick}
          className={`flex items-center gap-0.5 px-1.5 py-1.5 rounded-md transition ${
            activeTab === "trash" ? "bg-gray-200 dark:bg-[#263540]" : "hover:bg-gray-200 dark:hover:bg-[#263540]"
          }`}
          type="button"
          title={`Papelera ${trashCount > 0 ? `(${trashCount})` : ""}`}
        >
          <Trash2 size={15} className="dark:text-slate-200" />
          {trashCount > 0 && (
            <span className="text-[9px] md:text-xs text-gray-600 dark:text-slate-300">{trashCount}</span>
          )}
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-md hover:bg-gray-200 transition dark:text-slate-200 dark:hover:bg-[#263540]"
          type="button"
          title="Configuración"
        >
          <Settings size={15} />
        </button>
      </div>
    </div>
  );
}