export type Rarity = "Common" | "Rare" | "Epic" | "Legendary";

export type PokemonMetadata = {
    name: string,
    hp: number,
    types: string[],
    attackName: string,
    attackDamage: number,
    imageURL: string,
    rarity: Rarity
}

export type PokemonCard = {
    metadata: PokemonMetadata,
    owner: string,
}

export type ListedCard = {
    metadata: PokemonMetadata,
    owner: string,
    price: number
};

export type AuctionedCard = {
    metadata: PokemonMetadata,
    owner: string,
    startingPrice: number,
    highestBid: number,
    highestBidder: string,
    endTime: number
};

export type MarketplaceCard = ListedCard | AuctionedCard
