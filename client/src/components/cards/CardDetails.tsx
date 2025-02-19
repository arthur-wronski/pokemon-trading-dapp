import { PokemonCard } from "@/types/types"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Copy } from "lucide-react"
import { formatAddress } from "@/utils/utils"
import { pokemonTypes, rarityToColourMap } from "@/data/data"
import { Separator } from "@/components/ui/separator"

interface CardDetailsProps {
    card: PokemonCard
}

const CardDetails = ({card}: CardDetailsProps) => {
    return(
        <Card className="bg-zinc-950 w-[275px] h-[490px] text-zinc-200 border-zinc-700">
            <CardHeader className="pb-0">
                <CardTitle className="text-center">Card Details</CardTitle>
            </CardHeader>
            <Separator className="bg-zinc-700 my-4"/>
            <CardContent>
                <form>
                <div className="flex flex-col space-y-5 w-full font-semibold">
                    <div className="flex flex-col space-y-1.5">
                        <Label className="font-mono text-zinc-400">Owner</Label>
                        <div className="flex flex-row space-x-3 text-zinc-300 items-center">
                            <Copy size={16}/>
                            <p className="text-center font-mono"> {formatAddress(card.owner)} </p>
                        </div> 
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <Label className="font-mono text-zinc-400">Health Points</Label>
                        <p className="text-center text-2xl"> {card.metadata.hp.toLocaleString()} </p>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <Label className="font-mono text-zinc-400">Types</Label>
                        <p className="text-center">
                            {card.metadata.types
                                .map((type) => {
                                    const pokemonType = pokemonTypes.find(t => t.type === type);

                                    return (
                                        <span
                                            key={type}
                                            className="inline-block"
                                            style={{ color: pokemonType?.colour }}
                                        >
                                            {pokemonType?.type}
                                        </span>
                                    );
                                })
                                .reduce((prev, curr) => [prev, ' + ', curr])}
                        </p>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <Label className="font-mono text-zinc-400">Attack Name</Label>
                        <p className="text-center"> {card.metadata.attackName} </p>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <Label className="font-mono text-zinc-400">Attack Damage</Label>
                        <p className="text-center text-xl"> {card.metadata.attackDamage} </p>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <Label className="font-mono text-zinc-400">Rarity</Label>
                        <p 
                            className={`text-center font-bold animate-pulse duration-[5s]`}
                            style={{ color: rarityToColourMap[card.metadata.rarity] }}
                        >
                            {card.metadata.rarity}
                        </p>
                    </div>
                </div>
                </form>
            </CardContent>
        </Card>
    )
}

export default CardDetails