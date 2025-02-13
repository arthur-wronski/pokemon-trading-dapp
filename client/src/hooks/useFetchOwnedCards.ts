import { useState, useEffect, useRef } from 'react';
import { ethers, JsonRpcProvider } from 'ethers';
import PokemonCardABI from "../../../hardhat/artifacts/contracts/PokemonCard.sol/PokemonCard.json"; 
import { PokemonMetadata } from '@/types/types';

export const useFetchOwnedCards = (provider: JsonRpcProvider, contractAddress: string, userAddress: string, pinataGateway: string) => {
  const [cards, setCards] = useState<{[tokenID: number]: PokemonMetadata}>({});
  const [loading, setLoading] = useState(true);
  const contractRef = useRef<ethers.Contract | null>(null);

  const providerRef = useRef(provider);
  const contractAddressRef = useRef(contractAddress);
  const userAddressRef = useRef(userAddress);
  const pinataGatewayRef = useRef(pinataGateway);

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
                [Number(tokenId)]: metadata
              }));
              console.log("listened metadata: ", metadata)
            } catch (error) {
              console.error('Error fetching metadata for new card:', error);
            }
          }
        });

        // Fetch initial cards
        const [tokenIds, tokenURIs] = await contractRef.current.getAllCardsOfOwner(userAddressRef.current);

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

        const fetchedMetadata = await Promise.all(metadataPromises);

        const cardsDict: {[tokenID: number]: PokemonMetadata} = {};
        tokenIds.forEach((tokenId: bigint, index: number) => {
          if (fetchedMetadata[index]) {
            cardsDict[Number(tokenId)] = fetchedMetadata[index];
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

  return { cards, loading };
};