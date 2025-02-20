import React from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { PokemonCard } from "@/types/types";
import { Separator } from "@/components/ui/separator";
import CardDetails from "@/components/cards/CardDetails";
import ListingDetails from "../tabs/ListingDetails";

interface SelectedCard {
    tokenID: number,
    card: PokemonCard
}

interface CardViewerProps {
    selectedCard: SelectedCard,
    open: boolean,
    setIsOpen: (open: boolean) => void,
}

const CardViewer: React.FC<CardViewerProps> = ({selectedCard, open, setIsOpen}) => {
    const metadata = selectedCard.card.metadata
    return(
        <Dialog open={open} onOpenChange={setIsOpen}>
            <DialogContent className='flex flex-col bg-zinc-900 border-none min-w-[55%] min-h-[50%] [&>button]:hidden'>
                <DialogTitle className="text-2xl text-center text-zinc-200 font-mono">
                    {metadata.name}
                </DialogTitle>
                <div className="flex flex-row space-x-8 justify-center">
                    <div className="w-[350px] h-[490px] relative mb-4">
                        <Image
                            src={metadata.imageURL}
                            alt={metadata.name}
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
                    <ListingDetails tokenID={selectedCard.tokenID}/>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default CardViewer