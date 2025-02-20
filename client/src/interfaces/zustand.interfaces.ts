import { MarketplaceCard, PokemonCard } from "@/types/types";
import { BrowserProvider } from "ethers";

export interface MarketplaceStore {
    contractAddress: string,

    marketplaceCards: { [tokenID: number]: MarketplaceCard}
    setMarketplaceCards: (marketplaceCards: { [tokenID: number]: MarketplaceCard} ) => void
}

export interface UserStore {
    provider: BrowserProvider | null,
    setProvider: (provider: BrowserProvider ) => void

    userAddress: string | null
    setUserAddress: (userAddress: string ) => void

    myCards: {[tokenID: number]: PokemonCard},
    setMyCards: (myCards: {[tokenID: number]: PokemonCard} ) => void
    
}

type Range = {
    min: "",
    max: ""
}

export interface FilterStore {
    searchName: string,
    setSearchName: (name: string) => void,

    selectedType: string,
    setSelectedType: (type: string) => void,

    hpRange: Range,
    setHpRange: (hpRange: Range) => void,

    rarity: string,
    setRarity: (rarity: string) => void,
}