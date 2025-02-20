import { MarketplaceStore } from '@/interfaces/zustand.interfaces'
import { create } from 'zustand'

const useMarketplaceStore = create<MarketplaceStore>((set) => ({
  contractAddress: process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS as string,
  
  marketplaceCards: {},
  setMarketplaceCards: (marketplaceCards) => set({ marketplaceCards })
}))

export default useMarketplaceStore