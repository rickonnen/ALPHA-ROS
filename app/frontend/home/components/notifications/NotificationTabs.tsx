"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function NotificationTabs() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="flex items-center justify-between">

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
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
            No leídas
            </TabsTrigger>

        </TabsList>
      </Tabs>

      {/* BOTÓN NO LEÍDAS */}
        <button className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition">
                Marcar todas
        </button>

    </div>
  );
}