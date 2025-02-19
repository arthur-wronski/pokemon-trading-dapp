"use client";

import React from "react";
import CardGrid from '@/components/CardGrid';
import { useMarketplace } from "@/hooks/useMarketplace";

export default function Home() {
    const { marketplaceCards, loading } = useMarketplace()
    return(
        <CardGrid cards={marketplaceCards} loading={loading} />
    );
}
