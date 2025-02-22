# NFT Marketplace

A decentralized NFT marketplace for Pokemon-inspired trading cards built with Next.js and Hardhat. Features include card minting, marketplace listings, auctions, and real-time updates using smart contract events.

## Architecture Overview

This project combines modern web technologies with blockchain development:

- **Smart Contracts**: Built and tested using Hardhat, managing NFT minting, marketplace listings, and auctions
- **Frontend**: Next.js application with TypeScript for type safety
- **State Management**: Zustand for efficient state handling
- **Storage**: IPFS (via Pinata) for decentralized metadata storage, reducing on-chain storage costs
- **Real-time Updates**: Event listeners for dynamic UI updates reflecting blockchain state changes

## Features

### Minting Page (Contract Owner Only)
- Form for creating new Pokemon cards with metadata:
  - Name, HP, Type, Attack Name, Attack Damage
  - Image URL and Rarity
- Automatic IPFS metadata upload via Pinata
- Transaction signing prompt for minting
<img width="1470" alt="Screenshot 2025-02-20 at 16 28 11" src="https://github.com/user-attachments/assets/97be3e54-b16f-455b-b246-a7b5b10d6a16" />

### Collection Page
- Display user's owned cards
- Advanced filtering system (name, rarity, type, HP)
- Card interaction modal with metadata display
- Listing and auction management options
<img width="1470" alt="Screenshot 2025-02-20 at 16 31 00" src="https://github.com/user-attachments/assets/84fab4e5-0b52-49eb-b33e-f7efa6eda958" />
<img width="1470" alt="Screenshot 2025-02-20 at 16 31 30" src="https://github.com/user-attachments/assets/28cfca02-ebf0-4ca2-920b-ef07523342df" />

### Marketplace Page
- Browse all listed cards
- Comprehensive filtering system
- Buy/bid functionality
- Real-time updates for market changes
<img width="1470" alt="Screenshot 2025-02-20 at 16 31 50" src="https://github.com/user-attachments/assets/07c4f6da-9849-44e6-b9fa-bdc9c040a576" />

## Prerequisites

- Node.js (latest LTS version recommended)
- MetaMask browser extension
- Pinata account for IPFS integration

## Setup Instructions

### Smart Contracts (Hardhat)

1. Navigate to the Hardhat directory:
```bash
cd hardhat
```

2. Install the local dependencies (make sure you have node installed!):
```bash
npm install
```

3. Start local Hardhat node (make sure to copy the private key of the first wallet for later):
```bash
npx hardhat node
```

4. In a new terminal, compile contracts:
```bash
npx hardhat compile
```

5. Deploy contracts:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

6. (Optional) Run tests on the smart contracts:
```bash
npx hardhat test
```

### MetaMask Configuration

1. Add localhost network to MetaMask:
   - Network Name: Localhost
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 1337
   - Currency Symbol: ETH

2. Import the first account from Hardhat node (this will be the contract owner):
   - Copy the private key of the first account shown when running `npx hardhat node`
   - Import into MetaMask using the private key

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Create a `.env` file with the following variables:
```env
PINATA_JWT=your_pinata_jwt
NEXT_PUBLIC_GATEWAY_URL=your_gateway_url
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=deployed_nft_contract_address
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=deployed_marketplace_address
```

For Pinata credentials, refer to the [Pinata Documentation](https://docs.pinata.cloud/) to create an account and obtain your JWT.

3. Install dependencies and start the development server:
```bash
npm install
npm run dev
```

4. Open http://localhost:3000 in your browser

## Usage

1. Connect your MetaMask wallet using the connect button
2. If you're the contract owner (first Hardhat account), you'll have access to the minting page
3. Mint cards, list them on the marketplace, or participate in auctions
4. Use the filtering system to find specific cards
5. All marketplace activities will update in real-time thanks to blockchain event listeners

## Technical Features

- **TypeScript Integration**: Ensures type safety throughout the application
- **Custom Hooks**: Manages smart contract interactions and event listening
- **Real-time Updates**: Event listeners eliminate the need for manual refreshing
- **IPFS Integration**: Efficient metadata storage solution
- **Modular Architecture**: Separate concerns between smart contracts and frontend
