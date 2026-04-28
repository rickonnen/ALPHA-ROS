"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings } from "lucide-react";
import { SettingsPanel } from "./SettingsPanel";

type Props = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount: number;
  onMarkAll: () => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onOpenSettings: () => void;
  showSettings: boolean;
  onCloseSettings: () => void;
  gmailEnabled: boolean;
  whatsappEnabled: boolean;
  onGmailToggle: (enabled: boolean) => void;
  onWhatsappToggle: (enabled: boolean) => void;
};

export function NotificationTabs({
  activeTab,
  onTabChange,
  unreadCount,
  onMarkAll,
  activeFilter,
  onFilterChange,
  onOpenSettings,
  showSettings,
  onCloseSettings,
  gmailEnabled,
  whatsappEnabled,
  onGmailToggle,
  onWhatsappToggle,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      {showSettings ? (
        <SettingsPanel 
          onClose={onCloseSettings}
          gmailEnabled={gmailEnabled}
          whatsappEnabled={whatsappEnabled}
          onGmailToggle={onGmailToggle}
          onWhatsappToggle={onWhatsappToggle}
        />
      ) : (
        <>
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

            <button 
              onClick={onOpenSettings} 
              className="p-2 rounded-md hover:bg-gray-200 transition"
            >
              <Settings size={18} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => onFilterChange("gmail")}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition ${
                  activeFilter === "gmail"
                    ? "bg-gray-200 font-medium"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Gmail
              </button>

              <button
                onClick={() => onFilterChange("whatsapp")}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition ${
                  activeFilter === "whatsapp"
                    ? "bg-gray-200 font-medium"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                WhatsApp
              </button>
            </div>
          </div>

          {activeTab === "unread" && unreadCount > 0 && (
            <div className="flex justify-end">
              <button
                onClick={onMarkAll}
                className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition"
              >
                Marcar todas
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
