"use client";

import { useMarketplace } from '@/hooks/useMarketplace';
import CardViewer from '@/components/modals/CardViewer';
import { PokemonCard } from '@/types/types';
import React, { useState } from "react";
import Image from "next/image";
import useFilterStore from '@/zustand/useFilterStore';
import FilterBar from '@/components/FilterBar';

export default function Home() {
    const [selectedCard, setSelectedCard] = useState<{ card: PokemonCard, tokenID: number,} | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const searchName = useFilterStore((state) => state.searchName)
    const rarity = useFilterStore((state) => state.rarity)
    const hpRange = useFilterStore((state) => state.hpRange)
    const selectedType = useFilterStore((state) => state.selectedType)

    const { marketplaceCards, loading } = useMarketplace();

    if (loading) {
        return <p className="flex bg-zinc-900 min-h-[92vh] w-full justify-center items-center my-auto font-semibold text-2xl text-zinc-200">Loading the marketplace...</p>;
    }

    if (Object.keys(marketplaceCards).length === 0) {
        return <p className="flex bg-zinc-900 min-h-[92vh] w-full justify-center items-center my-auto font-semibold text-2xl text-zinc-200">No cards are currently listed. Come back later!</p>;
    }

    const openModal = (card: PokemonCard, tokenID: number) => {
        setSelectedCard({ card, tokenID });
        setIsDialogOpen(true);
    };

    const filteredCards = Object.keys(marketplaceCards).filter((tokenID) => {
        const card = marketplaceCards[Number(tokenID)].metadata;
        const matchesName = card.name.toLowerCase().includes(searchName.toLowerCase());
        const matchesRarity = rarity != "All" ? card.rarity === rarity : true;
        const matchesHp = (!hpRange.min || card.hp >= Number(hpRange.min)) && (!hpRange.max || card.hp <= Number(hpRange.max));
        const matchesType = selectedType != "All"  ? card.types.includes(selectedType) : true;

        return matchesName && matchesRarity && matchesHp && matchesType;
    });

    if (filteredCards.length === 0){
        return (
            <div className="flex flex-col bg-zinc-900 items-center min-h-[92vh]">
                <FilterBar/>
                <p className="flex bg-zinc-900 w-full justify-center items-center my-auto font-semibold text-2xl text-zinc-200">No NFTs match your current filter criteria. Try adjusting your search </p>;
            </div>
        )
    }

    return (
        <div className="flex flex-col bg-zinc-900 items-center min-h-[92vh]">
            <FilterBar/>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
                {filteredCards.map((tokenID) => {
                    const card = marketplaceCards[Number(tokenID)];
                    return (
                        <div
                            key={tokenID}
                            onClick={() => openModal(card, Number(tokenID))}
                            className="cursor-pointer transition-transform transform hover:scale-110 duration-300"
                        >
                            <div className="w-[250px] h-[350px] relative">
                                <Image
                                    src={card.metadata.imageURL}
                                    alt={card.metadata.name}
                                    fill
                                    objectFit="cover"
                                    className="rounded-md"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedCard && (
                <CardViewer selectedCard={selectedCard} open={isDialogOpen} setIsOpen={setIsDialogOpen}/>
            )}
        </div>
    )
}
