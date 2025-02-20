import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { expect } from "chai";
  import hre from "hardhat";
  
  describe("PokemonCard", function () {
    // Deploy the contract fixture
    async function deployPokemonCardFixture() {
      const [owner, otherAccount] = await hre.ethers.getSigners();
  
      // Deploy the contract
      const PokemonCard = await hre.ethers.getContractFactory("PokemonCard");
      const pokemonCard = await PokemonCard.deploy();
  
      return { pokemonCard, owner, otherAccount };
    }
  
    describe("Deployment", function () {
      it("Should deploy with the correct name and symbol", async function () {
        const { pokemonCard } = await loadFixture(deployPokemonCardFixture);
  
        expect(await pokemonCard.name()).to.equal("PokemonCard");
        expect(await pokemonCard.symbol()).to.equal("PKMN");
      });
  
      it("Should set the correct owner", async function () {
        const { pokemonCard, owner } = await loadFixture(deployPokemonCardFixture);
  
        expect(await pokemonCard.owner()).to.equal(owner.address);
      });
    });
  
    describe("Minting", function () {
      it("Should allow only the owner to mint a PokemonCard", async function () {
        const { pokemonCard, owner, otherAccount } = await loadFixture(deployPokemonCardFixture);
  
        const tokenURI = "https://example.com/pokemon/1";
  
        // Owner can mint
        await expect(pokemonCard.mintPokemonCard(owner.address, tokenURI))
          .to.emit(pokemonCard, "PokemonCardMinted")
          .withArgs(owner.address, 0, tokenURI);
  
        // Other account should fail to mint
        await expect(
          pokemonCard.connect(otherAccount).mintPokemonCard(otherAccount.address, tokenURI)
        ).to.be.revertedWithCustomError(pokemonCard, "OwnableUnauthorizedAccount")
        .withArgs(otherAccount.address)
      });
  
      it("Should mint a PokemonCard and set the correct tokenURI", async function () {
        const { pokemonCard, owner } = await loadFixture(deployPokemonCardFixture);
  
        const tokenURI = "https://example.com/pokemon/1";
  
        await pokemonCard.mintPokemonCard(owner.address, tokenURI);
  
        const tokenId = 0; // First minted card has tokenId 0
        expect(await pokemonCard.tokenURI(tokenId)).to.equal(tokenURI);
      });
    });
  
    describe("Getting Cards of an Owner", function () {
      it("Should return the correct cards for an address", async function () {
        const { pokemonCard, owner } = await loadFixture(deployPokemonCardFixture);
  
        const tokenURI1 = "https://example.com/pokemon/1";
        const tokenURI2 = "https://example.com/pokemon/2";
  
        // Mint two cards to the owner
        await pokemonCard.mintPokemonCard(owner.address, tokenURI1);
        await pokemonCard.mintPokemonCard(owner.address, tokenURI2);
  
        // Get all cards of the owner
        const { tokenIds, tokenURIs } = await pokemonCard.getAllCardsOfOwner(owner.address);
  
        expect(tokenIds.length).to.equal(2);
        expect(tokenURIs.length).to.equal(2);
  
        expect(tokenIds[0]).to.equal(0);
        expect(tokenIds[1]).to.equal(1);
  
        expect(tokenURIs[0]).to.equal(tokenURI1);
        expect(tokenURIs[1]).to.equal(tokenURI2);
      });
  
      it("Should return empty arrays for an address with no cards", async function () {
        const { pokemonCard, otherAccount } = await loadFixture(deployPokemonCardFixture);
  
        const { tokenIds, tokenURIs } = await pokemonCard.getAllCardsOfOwner(otherAccount.address);
  
        expect(tokenIds.length).to.equal(0);
        expect(tokenURIs.length).to.equal(0);
      });
    });
  
    describe("Token Ownership", function () {
      it("Should transfer token ownership correctly", async function () {
        const { pokemonCard, owner, otherAccount } = await loadFixture(deployPokemonCardFixture);
  
        const tokenURI = "https://example.com/pokemon/1";
  
        // Mint a card to the owner
        await pokemonCard.mintPokemonCard(owner.address, tokenURI);
  
        // Transfer token from owner to other account
        const tokenId = 0;
        await pokemonCard.transferFrom(owner.address, otherAccount.address, tokenId);
  
        // Check that ownership has been transferred
        expect(await pokemonCard.ownerOf(tokenId)).to.equal(otherAccount.address);
      });
  
      it("Should revert on transfer if not owner", async function () {
        const { pokemonCard, owner, otherAccount } = await loadFixture(deployPokemonCardFixture);
  
        const tokenURI = "https://example.com/pokemon/1";
  
        // Mint a card to the owner
        await pokemonCard.mintPokemonCard(owner.address, tokenURI);
  
        // Try to transfer token from other account (should fail)
        const tokenId = 0;
        await expect(
          pokemonCard.connect(otherAccount).transferFrom(owner.address, otherAccount.address, tokenId)
        ).to.be.revertedWithCustomError(pokemonCard, "ERC721InsufficientApproval")
        .withArgs(otherAccount.address, tokenId)
      });
    });
  
    describe("Events", function () {
      it("Should emit the PokemonCardMinted event on mint", async function () {
        const { pokemonCard, owner } = await loadFixture(deployPokemonCardFixture);
  
        const tokenURI = "https://example.com/pokemon/1";
  
        await expect(pokemonCard.mintPokemonCard(owner.address, tokenURI))
          .to.emit(pokemonCard, "PokemonCardMinted")
          .withArgs(owner.address, 0, tokenURI);
      });
    });
  
    describe("Override Functions", function () {
      it("Should correctly call the supportsInterface method", async function () {
        const { pokemonCard } = await loadFixture(deployPokemonCardFixture);
  
        const ERC721InterfaceId = "0x80ac58cd"; // ERC721 interface id
        expect(await pokemonCard.supportsInterface(ERC721InterfaceId)).to.be.true;
      });
    });
  });
  