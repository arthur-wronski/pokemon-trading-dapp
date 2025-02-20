import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import PokemonMarketplaceABI from "../../../hardhat/artifacts/contracts/PokemonMarketplace.sol/PokemonMarketplace.json";
import { useNFTContract } from "@/hooks/useNFTContract";
import { toast } from "@/hooks/use-toast";
import useMarketplaceStore from "@/zustand/useMarketplaceStore";
import useUserStore from "@/zustand/useUserStore";
import { PokemonMetadata } from "@/types/types";

export const useMarketplace = () => {
  const contractAddress = useMarketplaceStore((state) => state.contractAddress);
  const provider = useUserStore((state) => state.provider);

  const marketplaceCards = useMarketplaceStore(
    (state) => state.marketplaceCards
  );
  const setMarketplaceCards = useMarketplaceStore(
    (state) => state.setMarketplaceCards
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contractRef = useRef<ethers.Contract | null>(null);

  const { approveToken, fetchMetadatas, getTokenURIs } = useNFTContract();

  // Initialize contract
  useEffect(() => {
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
        setError("Failed to initialize marketplace contract");
        console.error(err);
      }
    };

    initializeContract();
  }, []);

  const setupEventListeners = () => {
    if (!contractRef.current) return;

    contractRef.current.on(
      "CardListed",
      async (tokenId: bigint, seller: string, price: bigint) => {
        const listedCardURI = await getTokenURIs([Number(tokenId)]);
        const listedCardMetadata = await fetchMetadatas(listedCardURI) as PokemonMetadata[];
        setMarketplaceCards(
            {...marketplaceCards,
              [Number(tokenId)]: {metadata: listedCardMetadata[0], price: Number(price), owner: seller} 
            }
        )
      }
    );

    contractRef.current.on("CardUnlisted", (tokenId: bigint) => {
      const newMarketplaceCards = marketplaceCards
      delete newMarketplaceCards[Number(tokenId)]
      setMarketplaceCards(newMarketplaceCards)
    });

    contractRef.current.on(
      "CardSold",
      (tokenId: bigint, seller: string, buyer: string, price: bigint) => {
        fetchMarketplaceState();
      }
    );

    contractRef.current.on(
      "AuctionStarted",
      (
        tokenId: bigint,
        seller: string,
        startingPrice: bigint,
        endTime: bigint
      ) => {
        fetchMarketplaceState();
      }
    );

    contractRef.current.on(
      "AuctionBid",
      (tokenId: bigint, bidder: string, bid: bigint) => {
        fetchMarketplaceState();
      }
    );

    contractRef.current.on(
      "AuctionEnded",
      (tokenId: bigint, winner: string, winningBid: bigint) => {
        fetchMarketplaceState();
      }
    );
  };

  const fetchMarketplaceState = async () => {
    if (!contractRef.current) return;

    try {
      setLoading(true);

      // Fetch all listed and auctioned token IDs
      const listedTokenIds = await contractRef.current.getAllListedTokens();
      const listedTokenURIs = await getTokenURIs(listedTokenIds);
      const listedCardsMetadata = await fetchMetadatas(listedTokenURIs);
      const listingsDetails = await contractRef.current.getListingsDetails(
        Array.from(listedTokenIds)
      );

      listedTokenIds.forEach((tokenId: bigint, index: number) => {
        if (listedCardsMetadata[index]) {
          marketplaceCards[Number(tokenId)] = {
            metadata: listedCardsMetadata[index],
            owner: listingsDetails[0][index],
            price: Number(listingsDetails[1][index]),
          };
        }
      });

      const auctionedTokenIds =
        await contractRef.current.getAllAuctionedTokens();
      const auctionTokenURIs = await getTokenURIs(auctionedTokenIds);
      const auctionCardsMetadata = await fetchMetadatas(auctionTokenURIs);
      const auctionsDetails = await contractRef.current.getAuctionsDetails(
        Array.from(auctionedTokenIds)
      );

      auctionedTokenIds.forEach((tokenId: bigint, index: number) => {
        if (auctionCardsMetadata[index]) {
          marketplaceCards[Number(tokenId)] = {
            metadata: auctionCardsMetadata[index],
            owner: auctionsDetails[0][index],
            startingPrice: Number(auctionsDetails[1][index]),
            highestBid: Number(auctionsDetails[2][index]),
            highestBidder: auctionsDetails[3][index],
            endTime: auctionsDetails[4][index],
          };
        }
      });

      console.log("marketplace cards: ", marketplaceCards);

      setMarketplaceCards(marketplaceCards);
    } catch (err) {
      setError("Failed to fetch marketplace state");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Marketplace Actions
  const listCard = async (tokenId: number, price: bigint) => {
    if (!contractRef.current) return;
    try {
      // Use approveTokenRef instead of direct function call
      await approveToken(tokenId, contractAddress);

      const tx = await contractRef.current.listCard(tokenId, price);
      await tx.wait();
      toast({
        description: "Card listed successfully",
      });
    } catch (err) {
      setError("Failed to list card");
      console.error(err);
    }
  };

  const cancelListing = async (tokenId: number) => {
    if (!contractRef.current) return;
    try {
      const tx = await contractRef.current.cancelListing(tokenId);
      await tx.wait();
      toast({
        description: "Card unlisted succesfully",
      });
    } catch (err) {
      setError("Failed to cancel listing");
      console.error(err);
    }
  };

  const buyCard = async (tokenId: number, price: bigint) => {
    if (!contractRef.current) return;
    try {
      const tx = await contractRef.current.buyCard(tokenId, { value: price });
      await tx.wait();
      toast({
        description: "Card bought succesfully",
      });
    } catch (err) {
      setError("Failed to buy card");
      console.error(err);
    }
  };

  const startAuction = async (
    tokenId: number,
    startingPrice: bigint,
    duration: bigint
  ) => {
    if (!contractRef.current) return;
    try {
      const tx = await contractRef.current.startAuction(
        tokenId,
        startingPrice,
        duration
      );
      await tx.wait();
      toast({
        description: "Card auctioned succesfully",
      });
    } catch (err) {
      setError("Failed to start auction");
      console.error(err);
    }
  };

  const placeBid = async (tokenId: number, bidAmount: bigint) => {
    if (!contractRef.current) return;
    try {
      const tx = await contractRef.current.placeBid(tokenId, {
        value: bidAmount,
      });
      await tx.wait();
      toast({
        description: "Bid placed succesfully",
      });
    } catch (err) {
      setError("Failed to place bid");
      console.error(err);
    }
  };

  const finalizeAuction = async (tokenId: number) => {
    if (!contractRef.current) return;
    try {
      const tx = await contractRef.current.finalizeAuction(tokenId);
      await tx.wait();
      toast({
        description: "Auction finalised",
      });
    } catch (err) {
      setError("Failed to finalize auction");
      console.error(err);
    }
  };

  const cancelAuction = async (tokenId: number) => {
    if (!contractRef.current) return;
    try {
      const tx = await contractRef.current.cancelAuction(tokenId);
      await tx.wait();
      toast({
        description: "Auction cancelled succesfully",
      });
    } catch (err) {
      setError("Failed to cancel auction");
      console.error(err);
    }
  };

  return {
    loading,
    error,
    actions: {
      listCard,
      cancelListing,
      buyCard,
      startAuction,
      placeBid,
      finalizeAuction,
      cancelAuction,
    },
  };
};
