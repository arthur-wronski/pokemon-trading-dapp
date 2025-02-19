import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaEthereum } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useMarketplace } from "@/hooks/useMarketplace";
import useWalletStore from "@/zustand/useWalletStore";

const ListingDetails: React.FC<{ tokenID: number }> = ({ tokenID }) => {
    const [listingPrice, setListingPrice] = useState<number>(1)
    const { listedCards, actions } = useMarketplace()
    const userAddress = useWalletStore((state) => state.userAddress)

    // in mins
    const [auctionDuration, setAuctionDuration] = useState<number>(60)

    const handleListing = async () => {
        console.log(`Listing card with tokenID: ${tokenID} at price: ${listingPrice}`);
        const res = await actions.listCard(tokenID, BigInt(listingPrice))
        console.log(res)
        return res
    };

    const handleAuction = () => {
        console.log(`Auctioning card with tokenID: ${tokenID} with starting price: ${listingPrice} and duration of ${auctionDuration} minutes`);
    };

    // if card already listed
    if (Object.keys(listedCards).includes(tokenID.toString())) {
        return (
            <div className="flex flex-row justify-center space-x-6 items-center">
                {userAddress === listedCards[tokenID].owner.toLowerCase() ? 
                    <>
                        <Button 
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => actions.cancelListing(tokenID)}
                        >
                            Cancel Listing
                        </Button>
                        <p className="text-zinc-200 font-bold">
                            Listed for {listedCards[tokenID].price} ETH
                        </p>
                    </>
                    :
                    <Button 
                            className="bg-teal-600 hover:bg-teal-700"
                            onClick={() => actions.buyCard(tokenID, BigInt(listedCards[tokenID].price))}
                        >
                            <FaEthereum/>
                            Buy for {listedCards[tokenID].price} ETH
                    </Button>
                }
            </div>
        );
    }

    return (
        <Tabs defaultValue="account" className="w-full text-center">
            <TabsList className="bg-zinc-950 ">
                <TabsTrigger value="account">Listing</TabsTrigger>
                <TabsTrigger value="password">Auction</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
                <div className="flex flex-row justify-center space-x-8">
                    <div className="flex flex-row space-x-3">
                        <Label className="text-zinc-400 font-mono my-auto">Listing Price</Label>
                        <Input className="text-zinc-400 bg-zinc-800 border-zinc-700 w-48" placeholder="0" value={listingPrice} onChange={(e) => setListingPrice(Number(e.target.value))}></Input>
                    </div>
                    <Button
                        className=" bg-teal-600 hover:bg-teal-700 font-mono"
                        onClick={() => handleListing()}
                    >
                        <FaEthereum />
                        List Card
                    </Button>
                </div>
            </TabsContent>
            <TabsContent value="password">
                <div className="flex flex-row justify-center space-x-8">
                    <div className="flex flex-row space-x-3">
                        <Label className="text-zinc-400 font-mono my-auto">Starting Price</Label>
                        <Input className="text-zinc-400 bg-zinc-800 border-zinc-700 w-48" placeholder="0" value={listingPrice} onChange={(e) => setListingPrice(Number(e.target.value))}></Input>
                    </div>
                    <Select onValueChange={(value) => setAuctionDuration(Number(value))}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-400 w-32">
                            <SelectValue placeholder="Expiry" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-400">
                            <SelectGroup>
                                <SelectLabel>Duration</SelectLabel>
                                <SelectItem value={"60"}>1 hour</SelectItem>
                                <SelectItem value="480">8 hours</SelectItem>
                                <SelectItem value="1440">1 day</SelectItem>
                                <SelectItem value="10080">1 week</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Button
                        className=" bg-teal-600 hover:bg-teal-700 font-mono"
                        onClick={() => handleAuction()}
                    >
                        <FaEthereum />
                        Auction Card
                    </Button>
                </div>
            </TabsContent>
        </Tabs>
    )
}
export default ListingDetails