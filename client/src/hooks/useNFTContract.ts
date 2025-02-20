import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import PokemonCardABI from "../../../hardhat/artifacts/contracts/PokemonCard.sol/PokemonCard.json"; 
import { PokemonCard, PokemonMetadata } from '@/types/types';
import useUserStore from '@/zustand/useUserStore';
import { toast } from './use-toast';

export const useNFTContract = () => {
  const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; 
  const userAddress = useUserStore((state) => state.userAddress)
  const provider = useUserStore((state) => state.provider)
  const pinataGateway = process.env.NEXT_PUBLIC_GATEWAY_URL as string;
  const myCards = useUserStore((state) => state.myCards)
  const setMyCards = useUserStore((state) => state.setMyCards)
  const [loading, setLoading] = useState(true);
  const contractRef = useRef<ethers.Contract | null>(null);

  const fetchMetadatas = async(tokenURIs: string[]) => {
    const metadataPromises = tokenURIs.map(async (uri: string) => {
      try {
        const ipfsURL = uri.replace('ipfs://', pinataGateway);
        const response = await fetch(ipfsURL);
        const metadata = await response.json();
        return metadata as PokemonMetadata;
      } catch (error) {
        console.error('Error fetching metadata from IPFS:', error);
        return null;
      }
    });
    return await Promise.all(metadataPromises);
  }

  const getTokenURIs = async(tokenIDs: number[]) => {
    const tokenURIs = tokenIDs.map(async (tokenId: number) => {
      try {
        if (!contractRef.current){return}
        const tokenURI = await contractRef.current.tokenURI(tokenId);
        return tokenURI;
      } catch (error) {
        console.error('Error fetching metadata from IPFS:', error);
        return null;
      }
    });
    return await Promise.all(tokenURIs);
  }

  useEffect(() => {
    const initializeContractAndFetch = async () => {
      if (!provider || !userAddress || !contractAddress) return;

      try {
        const signer = await provider.getSigner();
        contractRef.current = new ethers.Contract(
          contractAddress, 
          PokemonCardABI.abi, 
          signer
        );

        contractRef.current.on("PokemonCardMinted", async (to: string, tokenId: bigint, tokenURI: string) => {
          if (to.toLowerCase() === userAddress.toLowerCase()) {
            try {
              console.log('minting event listened')
              const ipfsURL = tokenURI.replace('ipfs://', pinataGateway);
              const response = await fetch(ipfsURL);
              const metadata = await response.json() as PokemonMetadata;
              
              setMyCards({
                ...myCards,
                [Number(tokenId)]: {metadata, owner: to}
              });
            } catch (error) {
              console.error('Error fetching metadata for new card:', error);
            }
          }
        });

        // Fetch initial cards
        const [tokenIds, tokenURIs] = await contractRef.current.getAllCardsOfOwner(userAddress);

        const fetchedMetadata = await fetchMetadatas(tokenURIs)

        const cardsDict: {[tokenID: number]: PokemonCard} = {};
        tokenIds.forEach((tokenId: bigint, index: number) => {
          if (fetchedMetadata[index]) {
            cardsDict[Number(tokenId)] = {metadata: fetchedMetadata[index], owner: userAddress};
          }
        });

        setMyCards(cardsDict);
      } catch (error) {
        console.error('Error fetching owned cards:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeContractAndFetch();

    // Cleanup function to remove event listener
    return () => {
      if (contractRef.current) {
        contractRef.current.removeAllListeners("PokemonCardMinted");
      }
    };
  }, [provider]);

  const approveToken = async (tokenId: number, approvedAddress: string) => {
    if (!contractRef.current) return;

    try {
      const tx = await contractRef.current.approve(approvedAddress, tokenId);
      await tx.wait(); // Wait for the transaction to be mined
      console.log(`Token ${tokenId} approved for ${approvedAddress}`);
    } catch (error) {
      console.error('Error approving token:', error);
    } finally {
    }
  };

  const mintCard = async (metadata: PokemonMetadata) => {
    try {
      if (!contractRef.current || !provider) return;

      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();
     
      const ipfsURL = await handleUploadToIPFS(metadata)
       
      const tx = await contractRef.current.mintPokemonCard(walletAddress, ipfsURL);

      await tx.wait();
      console.log("Card minted successfully:", tx);
      toast({
        description: "Card minted successfully",
      });
    } catch (err) {
      console.error("Error minting card:", err);
    }
  };

  const handleUploadToIPFS = async (metadata: PokemonMetadata) => {
    try {
      const response = await fetch("/api/upload-ipfs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
      });

      return await response.json()
      
    } catch (error) {
      console.error("Error uploading metadata to IPFS:", error);
    }
  }

  return { loading, approveToken, fetchMetadatas, getTokenURIs, mintCard };
};