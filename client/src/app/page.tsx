"use client";

import Image from 'next/image';
import { FaEthereum, FaGavel } from 'react-icons/fa';
import PokemonCards from "@/data/pokemon_cards.json";
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PokemonCard {
  id: string;
  name: string;
  supertype: string;
  subtypes: string[];
  hp: string;
  types: string[];
  evolvesFrom: string;
  evolvesTo?: string[];
  rules: string[];
  attacks: {
    name: string;
    cost: string[];
    convertedEnergyCost: number;
    damage: string;
    text: string;
  }[];
  images: {
    large: string;
    small: string;
  };
  set: {
    releaseDate: string;
  };
  [key: string]: any; // Allow additional fields if present
}

export default function Home() {
  const [displayedCards, setDisplayedCards] = useState<PokemonCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const x = 12; // Number of cards to display

  useEffect(() => {
    if (PokemonCards && PokemonCards.data) {
      setDisplayedCards(PokemonCards.data.slice(0, x));
    }
  }, []);

  const openModal = (card: PokemonCard) => {
    setSelectedCard(card);
    setIsDialogOpen(true);
  };

  const closeModal = () => {
    setSelectedCard(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="flex bg-zinc-900 items-center justify-center min-h-[92vh] p-10">
      {/* Grid Container */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {displayedCards.map((card, index) => (
          <div
            key={index}
            onClick={() => openModal(card)}
            className="cursor-pointer transition-transform transform hover:scale-110 duration-300"
          >
            <div className="w-[250px] h-[350px] relative">
              <Image
                src={card.images.large}
                alt={card.name}
                layout="fill"
                objectFit="cover"
                className="rounded-md"
              />
            </div>
            <h3 className="mt-6 text-xl text-white font-semibold text-center">{card.name}</h3>
          </div>
        ))}
      </div>

      {selectedCard && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className='flex flex-col bg-transparent border-none w-full'>
            <DialogTitle className="text-2xl">{selectedCard.name}</DialogTitle>
              <div className="w-[350px] h-[490px] relative mb-4 mx-auto">
                <Image
                  src={selectedCard.images.large}
                  alt={selectedCard.name}
                  width={350} 
                  height={490}
                  objectFit="cover"
                  className="rounded-md"
                />
              </div>
              <DialogFooter className="flex mx-auto">
                <Button variant="secondary" className="flex items-center mx-4">
                  <FaEthereum />
                  <span>
                    <span className="font-extrabold mr-2">0.15</span>
                    <span className="font-semibold"> Quick Buy</span>
                  </span>
                </Button>

                <Button variant="secondary" className="flex items-center mx-4">
                  <FaGavel /> {/* Gavel (auction) icon */}
                  <span className='font-semibold'>Place Bid</span>
                </Button>
              </DialogFooter>
          </DialogContent>
          <DialogClose asChild>
            <button className="absolute top-2 right-2 text-xl">&times;</button>
          </DialogClose>
        </Dialog>
      )}
    </div>
  );
}
