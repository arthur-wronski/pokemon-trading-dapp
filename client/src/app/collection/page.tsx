"use client"

import React from "react";
import { useNFTContract } from "@/hooks/useNFTContract";
import CardGrid from "@/components/CardGrid";
import useUserStore from "@/zustand/useUserStore";

const CollectionPage = () => {
    const { loading } = useNFTContract()

    const myCards = useUserStore((state) => state.myCards)
    
    return (
        <CardGrid cards={myCards} loading={loading} type="Collection"/>
    );
};

export default CollectionPage;
