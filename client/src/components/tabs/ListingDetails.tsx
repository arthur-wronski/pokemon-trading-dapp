import React, { useEffect, useState } from "react";
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
import useUserStore from "@/zustand/useUserStore";
import { AuctionedCard, ListedCard } from "@/types/types";
import { X, Gavel } from "lucide-react";
import useMarketplaceStore from "@/zustand/useMarketplaceStore";

const ListingDetails: React.FC<{ tokenID: number }> = ({ tokenID }) => {
    const [listingPrice, setListingPrice] = useState<number>(1)
    const { actions } = useMarketplace()
    const marketplaceCards = useMarketplaceStore((state) => state.marketplaceCards)
    const userAddress = useUserStore((state) => state.userAddress)
    const [bidAmount, setBidAmount] = useState<number>(1)
    const [timeLeft, setTimeLeft] = useState<string>("");

    // in seconds
    const [auctionDuration, setAuctionDuration] = useState<number>(3600)

    useEffect(() => {
        const auctionedCard = marketplaceCards[tokenID] as AuctionedCard | undefined;
        if (!auctionedCard) return;

        // Update the time remaining every second
        const interval = setInterval(() => {
            const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
            const timeRemaining = auctionedCard.endTime - currentTime;

            if (timeRemaining > 0) {
                const days = Math.floor(timeRemaining / (60 * 60 * 24));
                const hours = Math.floor((timeRemaining % (60 * 60 * 24)) / (60 * 60));
                const minutes = Math.floor((timeRemaining % (60 * 60)) / 60);
                const seconds = timeRemaining % 60;

                const timeString = `${days > 0 ? `${days}d ` : ""}${
                    hours > 0 ? `${hours}h ` : ""
                }${minutes > 0 ? `${minutes}m ` : ""}${seconds}s`;

                setTimeLeft(timeString);
            } else {
                setTimeLeft("Auction Ended");
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleListing = async () => {
        console.log(`Listing card with tokenID: ${tokenID} at price: ${listingPrice}`);
        const res = await actions.listCard(tokenID, BigInt(listingPrice))
        console.log(res)
        return res
    };

    const handleAuction = async () => {
        console.log(`Auctioning card with tokenID: ${tokenID} with starting price: ${listingPrice} and duration of ${auctionDuration} minutes`);
        const res = await actions.startAuction(tokenID, BigInt(listingPrice), BigInt(auctionDuration))
        console.log(res)
        return res
    };

    // if card already listed or auctioned
    if (Object.keys(marketplaceCards).includes(tokenID.toString())) {
        if ('price' in marketplaceCards[tokenID]) {
            const listedCard = marketplaceCards[tokenID] as ListedCard; 
            return (
                <div className="flex flex-row justify-center space-x-6 items-center">
                    {userAddress === listedCard.owner.toLowerCase() ? 
                        <>
                            <Button 
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => actions.cancelListing(tokenID)}
                            >
                                <X/>
                                Cancel Listing
                            </Button>
                            <p className="text-zinc-200 font-bold">
                                Listed for {listedCard.price} ETH
                            </p>
                        </>
                        :
                        <Button 
                            className="bg-teal-600 hover:bg-teal-700"
                            onClick={() => actions.buyCard(tokenID, BigInt(listedCard.price))}
                        >
                            <FaEthereum/>
                            Buy for {listedCard.price} ETH
                        </Button>
                    }
                </div>
            );
        }
        else{
            const auctionedCard = marketplaceCards[tokenID] as AuctionedCard; 

            console.log("Auctioned card: ", auctionedCard)
            return (
                <div className="flex flex-row justify-center space-x-6 items-center">
                    {
                        auctionedCard.highestBid === 0 ? 
                            <p className="text-zinc-200 font-bold">
                                Starting price: {auctionedCard.startingPrice} ETH
                            </p>
                            :
                            <p className="text-zinc-200 font-bold">
                                Highest bid: {auctionedCard.highestBid} ETH
                            </p>
                    }
                    {userAddress === auctionedCard.owner.toLowerCase() ? 
                        (auctionedCard.highestBid === 0 ? 
                            <Button 
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => actions.cancelAuction(tokenID)}
                            >
                                <X/>
                                Cancel Auction
                            </Button>
                            :
                            (timeLeft === "Auction Ended" && (
                                <Button 
                                    className="bg-teal-600 hover:bg-teal-700"
                                    onClick={() => actions.finalizeAuction(tokenID)}
                                >
                                    <Gavel/>
                                    Finalise Auction
                                </Button>
                            ))
                        )
                        :
                        <>
                            <Input 
                                className="text-zinc-400 bg-zinc-800 border-zinc-700 w-48" 
                                placeholder="0" 
                                value={bidAmount} 
                                onChange={(e) => setBidAmount(Number(e.target.value))}
                            />
                            <Button 
                                className="bg-teal-600 hover:bg-teal-700"
                                onClick={() => actions.placeBid(tokenID, BigInt(bidAmount))}
                            >
                                <FaEthereum/>
                                Bid {bidAmount} ETH
                            </Button>
                        </>
                    }
                    <p className="text-zinc-200 font-bold">
                        Time Remaining: {timeLeft}
                    </p>
                </div>
            );
        }
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
                                <SelectItem value={"3600"}>1 hour</SelectItem>
                                <SelectItem value="28800">8 hours</SelectItem>
                                <SelectItem value="86400">1 day</SelectItem>
                                <SelectItem value="604800">1 week</SelectItem>
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