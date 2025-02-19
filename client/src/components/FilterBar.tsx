import useFilterStore from "@/zustand/useFilterStore";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { pokemonTypes } from "@/data/data";
import { Label } from "@/components/ui/label";

const FilterBar = () => {
    const searchName = useFilterStore((state) => state.searchName)
    const setSearchName = useFilterStore((state) => state.setSearchName)
    const setRarity = useFilterStore((state) => state.setRarity)
    const hpRange = useFilterStore((state) => state.hpRange)
    const setHpRange = useFilterStore((state) => state.setHpRange)
    const setSelectedType = useFilterStore((state) => state.setSelectedType)

    return (
        <div className="flex flex-row justify-between bg-zinc-800 w-full items-center space-x-4 border-zinc-700 mb-10 h-12 p-5">
                <div className="flex flex-row space-x-1.5 items-center">
                    <Label className="items-center text-zinc-400 font-mono">Name:</Label>
                    <Input
                        placeholder="Search for a Pokemon"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="w-56 bg-zinc-900 border-zinc-700 text-zinc-300"
                    />
                </div>
                <div className="flex flex-row space-x-1.5 items-center">
                    <Label className="items-center text-zinc-400 font-mono">Rarity:</Label>
                    <Select onValueChange={(value) => setRarity(value)}>
                        <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-400 w-32">
                            <SelectValue placeholder="All"/>
                        </SelectTrigger>
                        <SelectContent position="popper" className="bg-zinc-900 border-zinc-700 text-zinc-400">
                            <SelectItem value="All">All</SelectItem>
                            <SelectItem value="Common">Common</SelectItem>
                            <SelectItem value="Rare">Rare</SelectItem>
                            <SelectItem value="Epic">Epic</SelectItem>
                            <SelectItem value="Legendary">Legendary</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-row space-x-1.5 items-center">
                    <Label className="items-center text-zinc-400 font-mono">Health Points:</Label>
                    <div className="flex items-center space-x-2">
                        <Input
                            placeholder="Min HP"
                            value={hpRange.min}
                            onChange={(e) => setHpRange({ ...hpRange, min: e.target.value })}
                            className="w-20 bg-zinc-900 border-zinc-700 text-zinc-300"
                        />
                        <Input
                            placeholder="Max HP"
                            value={hpRange.max}
                            onChange={(e) => setHpRange({ ...hpRange, max: e.target.value })}
                            className="w-20 bg-zinc-900 border-zinc-700 text-zinc-300"
                        />
                    </div>
                </div>
                <div className="flex flex-row space-x-1.5 items-center">
                    <Label className="items-center text-zinc-400 font-mono">Types:</Label>
                    <Select onValueChange={(value) => {
                        setSelectedType(value);
                    }}>
                        <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-400 w-32">
                            <SelectValue placeholder="All"/>
                        </SelectTrigger>
                        <SelectContent position="popper" className="bg-zinc-900 border-zinc-700 text-zinc-400">
                            <SelectItem value="All">All</SelectItem>
                            {pokemonTypes.map((type) => (
                                <SelectItem key={type.type} value={type.type}>
                                    {type.type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
    )
}
export default FilterBar