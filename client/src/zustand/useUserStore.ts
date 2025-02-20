import { UserStore } from '@/interfaces/zustand.interfaces'
import { create } from 'zustand'

const useUserStore = create<UserStore>((set) => ({
  provider: null,  
  setProvider: (provider) => set({ provider }),

  userAddress: null,
  setUserAddress: (userAddress) => set({ userAddress }),

  myCards : {},
  setMyCards: (myCards) => set({myCards}),
}))

export default useUserStore