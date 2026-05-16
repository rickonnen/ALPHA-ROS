"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings } from "lucide-react";

type Props = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount: number;
////////////h2////////
  trashCount: number;

  onMarkAll: () => void;
  onOpenSettings: () => void;
};

export function NotificationTabs({
  activeTab,
  onTabChange,
  unreadCount,
  trashCount,
  onMarkAll,
  onOpenSettings,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="bg-[var(--notification-card)] p-1 rounded-xl inline-flex h-auto">
            <TabsTrigger
              value="all"
              className="text-sm px-3 py-1 rounded-lg border border-transparent text-[var(--notification-muted)] data-active:bg-[var(--notification-tab-active-bg)] data-active:text-[var(--notification-tab-active-text)] data-active:border-[var(--notification-tab-active-border)]"
            >
              Todas
            </TabsTrigger>

            <TabsTrigger
              value="unread"
              className="text-sm px-3 py-1 rounded-lg border border-transparent text-[var(--notification-muted)] data-active:bg-[var(--notification-tab-active-bg)] data-active:text-[var(--notification-tab-active-text)] data-active:border-[var(--notification-tab-active-border)]"
            >
              No leídas {unreadCount > 0 ? `(${unreadCount})` : ""}
            </TabsTrigger>
             <TabsTrigger
  value="trash"
  className="text-sm px-3 py-1 rounded-lg border border-transparent text-[var(--notification-muted)] data-active:bg-[var(--notification-tab-active-bg)] data-active:text-[var(--notification-tab-active-text)] data-active:border-[var(--notification-tab-active-border)]"
>
  Papelera {trashCount > 0 ? `(${trashCount})` : ""}
</TabsTrigger>



          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          {/* Mostrar "Marcar todo" solo cuando la pestaña activa sea "unread" */}
          {activeTab === "unread" && (
            <button
              onClick={onMarkAll}
              className="text-xs text-[var(--notification-muted)] hover:text-[var(--notification-title-unread)]"
            >
              Marcar todas
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-md text-[var(--notification-muted)] hover:bg-[var(--notification-card)] hover:text-[var(--notification-text)] transition"
            type="button"
            title="Configuración"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
