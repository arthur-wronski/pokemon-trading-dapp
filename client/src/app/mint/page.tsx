"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderCircle, Stamp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { pokemonTypes } from "@/data/data";
import { useNFTContract } from "@/hooks/useNFTContract";
import { Rarity } from "@/types/types";

export default function Mint() {
  const [name, setName] = useState<string>("");
  const [hp, setHp] = useState<number | string>("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [attackName, setAttackName] = useState<string>("");
  const [attackDamage, setAttackDamage] = useState<number | string>("");
  const [imageURL, setImageURL] = useState<string>("");
  const [rarity, setRarity] = useState<Rarity | null>(null);

  const [mintingLoading, setMintingLoading] = useState<boolean>(false)

  const { mintCard } = useNFTContract()

  const handleToggleType = (type: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };
  

  const validateForm = () => {
    if (
      !name ||
      !hp ||
      !attackName ||
      !attackDamage ||
      !imageURL ||
      !rarity ||
      selectedTypes.length === 0
    ) {
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setMintingLoading(true)

      await mintCard({
        name,
        hp: hp as number,
        types: selectedTypes,
        attackName,
        attackDamage: attackDamage as number,
        imageURL,
        rarity: rarity as Rarity,
      })
      setMintingLoading(false)
      
    } catch (error) {
      console.error("Error minting card:", error);
      setMintingLoading(false)
    }
  };

  return (
    <div className="flex bg-zinc-900 min-h-[92vh] items-center justify-center">
      <Card className="w-[450px] bg-zinc-800 border-zinc-700 text-zinc-200">
        <CardHeader>
          <CardTitle className="text-xl">Mint new Pokemon card</CardTitle>
          <CardDescription className="text-zinc-400">
            Fill in the card&apos;s details to mint in one-click.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">      
              {/* Name */}
              <div className="flex flex-col space-y-1.5">
                <Label className="font-semibold">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Pokemon name"
                  className="bg-zinc-900 border-transparent text-zinc-300"
                />
              </div>

              {/* Health Points */}
              <div className="flex flex-col space-y-1.5">
                <Label className="font-semibold">Health Points</Label>
                <Input
                  id="hp"
                  value={hp}
                  onChange={(e) => setHp(e.target.value)}
                  placeholder="Pokemon's HP"
                  type="number"
                  className="bg-zinc-900 border-transparent text-zinc-300"

                />
              </div>

              {/* Types */}
              <div className="flex flex-col space-y-1.5">
                <Label className="font-semibold">Types</Label>
                <div className="grid grid-cols-3 gap-2">
                  {pokemonTypes.map(({ type, colour, icon: Icon }) => (
                    <Button
                      key={type}
                      onClick={(e) => handleToggleType(type, e)}
                      className={`cursor-pointer p-2 rounded-md`} 
                      style={{ 
                        backgroundColor: selectedTypes.includes(type) ? colour : '#1f2937'
                      }}
                    >
                      <Icon className="mr-2" size={16} />
                      {type}
                    </Button>
                  
                  ))}
                </div>
              </div>

              {/* Attack Name and Attack Damage side by side */}
              <div className="flex space-x-4">
                <div className="flex-1 flex flex-col space-y-1.5">
                  <Label className="font-semibold">Attack Name</Label>
                  <Input
                    id="attackName"
                    value={attackName}
                    onChange={(e) => setAttackName(e.target.value)}
                    placeholder="Attack name"
                    className="bg-zinc-900 border-transparent text-zinc-300"

                  />
                </div>
                <div className="flex-1 flex flex-col space-y-1.5">
                  <Label className="font-semibold">Attack Damage</Label>
                  <Input
                    id="attackDamage"
                    value={attackDamage}
                    onChange={(e) => setAttackDamage(e.target.value)}
                    placeholder="Attack damage"
                    type="number"
                    className="bg-zinc-900 border-transparent text-zinc-300"

                  />
                </div>
              </div>

              {/* Image URL */}
              <div className="flex flex-col space-y-1.5">
                <Label className="font-semibold">Image URL</Label>
                <Input
                  id="imageURL"
                  value={imageURL}
                  onChange={(e) => setImageURL(e.target.value)}
                  placeholder="Card image URL"
                  className="bg-zinc-900 border-transparent text-zinc-300"

                />
              </div>

              {/* Rarity */}
              <div className="flex flex-col space-y-1.5">
                <Label className="font-semibold">Rarity</Label>
                <Select value={rarity ?? ""} onValueChange={(value) => setRarity(value as Rarity)}
                >
                  <SelectTrigger id="rarity" className="bg-zinc-900 border-transparent text-zinc-300">
                    <SelectValue placeholder="Select rarity" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="bg-zinc-900 border-transparent text-zinc-300">
                    <SelectItem value="Common">Common</SelectItem>
                    <SelectItem value="Rare">Rare</SelectItem>
                    <SelectItem value="Epic">Epic</SelectItem>
                    <SelectItem value="Legendary">Legendary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleSubmit} disabled={!validateForm()} className="bg-teal-600 w-32 hover:bg-teal-700">
            <Stamp /> 
            {mintingLoading ? <LoaderCircle className="animate-spin"/> : "Mint"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
