import { MarketplaceCard } from "@/types/types";
import { JsonRpcProvider } from "ethers";

export interface MarketplaceStore {
    contractAddress: string,

    marketplaceCards: { [tokenID: number]: MarketplaceCard}
    setMarketplaceCards: (marketplaceCards: { [tokenID: number]: MarketplaceCard} ) => void
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