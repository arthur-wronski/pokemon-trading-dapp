"use client"

import React, { useState } from "react";
import { useFetchOwnedCards } from "@/hooks/useFetchOwnedCards";
import Image from "next/image";
import { ethers } from "ethers";
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { PokemonMetadata } from "@/types/types";

const CollectionPage = () => {
    const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; 
    const userAddress = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
    const provider = new ethers.JsonRpcProvider();
    const  pinataGateway = process.env.NEXT_PUBLIC_GATEWAY_URL as string;

    const [selectedCard, setSelectedCard] = useState<PokemonMetadata | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { cards, loading } = useFetchOwnedCards(
        provider,
        contractAddress,
        userAddress,
        pinataGateway
    );

    if (loading) {
        return <div>Loading...</div>;
    }


    const openModal = (card: PokemonMetadata) => {
        setSelectedCard(card);
        setIsDialogOpen(true);
    };

    return (
        <div className="flex bg-zinc-900 items-center justify-center min-h-[92vh] p-10">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        onClick={() => openModal(card)}
                        className="cursor-pointer transition-transform transform hover:scale-110 duration-300"
                    >
                        <div className="w-[250px] h-[350px] relative">
                            <Image
                                src={card.imageURL}
                                alt={card.name}
                                layout="fill"
                                objectFit="cover"
                                className="rounded-md"
                            />
                        </div>
                        <h3 className="mt-6 text-xl text-white font-semibold text-center">
                            {card.name}
                        </h3>
                    </div>
                ))}
            </div>
            {selectedCard && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className='flex flex-col bg-transparent border-none w-full'>
                    <DialogTitle className="text-2xl">{selectedCard.name}</DialogTitle>
                    <div className="w-[350px] h-[490px] relative mb-4 mx-auto">
                        <Image
                        src={selectedCard.imageURL}
                        alt={selectedCard.name}
                        width={350} 
                        height={490}
                        objectFit="cover"
                        className="rounded-md"
                        />
                    </div>
                </DialogContent>
                <DialogClose asChild>
                    <button className="absolute top-2 right-2 text-xl">&times;</button>
                </DialogClose>
                </Dialog>
            )}
        </div>
    );
};

export default CollectionPage;
