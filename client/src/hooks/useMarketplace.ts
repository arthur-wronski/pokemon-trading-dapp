import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import PokemonMarketplaceABI from "../../../hardhat/artifacts/contracts/PokemonMarketplace.sol/PokemonMarketplace.json";
import { ListedCard, PokemonCard, PokemonMetadata } from '@/types/types';
import { useNFTContract } from '@/hooks/useNFTContract';
import { toast } from '@/hooks/use-toast';
import useMarketplaceStore from '@/zustand/useMarketplaceStore';
import useWalletStore from '@/zustand/useWalletStore';
import ListingDetails from '@/components/tabs/ListingDetails';

interface ListingInfo {
    seller: string;
    price: bigint;
    isActive: boolean;
}

interface AuctionInfo {
    seller: string;
    startingPrice: bigint;
    highestBid: bigint;
    highestBidder: string;
    endTime: bigint;
    isActive: boolean;
}

interface MarketplaceCard {
    tokenId: number;
    metadata: PokemonMetadata;
    listing?: ListingInfo;
    auction?: AuctionInfo;
}

export const useMarketplace = () => {
    const contractAddress = useMarketplaceStore((state) => state.contractAddress);
    const provider = useWalletStore((state) => state.provider);

    const listedCards = useMarketplaceStore((state) => state.listedCards)
    const setListedCards = useMarketplaceStore((state) => state.setListedCards)

    const [auctionedCards, setAuctionedCards] = useState<MarketplaceCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const contractRef = useRef<ethers.Contract | null>(null);

    // Use ref to store approveToken function
    const approveTokenRef = useRef<any>(null);

    const { approveToken, fetchMetadatas, getTokenURIs } = useNFTContract()

    // Initialize contract
    useEffect(() => {
        // Store approveToken in the ref once when the component mounts
        approveTokenRef.current = approveToken;

        const initializeContract = async () => {
            if (!provider || !contractAddress) return;

            try {
                const signer = await provider.getSigner();
                contractRef.current = new ethers.Contract(
                    contractAddress,
                    PokemonMarketplaceABI.abi,
                    signer
                );

                // Set up event listeners
                setupEventListeners();

                // Fetch initial marketplace state
                await fetchMarketplaceState();
            } catch (err) {
                setError('Failed to initialize marketplace contract');
                console.error(err);
            }
        };

        initializeContract();
    }, []);

    const setupEventListeners = () => {
        if (!contractRef.current) return;

        contractRef.current.on("CardListed",
            (tokenId: bigint, seller: string, price: bigint) => {
                fetchMarketplaceState();
            });

        contractRef.current.on("CardUnlisted", (tokenId: bigint) => {
            fetchMarketplaceState();
        });

        contractRef.current.on("CardSold",
            (tokenId: bigint, seller: string, buyer: string, price: bigint) => {
                fetchMarketplaceState();
            });

        contractRef.current.on("AuctionStarted",
            (tokenId: bigint, seller: string, startingPrice: bigint, endTime: bigint) => {
                fetchMarketplaceState();
            });

        contractRef.current.on("AuctionBid",
            (tokenId: bigint, bidder: string, bid: bigint) => {
                fetchMarketplaceState();
            });

        contractRef.current.on("AuctionEnded",
            (tokenId: bigint, winner: string, winningBid: bigint) => {
                fetchMarketplaceState();
            });
    };

    const fetchMarketplaceState = async () => {
        if (!contractRef.current) return;

        try {
            setLoading(true);

            // Fetch all listed and auctioned token IDs
            const listedTokenIds = await contractRef.current.getAllListedTokens();
            console.log(listedTokenIds)
            const tokenURIs = await getTokenURIs(listedTokenIds)
            const listedCardsMetadata = await fetchMetadatas(
                tokenURIs
            );
            const listingsDetails = await contractRef.current.getListingsDetails([0]);
            console.log(" listing details: ", listingsDetails[0])
            console.log(" listing details: ", listingsDetails[1])


            const cardsDict: {[tokenID: number]: ListedCard} = {};
            listedTokenIds.forEach((tokenId: bigint, index: number) => {
                if (listedCardsMetadata[index]) {
                    cardsDict[Number(tokenId)] = {
                        metadata: listedCardsMetadata[index],
                        owner: listingsDetails[0][index],
                        price: listingsDetails[1][index],
                    }
                }
            });
            // console.log(cardsDict)
            // const auctionedTokenIds = await contractRef.current.getAllAuctionedTokens();

            // Fetch listings details
            // const listingsDetails = await contractRef.current.getListingsDetails(listedTokenIds);

            // Fetch auctions details
            // const auctionsDetails = await contractRef.current.getAuctionsDetails(auctionedTokenIds);

            // const fetchedAuctionedCards = await Promise.all(
            //     auctionedTokenIds.map(async (tokenId: bigint, index: number) => {
            //         const metadata = await fetchMetadata(tokenId);
            //         console.log(metadata)
            //         return {
            //             tokenId: Number(tokenId),
            //             metadata,
            //             auction: {
            //                 seller: auctionsDetails[0][index],
            //                 startingPrice: auctionsDetails[1][index],
            //                 highestBid: auctionsDetails[2][index],
            //                 highestBidder: auctionsDetails[3][index],
            //                 isActive: auctionsDetails[4][index]
            //             }
            //         };
            //     })
            // );

            setListedCards(cardsDict);
            // setAuctionedCards(fetchedAuctionedCards);
        } catch (err) {
            setError('Failed to fetch marketplace state');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Marketplace Actions
    const listCard = async (tokenId: number, price: bigint) => {
        if (!contractRef.current || !approveTokenRef.current) return;
        try {
            // Use approveTokenRef instead of direct function call
            await approveTokenRef.current(tokenId, contractAddress);

            const tx = await contractRef.current.listCard(tokenId, price);
            await tx.wait();
            // await fetchMarketplaceState();
            toast({
                description: "Card listed successfully",
            })
        } catch (err) {
            setError('Failed to list card');
            console.error(err);
        }
    };

    const cancelListing = async (tokenId: number) => {
        if (!contractRef.current) return;
        try {
            const tx = await contractRef.current.cancelListing(tokenId);
            await tx.wait();
            await fetchMarketplaceState();
            toast({
                description: "Card unlisted succesfully",
            })
        } catch (err) {
            setError('Failed to cancel listing');
            console.error(err);
        }
    };

    const buyCard = async (tokenId: number, price: bigint) => {
        if (!contractRef.current) return;
        try {
            const tx = await contractRef.current.buyCard(tokenId, { value: price });
            await tx.wait();
            await fetchMarketplaceState();
        } catch (err) {
            setError('Failed to buy card');
            console.error(err);
        }
    };

    const startAuction = async (tokenId: number, startingPrice: bigint) => {
        if (!contractRef.current) return;
        try {
            const tx = await contractRef.current.startAuction(tokenId, startingPrice);
            await tx.wait();
            await fetchMarketplaceState();
        } catch (err) {
            setError('Failed to start auction');
            console.error(err);
        }
    };

    const placeBid = async (tokenId: number, bidAmount: bigint) => {
        if (!contractRef.current) return;
        try {
            const tx = await contractRef.current.placeBid(tokenId, { value: bidAmount });
            await tx.wait();
            await fetchMarketplaceState();
        } catch (err) {
            setError('Failed to place bid');
            console.error(err);
        }
    };

    const finalizeAuction = async (tokenId: number) => {
        if (!contractRef.current) return;
        try {
            const tx = await contractRef.current.finalizeAuction(tokenId);
            await tx.wait();
            await fetchMarketplaceState();
        } catch (err) {
            setError('Failed to finalize auction');
            console.error(err);
        }
    };

    const cancelAuction = async (tokenId: number) => {
        if (!contractRef.current) return;
        try {
            const tx = await contractRef.current.cancelAuction(tokenId);
            await tx.wait();
            await fetchMarketplaceState();
        } catch (err) {
            setError('Failed to cancel auction');
            console.error(err);
        }
    };

    useEffect(() => {
        return () => {
            if (contractRef.current) {
                contractRef.current.removeAllListeners();
            }
        };
    }, []);

    return {
        listedCards,
        auctionedCards,
        loading,
        error,
        actions: {
            listCard,
            cancelListing,
            buyCard,
            startAuction,
            placeBid,
            finalizeAuction,
            cancelAuction
        }
    };
};
