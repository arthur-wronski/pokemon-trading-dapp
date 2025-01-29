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
import { Biohazard, Bird, Brain, Leaf, MoonStar, Snowflake, Stamp, Waves, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flame } from "lucide-react";
import { ethers } from "ethers";
import PokemonCardABI from "../../../../hardhat/artifacts/contracts/PokemonCard.sol/PokemonCard.json"; 
import { PokemonMetadata, Rarity } from "@/types/types";

export default function Mint() {
  const [name, setName] = useState<string>("");
  const [hp, setHp] = useState<number | string>("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [attackName, setAttackName] = useState<string>("");
  const [attackDamage, setAttackDamage] = useState<number | string>("");
  const [imageURL, setImageURL] = useState<string>("");
  const [rarity, setRarity] = useState<Rarity | null>(null);

  const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

  const pokemonTypes = [
    { type: "Fire", colour: "#f59e0b", icon: Flame }, 
    { type: "Water", colour: "#0ea5e9", icon: Waves }, 
    { type: "Electric", colour: "#fdd835", icon: Zap }, 
    { type: "Grass", colour: "#10b981", icon: Leaf }, 
    { type: "Psychic", colour: "#ed64a6", icon: Brain }, 
    { type: "Dark", colour: "#585858", icon: MoonStar }, 
    { type: "Ice", colour: "#94b4c9", icon: Snowflake }, 
    { type: "Poison", colour: "#a333c8", icon: Biohazard },
    { type: "Flying", colour: "#a890fc", icon: Bird }
  ];

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
      // alert("Please fill in all fields before minting.");
      return false;
    }
    return true;
  };

  const mintCard = async (ipfsURL: string) => {
    try{
      const provider = new ethers.JsonRpcProvider();
      const signer = await provider.getSigner();

      // Create a contract instance
      const pokemonCardContract = new ethers.Contract(contractAddress, PokemonCardABI.abi, signer);

      const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider); 

      // Call the contract's minting function
      const tx = await pokemonCardContract.mintPokemonCard(wallet.address, ipfsURL);

      // Wait for the transaction to be mined
      await tx.wait();
      console.log("Card minted successfully:", tx);
      alert("Card minted successfully!");
    }catch (err) {
      console.error("Error minting card:", err);
      alert("Minting failed. Please try again.");
    }
  }

  const handleUploadToIPFS = async (metadata: PokemonMetadata) => {
    try {
      const response = await fetch("/api/upload-ipfs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
      });

      return await response.json()
      
    } catch (error) {
      console.error("Error uploading metadata to IPFS:", error);
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      

      const ipfsURL = await handleUploadToIPFS({
        name,
        hp: hp as number,
        types: selectedTypes,
        attackName,
        attackDamage: attackDamage as number,
        imageURL,
        rarity: rarity as Rarity,
      });

      return await mintCard(ipfsURL)
      
    } catch (error) {
      console.error("Error minting card:", error);
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
            <Stamp /> Mint
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
