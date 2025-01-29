async function main() {
    // Get the contract to deploy
    const PokemonCard = await ethers.getContractFactory("PokemonCard");
    console.log("Deploying PokemonCard...");
  
    // Deploy the contract
    const pokemonCard = await PokemonCard.deploy();
  
    console.log("PokemonCard deployed to:", pokemonCard.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  