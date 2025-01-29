import { useState, useEffect, useRef } from 'react';
import { ethers, JsonRpcProvider } from 'ethers';
import PokemonCardABI from "../../../hardhat/artifacts/contracts/PokemonCard.sol/PokemonCard.json"; 
import { PokemonMetadata } from '@/types/types';

export const useFetchOwnedCards = (provider: JsonRpcProvider, contractAddress: string, userAddress: string, pinataGateway: string) => {
  const [cards, setCards] = useState<PokemonMetadata[]>([]);
  const [loading, setLoading] = useState(true);

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
    const fetchOwnedCards = async () => {
      if (!providerRef.current || !userAddressRef.current || !contractAddressRef.current) return;

      try {
        const signer = await providerRef.current.getSigner();
        const contract = new ethers.Contract(contractAddressRef.current, PokemonCardABI.abi, signer);

        const [tokenIds, tokenURIs] = await contract.getAllCardsOfOwner(userAddressRef.current);
        console.log(tokenIds)

        const metadataPromises = tokenURIs.map(async (uri: string) => {
          try {
            const ipfsURL = uri.replace('ipfs://', pinataGatewayRef.current);
            const response = await fetch(ipfsURL);
            const metadata = await response.json();
            console.log(metadata)
            return metadata as PokemonMetadata;
          } catch (error) {
            console.error('Error fetching metadata from IPFS:', error);
            return null;
          }
        });

        const fetchedMetadata = await Promise.all(metadataPromises);

        setCards(fetchedMetadata);
      } catch (error) {
        console.error('Error fetching owned cards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnedCards();
  }, []);

  return { cards, loading };
};
