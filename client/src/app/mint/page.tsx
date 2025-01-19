import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Stamp } from "lucide-react";

export default function Mint() {
  return (
    <div className="flex bg-zinc-900  min-h-[92vh] items-center justify-center">
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Mint new Pokemon card</CardTitle>
                <CardDescription>Fill in the card&apos;s details to mint in one-click.</CardDescription>
            </CardHeader>
            <CardContent>
                <form>
                <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="name">Card ID</Label>
                        <Input id="name" placeholder="Unique card ID" />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Name of the card" />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="name">Health Points</Label>
                        <Input id="name" placeholder="Pokemon's HP" />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="framework">Types</Label>
                        <Select>
                            <SelectTrigger id="framework">
                            <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                            <SelectItem value="next">Plant</SelectItem>
                            <SelectItem value="sveltekit">Fire</SelectItem>
                            <SelectItem value="astro">Water</SelectItem>
                            <SelectItem value="nuxt">Rock</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="name">Attack</Label>
                        <Input id="name" placeholder="Attack name" />
                        <Input id="name" placeholder="Attack damage" />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="name">Image URL</Label>
                        <Input id="name" placeholder="Card image URL" />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="framework">Rarity</Label>
                        <Select>
                            <SelectTrigger id="framework">
                            <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                            <SelectItem value="next">Common</SelectItem>
                            <SelectItem value="sveltekit">Uncommon</SelectItem>
                            <SelectItem value="astro">Rare</SelectItem>
                            <SelectItem value="nuxt">Epic</SelectItem>
                            <SelectItem value="nuxt">Legendary</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                </form>
            </CardContent>
            <CardFooter className="flex justify-center">
                <Button><Stamp/>Mint</Button>
            </CardFooter>
        </Card>
    </div>
  );
}
