import { useState, useEffect } from "react";

export function useResetFlow() {
  const [screen, setScreenState] = useState<"auth" | "forgot" | "code" | "newpass">(
    () => (typeof window !== "undefined" && sessionStorage.getItem("reset_screen") as any) || "auth"
  );
  const [forgotEmail, setForgotEmailState] = useState(
    () => (typeof window !== "undefined" && sessionStorage.getItem("reset_email")) || ""
  );

  useEffect(() => {
    if (screen === "auth") {
      sessionStorage.removeItem("reset_screen");
      sessionStorage.removeItem("reset_email");
    } else {
      sessionStorage.setItem("reset_screen", screen);
      if (forgotEmail) sessionStorage.setItem("reset_email", forgotEmail);
    }
  }, [screen, forgotEmail]);

  function setScreen(s: "auth" | "forgot" | "code" | "newpass") {
    setScreenState(s);
  }

  function setForgotEmail(email: string) {
    setForgotEmailState(email);
  }

  function clearResetFlow() {
    sessionStorage.removeItem("reset_screen");
    sessionStorage.removeItem("reset_email");
    setScreenState("auth");
    setForgotEmailState("");
  }

  return { screen, setScreen, forgotEmail, setForgotEmail, clearResetFlow };
}