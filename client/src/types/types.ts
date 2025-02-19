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

