"use client";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import MagicLinkForm from "./MagicLinkForm";
import MagicLinkSentForm from "./MagicLinkSentForm";

export function useMagicLinkFlow() {
  const [magicScreen, setMagicScreen] = useState<"none" | "form" | "sent">("none");
  const [magicEmail, setMagicEmail] = useState("");

  const isActive = magicScreen !== "none";

  function open() { setMagicScreen("form"); }
  function close() { setMagicScreen("none"); setMagicEmail(""); }

  function BackButton() {
    if (!isActive) return null;
    return (
      <button
        onClick={close}
        className="text-[#B47B65] font-bold text-sm flex items-center gap-1 hover:underline"
      >
        <ArrowLeft size={15} /> LOGIN
      </button>
    );
  }

  function Screen() {
    if (magicScreen === "form")
      return (
        <div className="mt-6 overflow-y-auto pr-2">
          <MagicLinkForm
            onBack={close}
            onSent={(email) => { setMagicEmail(email); setMagicScreen("sent"); }}
          />
        </div>
      );
    if (magicScreen === "sent")
      return (
        <div className="mt-6 overflow-y-auto pr-2">
          <MagicLinkSentForm email={magicEmail} onResend={() => {}} />
        </div>
      );
    return null;
  }

  return { isActive, open, close, BackButton, Screen };
}