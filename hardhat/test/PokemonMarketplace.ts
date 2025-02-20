import {
    loadFixture,
    time
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("PokemonMarketplace", function () {
    // Helper function to convert ether to wei
    const toWei = (value: number) => ethers.parseEther(value.toString());

    async function deployMarketplaceFixture() {
        // Get signers
        const [owner, seller, buyer, bidder1, bidder2] = await ethers.getSigners();

        // Deploy Pokemon Card contract first
        const PokemonCard = await ethers.getContractFactory("PokemonCard");
        const pokemonCard = await PokemonCard.deploy();

        // Deploy Marketplace contract
        const PokemonMarketplace = await ethers.getContractFactory("PokemonMarketplace");
        const marketplace = await PokemonMarketplace.deploy(await pokemonCard.getAddress());

        // Mint a card to the seller for testing
        await pokemonCard.mintPokemonCard(seller.address, "https://example.com/pokemon/1");
        await pokemonCard.mintPokemonCard(seller.address, "https://example.com/pokemon/2");

        return { 
            marketplace, 
            pokemonCard, 
            owner, 
            seller, 
            buyer, 
            bidder1, 
            bidder2 
        };
    }

    describe("Deployment", function () {
        it("Should set the correct Pokemon contract address", async function () {
            const { marketplace, pokemonCard } = await loadFixture(deployMarketplaceFixture);
            expect(await marketplace.pokemonContract()).to.equal(await pokemonCard.getAddress());
        });
    });

    describe("Listing", function () {
        it("Should allow owner to list a card", async function () {
            const { marketplace, pokemonCard, seller } = await loadFixture(deployMarketplaceFixture);
            const tokenId = 0;
            const price = toWei(1);

            // Approve marketplace to transfer the token
            await pokemonCard.connect(seller).approve(await marketplace.getAddress(), tokenId);

            // List the card
            await expect(marketplace.connect(seller).listCard(tokenId, price))
                .to.emit(marketplace, "CardListed")
                .withArgs(tokenId, seller.address, price);

            const listing = await marketplace.listings(tokenId);
            expect(listing.seller).to.equal(seller.address);
            expect(listing.price).to.equal(price);
            expect(listing.isActive).to.be.true;
        });

        it("Should not allow listing without approval", async function () {
            const { marketplace, seller } = await loadFixture(deployMarketplaceFixture);
            const tokenId = 0;
            const price = toWei(1);

            await expect(
                marketplace.connect(seller).listCard(tokenId, price)
            ).to.be.revertedWith("Marketplace not approved");
        });

        it("Should not allow listing at zero price", async function () {
            const { marketplace, pokemonCard, seller } = await loadFixture(deployMarketplaceFixture);
            const tokenId = 0;

            await pokemonCard.connect(seller).approve(await marketplace.getAddress(), tokenId);

            await expect(
                marketplace.connect(seller).listCard(tokenId, 0)
            ).to.be.revertedWith("Price must be greater than 0");
        });
    });

    describe("Buying", function () {
        it("Should allow buyer to purchase a listed card", async function () {
            const { marketplace, pokemonCard, seller, buyer } = await loadFixture(deployMarketplaceFixture);
            const tokenId = 0;
            const price = toWei(1);

            // List the card
            await pokemonCard.connect(seller).approve(await marketplace.getAddress(), tokenId);
            await marketplace.connect(seller).listCard(tokenId, price);

            // Buy the card
            await expect(marketplace.connect(buyer).buyCard(tokenId, { value: price }))
                .to.emit(marketplace, "CardSold")
                .withArgs(tokenId, seller.address, buyer.address, price);

            // Check ownership transfer
            expect(await pokemonCard.ownerOf(tokenId)).to.equal(buyer.address);
        });

        it("Should not allow incorrect payment amount", async function () {
            const { marketplace, pokemonCard, seller, buyer } = await loadFixture(deployMarketplaceFixture);
            const tokenId = 0;
            const price = toWei(1);

            await pokemonCard.connect(seller).approve(await marketplace.getAddress(), tokenId);
            await marketplace.connect(seller).listCard(tokenId, price);

            await expect(
                marketplace.connect(buyer).buyCard(tokenId, { value: toWei(0.5) })
            ).to.be.revertedWith("Incorrect payment amount");
        });
    });

    describe("Auctions", function () {
        it("Should allow owner to start an auction", async function () {
            const { marketplace, pokemonCard, seller } = await loadFixture(deployMarketplaceFixture);
            const tokenId = 0;
            const startingPrice = toWei(1);
            const duration = 86400; // 1 day

            await pokemonCard.connect(seller).approve(await marketplace.getAddress(), tokenId);

            await expect(marketplace.connect(seller).startAuction(tokenId, startingPrice, duration))
                .to.emit(marketplace, "AuctionStarted")
                .withArgs(tokenId, seller.address, startingPrice, await time.latest() + duration);
        });

        it("Should allow valid bids", async function () {
            const { marketplace, pokemonCard, seller, bidder1 } = await loadFixture(deployMarketplaceFixture);
            const tokenId = 0;
            const startingPrice = toWei(1);
            const bidAmount = toWei(1.5);
            const duration = 86400;

            await pokemonCard.connect(seller).approve(await marketplace.getAddress(), tokenId);
            await marketplace.connect(seller).startAuction(tokenId, startingPrice, duration);

            await expect(marketplace.connect(bidder1).placeBid(tokenId, { value: bidAmount }))
                .to.emit(marketplace, "AuctionBid")
                .withArgs(tokenId, bidder1.address, bidAmount);
        });

        it("Should refund previous bidder when outbid", async function () {
            const { marketplace, pokemonCard, seller, bidder1, bidder2 } = await loadFixture(deployMarketplaceFixture);
            const tokenId = 0;
            const startingPrice = toWei(1);
            const firstBid = toWei(1.5);
            const secondBid = toWei(2);
            const duration = 86400;

            await pokemonCard.connect(seller).approve(await marketplace.getAddress(), tokenId);
            await marketplace.connect(seller).startAuction(tokenId, startingPrice, duration);

            await marketplace.connect(bidder1).placeBid(tokenId, { value: firstBid });
            
            const bidder1BalanceBefore = await ethers.provider.getBalance(bidder1.address);
            await marketplace.connect(bidder2).placeBid(tokenId, { value: secondBid });
            const bidder1BalanceAfter = await ethers.provider.getBalance(bidder1.address);

            // Check that bidder1 was refunded
            expect(bidder1BalanceAfter - bidder1BalanceBefore).to.be.closeTo(firstBid, toWei(0.01));
        });

        it("Should allow finalizing auction after end time", async function () {
            const { marketplace, pokemonCard, seller, bidder1 } = await loadFixture(deployMarketplaceFixture);
            const tokenId = 0;
            const startingPrice = toWei(1);
            const bidAmount = toWei(1.5);
            const duration = 86400;

            await pokemonCard.connect(seller).approve(await marketplace.getAddress(), tokenId);
            await marketplace.connect(seller).startAuction(tokenId, startingPrice, duration);
            await marketplace.connect(bidder1).placeBid(tokenId, { value: bidAmount });

            // Fast forward time
            await time.increase(duration + 1);

            await expect(marketplace.connect(seller).finalizeAuction(tokenId))
                .to.emit(marketplace, "AuctionEnded")
                .withArgs(tokenId, bidder1.address, bidAmount);

            // Check ownership transfer
            expect(await pokemonCard.ownerOf(tokenId)).to.equal(bidder1.address);
        });
    });

    describe("View Functions", function () {
        it("Should return correct listed tokens", async function () {
            const { marketplace, pokemonCard, seller } = await loadFixture(deployMarketplaceFixture);
            const tokenId = 0;
            const price = toWei(1);

            await pokemonCard.connect(seller).approve(await marketplace.getAddress(), tokenId);
            await marketplace.connect(seller).listCard(tokenId, price);

            const listedTokens = await marketplace.getAllListedTokens();
            expect(listedTokens).to.deep.equal([BigInt(tokenId)]);
        });

        it("Should return correct listing details", async function () {
            const { marketplace, pokemonCard, seller } = await loadFixture(deployMarketplaceFixture);
            const tokenIds = [0, 1];
            const price = toWei(1);

            // List both tokens
            for (const tokenId of tokenIds) {
                await pokemonCard.connect(seller).approve(await marketplace.getAddress(), tokenId);
                await marketplace.connect(seller).listCard(tokenId, price);
            }

            const [sellers, prices, isActive] = await marketplace.getListingsDetails(tokenIds);
            
            expect(sellers).to.deep.equal([seller.address, seller.address]);
            expect(prices).to.deep.equal([price, price]);
            expect(isActive).to.deep.equal([true, true]);
        });
    });
});