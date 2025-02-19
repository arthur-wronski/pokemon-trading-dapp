async function main() {
  // Get the contract factories
  const PokemonCard = await ethers.getContractFactory("PokemonCard");
  console.log("Deploying PokemonCard...");

  // Deploy PokemonCard
  const pokemonCard = await PokemonCard.deploy();
  await pokemonCard.waitForDeployment();  // Wait for deployment to be mined
  const pokemonCardAddress = await pokemonCard.getAddress();
  console.log("PokemonCard deployed to:", pokemonCardAddress);

  // Deploy Marketplace with PokemonCard address
  const PokemonMarketplace = await ethers.getContractFactory("PokemonMarketplace");
  console.log("Deploying PokemonMarketplace...");
  const pokemonMarketplace = await PokemonMarketplace.deploy(pokemonCardAddress);
  await pokemonMarketplace.waitForDeployment();  // Wait for deployment to be mined
  const marketplaceAddress = await pokemonMarketplace.getAddress();
  console.log("PokemonMarketplace deployed to:", marketplaceAddress);

  console.log("Deployment completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });