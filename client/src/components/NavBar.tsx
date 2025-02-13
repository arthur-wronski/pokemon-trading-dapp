"use client";

import Link from "next/link";
import { Orbitron } from "next/font/google";
import { Wallet, Copy, CircleDollarSign, SquareLibrary, Stamp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSDK } from "@metamask/sdk-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator";
import PokeBall from "@/components/PokeBall";
import { usePathname } from 'next/navigation'
import { formatAddress } from "@/utils/utils";

const orbitron = Orbitron({
  subsets: ["latin"],
  display: "swap",
});

const NavBar = () => {
  const [account, setAccount] = useState<string>();
  const { sdk } = useSDK();

  const pathname = usePathname()


  const connectToMetamask = async () => {
    try {
      const accounts = await sdk?.connect();
      setAccount(accounts?.[0]);
      toast({
        description: "MetaMask connection successful",
      })
    } catch (err) {
      console.warn("Failed to connect to metamask", err);
    }
  };

  const copyToClipboard = (address: string | undefined) => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        description: "Address copied to clipboard",
      })
    }
  };

  return (
    <div className="sticky top-0 z-50">
      <div className="flex flex-row justify-between bg-zinc-900 text-white w-full h-16 p-4">
        <div className="flex flex-row space-x-6 text-lg my-auto">
          <Link href="\" className="flex flex-row space-x-1">
            <CircleDollarSign size={16} className="my-auto"/>
            <h1 className={`hover:text-zinc-300 ${pathname === '/' ? "underline" : ''}`}>
              Marketplace
            </h1>
          </Link>
          <Link href="\collection" className="flex flex-row space-x-1">
            <SquareLibrary size={16} className="my-auto"/>
            <h1 className={`hover:text-zinc-300 ${pathname === '/collection' ? "underline" : ''}`}>
              My Cards
            </h1>
          </Link>
          <Link href="\mint" className="flex flex-row space-x-1">
            <Stamp size={16} className="my-auto"/>
            <h1 className={`hover:text-zinc-300 ${pathname === '/mint' ? "underline" : ''}`}>
              Minting
            </h1>
          </Link>
        </div>

        <Link href="/" className="absolute left-1/2 transform -translate-x-1/2 flex flex-row space-x-1">
          <PokeBall/>
          <h1 className={`text-3xl font-bold ${orbitron.className}`}>PokeFi</h1>
        </Link>

        <div className="flex flex-row space-x-8 my-auto mr-4">
          <Button
            variant="outline"
            onClick={account ? () => copyToClipboard(account) : connectToMetamask}
            className={`${account ? "bg-[#c084fc] hover:bg-[#ad5cfe]" :"bg-[#1f2937] hover:bg-[#c084fc]"} border-[#c084fc] hover:text-zinc-200`}
          >
            {account ? (
              <>
                <Copy size={18} />
                <span>{formatAddress(account)}</span>
              </>
            ) : (
              <>
                <Wallet size={18} />
                <span>Connect Wallet</span>
              </>
            )}
          </Button>
        </div>
      </div>
      <Separator className="bg-slate-600"/>
    </div>
  );
};

export default NavBar;
