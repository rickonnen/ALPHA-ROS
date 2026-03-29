"use client";

import { NotificationHeader } from "./NotificationHeader";
import { NotificationTabs } from "./NotificationTabs";
import { NotificationItem } from "./NotificationItem"; /* sjndnsjc */
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function NotificationPanel() {

    /**Simulacion de Notificacion */
const notifications = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  title: `Notificación ${i + 1}`,
  description: "Texto de prueba",
  read: false,
}));

return (
  <div className="absolute right-0 top-12 z-50 w-96 h-111 rounded-2xl shadow-lg overflow-hidden bg-white flex flex-col">
    
    {/* Header */}
    <NotificationHeader total={notifications.length} />

    {/* Tabs */}
    <div className="p-2">
      <NotificationTabs />
    </div>

    {/* SCROLL */}
    <ScrollArea className="h-full">
      <div className="h-full p-2 space-y-2">
        {notifications.map((n) => (
          <NotificationItem
            key={n.id}
            title={n.title}
            description={n.description}
          />
        ))}
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>

  </div>
);
}