"use client";

import React from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function CloseTabButton({ children, ...props }: Props) {
  return (
    <button onClick={() => window.close()} {...props}>
      {children}
    </button>
  );
}