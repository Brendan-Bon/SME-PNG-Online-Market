"use client";

import React from "react";
import { AppContextProvider } from "@/context/AppContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AppContextProvider>{children}</AppContextProvider>;
}
