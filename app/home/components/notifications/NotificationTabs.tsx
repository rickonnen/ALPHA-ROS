"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount: number;
  onMarkAll: () => void;
};

export function NotificationTabs({
  activeTab,
  onTabChange,
  unreadCount,
  onMarkAll,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="bg-blue-100 p-0.5 rounded-md inline-flex h-auto">
          <TabsTrigger
            value="all"
            className="text-sm font-medium leading-5 text-slate-900 px-2 py-1 rounded-sm data-[state=active]:bg-white"
          >
            Todas
          </TabsTrigger>
          <TabsTrigger
            value="unread"
            className="text-sm font-medium leading-5 text-slate-900 px-2 py-1 rounded-sm data-[state=active]:bg-white"
          >
            No leídas {unreadCount > 0 ? `(${unreadCount})` : ""}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {unreadCount > 0 && (
        <button
          onClick={onMarkAll}
          className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition"
        >
          Marcar todas
        </button>
      )}
    </div>
  );
}