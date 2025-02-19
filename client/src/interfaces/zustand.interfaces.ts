import { ListedCard } from "@/types/types";
import { JsonRpcProvider } from "ethers";

export interface MarketplaceStore {
    contractAddress: string,

    listedCards: { [tokenID: number]: ListedCard}, 
    setListedCards: (listedCards: { [tokenID: number]: ListedCard} ) => void
}

export interface WalletStore {
    provider: JsonRpcProvider,
    userAddress: string
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