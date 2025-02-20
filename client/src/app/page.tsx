"use client";

import React from "react";
import CardGrid from '@/components/CardGrid';
import { useMarketplace } from "@/hooks/useMarketplace";
import useMarketplaceStore from "@/zustand/useMarketplaceStore";

export default function Home() {
    const { loading } = useMarketplace()

    const marketplaceCards = useMarketplaceStore((state) => state.marketplaceCards)
    
    return(
        <CardGrid cards={marketplaceCards} loading={loading} type="Marketplace"/>
    );
}
