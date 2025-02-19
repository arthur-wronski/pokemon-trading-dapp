import { FilterStore } from '@/interfaces/zustand.interfaces'
import { create } from 'zustand'

const useFilterStore = create<FilterStore>((set) => ({
  searchName: "",
  setSearchName: (name) => set({ searchName: name }),

  selectedType: "All",
  setSelectedType: (type) => set({selectedType: type}),

  hpRange: {min: "", max: ""},
  setHpRange: (hpRange) => set({hpRange}),

  rarity: "All",
  setRarity: (rarity) => set({rarity}),
}))

export default useFilterStore