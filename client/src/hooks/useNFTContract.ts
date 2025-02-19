import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import PokemonCardABI from "../../../hardhat/artifacts/contracts/PokemonCard.sol/PokemonCard.json"; 
import { PokemonCard, PokemonMetadata } from '@/types/types';
import useWalletStore from '@/zustand/useWalletStore';

export const useNFTContract = () => {
  const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; 
  const userAddress = useWalletStore((state) => state.userAddress)
  const provider = useWalletStore((state) => state.provider)
  const pinataGateway = process.env.NEXT_PUBLIC_GATEWAY_URL as string;
  const [cards, setCards] = useState<{[tokenID: number]: PokemonCard}>({});
  const [loading, setLoading] = useState(true);
  const contractRef = useRef<ethers.Contract | null>(null);

  const providerRef = useRef(provider);
  const contractAddressRef = useRef(contractAddress);
  const userAddressRef = useRef(userAddress);
  const pinataGatewayRef = useRef(pinataGateway);

  const fetchMetadatas = async(tokenURIs: string[]) => {
    const metadataPromises = tokenURIs.map(async (uri: string) => {
      try {
        const ipfsURL = uri.replace('ipfs://', pinataGatewayRef.current);
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
    providerRef.current = provider;
    contractAddressRef.current = contractAddress;
    userAddressRef.current = userAddress;
    pinataGatewayRef.current = pinataGateway;
  }, [provider, contractAddress, userAddress, pinataGateway]);

  useEffect(() => {
    const initializeContractAndFetch = async () => {
      if (!providerRef.current || !userAddressRef.current || !contractAddressRef.current) return;

      try {
        const signer = await providerRef.current.getSigner();
        contractRef.current = new ethers.Contract(
          contractAddressRef.current, 
          PokemonCardABI.abi, 
          signer
        );

        contractRef.current.on("PokemonCardMinted", async (to: string, tokenId: bigint, tokenURI: string) => {
          console.log("I am listening bro: ", to, tokenId, tokenURI)
          if (to.toLowerCase() === userAddressRef.current.toLowerCase()) {
            try {
              const ipfsURL = tokenURI.replace('ipfs://', pinataGatewayRef.current);
              const response = await fetch(ipfsURL);
              const metadata = await response.json() as PokemonMetadata;
              
              setCards(prevCards => ({
                ...prevCards,
                [Number(tokenId)]: {metadata, owner: to}
              }));
              console.log("listened metadata: ", metadata)
            } catch (error) {
              console.error('Error fetching metadata for new card:', error);
            }
          }
        });

        // Fetch initial cards
        const [tokenIds, tokenURIs] = await contractRef.current.getAllCardsOfOwner(userAddressRef.current);

        const fetchedMetadata = await fetchMetadatas(tokenURIs)

        const cardsDict: {[tokenID: number]: PokemonCard} = {};
        tokenIds.forEach((tokenId: bigint, index: number) => {
          if (fetchedMetadata[index]) {
            cardsDict[Number(tokenId)] = {metadata: fetchedMetadata[index], owner: userAddress};
          }
        });

        setCards(cardsDict);
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
  }, []);

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

  return { cards, loading, approveToken, fetchMetadatas, getTokenURIs };
};