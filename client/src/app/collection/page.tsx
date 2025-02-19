"use client"

import React from "react";
import { useNFTContract } from "@/hooks/useNFTContract";
import CardGrid from "@/components/CardGrid";

const CollectionPage = () => {
    const { cards, loading } = useNFTContract()
    return (
        <CardGrid cards={cards} loading={loading}/>
    );
};

export default CollectionPage;
