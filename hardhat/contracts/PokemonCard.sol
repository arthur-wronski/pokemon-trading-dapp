// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PokemonCard is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    constructor() ERC721("PokemonCard", "PKMN") Ownable(msg.sender) {}

    function mintPokemonCard(
        address to,
        string memory url
    ) public onlyOwner {
        uint256 tokenId = totalSupply();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, url);
    }

    // The main function you need - gets all cards owned by an address
    function getAllCardsOfOwner(address owner) public view returns (uint256[] memory tokenIds, string[] memory tokenURIs) {
        uint256 balance = balanceOf(owner);
        tokenIds = new uint256[](balance);
        tokenURIs = new string[](balance);
        
        for(uint256 i = 0; i < balance; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
            tokenURIs[i] = tokenURI(tokenIds[i]);
        }
        
        return (tokenIds, tokenURIs);
    }

    // Required overrides
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}