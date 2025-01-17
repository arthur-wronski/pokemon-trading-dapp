"use client"; 

import { MetaMaskProvider } from "@metamask/sdk-react";
import { ReactNode } from "react";
import NavBar from "@/components/NavBar";
import { Toaster } from "@/components/ui/toaster";

export default function ClientProvider({ children }: { children: ReactNode }) {
  return (
    <MetaMaskProvider sdkOptions={{ dappMetadata: { url: typeof window !== "undefined" ? window.location.href : "" } }}>
      <NavBar />
      <Toaster />
      {children}
    </MetaMaskProvider>
  );
}
