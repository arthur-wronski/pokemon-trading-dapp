"use client";

import React, { useState } from "react";
import { useFetchOwnedCards } from "@/hooks/useFetchOwnedCards";
import Image from "next/image";
import { ethers } from "ethers";
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { PokemonMetadata } from "@/types/types";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FaEthereum } from "react-icons/fa";
import CardDetails from "@/components/cards/CardDetails";

const CollectionPage = () => {
    const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; 
    const userAddress = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
    const provider = new ethers.JsonRpcProvider();
    const pinataGateway = process.env.NEXT_PUBLIC_GATEWAY_URL as string;

    const [selectedCard, setSelectedCard] = useState<{ card: PokemonMetadata, tokenID: number } | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { cards, loading } = useFetchOwnedCards(
        provider,
        contractAddress,
        userAddress,
        pinataGateway
    );

    if (loading) {
        return <p className="flex bg-zinc-900 min-h-[92vh] w-full justify-center items-center my-auto font-semibold text-2xl text-zinc-200">Loading your collection...</p>;
    }

    const openModal = (card: PokemonMetadata, tokenID: number) => {
        setSelectedCard({ card, tokenID });
        setIsDialogOpen(true);
    };

    const handleBuy = (tokenID: number) => {
        console.log(`Buying card with tokenID: ${tokenID}`);
    };

    return (
        <div className="flex bg-zinc-900 items-center justify-center min-h-[92vh] p-10">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
                {Object.keys(cards).map((tokenID) => {
                    const card = cards[tokenID];
                    return (
                        <div
                            key={tokenID}
                            onClick={() => openModal(card, tokenID)}
                            className="cursor-pointer transition-transform transform hover:scale-110 duration-300"
                        >
                            <div className="w-[250px] h-[350px] relative">
                                <Image
                                    src={card.imageURL}
                                    alt={card.name}
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
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className='flex flex-col bg-zinc-900 border-none min-w-[50%] min-h-[50%] [&>button]:hidden'>
                        <DialogTitle className="text-2xl text-center text-zinc-200 font-mono">
                            {selectedCard.card.name}
                        </DialogTitle>
                        <div className="flex flex-row space-x-8 justify-center">
                            <div className="w-[350px] h-[490px] relative mb-4">
                                <Image
                                    src={selectedCard.card.imageURL}
                                    alt={selectedCard.card.name}
                                    width={350} 
                                    height={490}
                                    objectFit="cover"
                                    className="rounded-md"
                                />
                            </div>
                            <Separator orientation="vertical" className="flex bg-zinc-700 h-[50vh] my-auto"/>
                            <CardDetails card={selectedCard.card}/>
                        </div>
                        <div>
                            <Button 
                                className="flex mx-auto bg-teal-600 hover:bg-teal-700 font-mono"
                                onClick={() => handleBuy(selectedCard.tokenID)}
                            >
                                <FaEthereum/>
                                0.2 Buy 
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default CollectionPage;
