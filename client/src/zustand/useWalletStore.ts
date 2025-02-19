import { WalletStore } from '@/interfaces/zustand.interfaces'
import { ethers } from 'ethers'
import { create } from 'zustand'

const useWalletStore = create<WalletStore>(() => ({
  provider: new ethers.JsonRpcProvider(),  
  userAddress: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
}))

export default useWalletStore