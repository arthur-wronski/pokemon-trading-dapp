import { Biohazard, Bird, Brain, Leaf, MoonStar, Snowflake, Flame, Waves, Zap } from "lucide-react";

export const pokemonTypes = [
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

export const rarityToColourMap = {
    Common: "#ffffff",      
    Rare: "#3b82f6",       
    Epic: "#a855f7",      
    Legendary: "#f59e0b", 
  };