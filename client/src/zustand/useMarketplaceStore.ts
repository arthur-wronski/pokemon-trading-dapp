import { MarketplaceStore } from '@/interfaces/zustand.interfaces'
import { create } from 'zustand'

const useMarketplaceStore = create<MarketplaceStore>((set) => ({
  contractAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",

  listedCards: {},
  setListedCards: (listedCards) => set({ listedCards }),
  
}))

export default useMarketplaceStore