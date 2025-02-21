// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract PokemonMarketplace is ReentrancyGuard, Pausable, Ownable {
    IERC721 public immutable pokemonContract;
    
    struct Listing {
        address seller;
        uint256 price;
        bool isActive;
    }
    
    struct Auction {
        address seller;
        uint256 startingPrice;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        bool isActive;
    }
    
    // Mapping from tokenId to Listing
    mapping(uint256 => Listing) public listings;
    // Mapping from tokenId to Auction
    mapping(uint256 => Auction) public auctions;
    
    // Arrays to track all listed and auctioned tokenIds
    uint256[] private listedTokenIds;
    uint256[] private auctionedTokenIds;
    
    // Mapping to track array indices for efficient removal
    mapping(uint256 => uint256) private listedTokenIndex;
    mapping(uint256 => uint256) private auctionedTokenIndex;
    
    event CardListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event CardUnlisted(uint256 indexed tokenId);
    event CardSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event AuctionStarted(uint256 indexed tokenId, address indexed seller, uint256 startingPrice, uint256 endTime);
    event AuctionBid(uint256 indexed tokenId, address indexed bidder, uint256 bid);
    event AuctionEnded(uint256 indexed tokenId, address indexed winner, uint256 winningBid);
    event AuctionCancelled(uint256 indexed tokenId);
    
    constructor(address _pokemonContract) Ownable(msg.sender){
        pokemonContract = IERC721(_pokemonContract);
    }
    
    modifier onlyCardOwner(uint256 tokenId) {
        require(pokemonContract.ownerOf(tokenId) == msg.sender, "Not the card owner");
        _;
    }
    
    modifier notCurrentOwner(uint256 tokenId) {
        require(pokemonContract.ownerOf(tokenId) != msg.sender, "Current owner cannot participate");
        _;
    }
    
    modifier listingExists(uint256 tokenId) {
        require(listings[tokenId].isActive, "No active listing for this card");
        _;
    }
    
    modifier auctionExists(uint256 tokenId) {
        require(auctions[tokenId].isActive, "No active auction for this card");
        _;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Helper function to add token to listed array
    function _addToListedTokens(uint256 tokenId) private {
        listedTokenIndex[tokenId] = listedTokenIds.length;
        listedTokenIds.push(tokenId);
    }

    // Helper function to remove token from listed array
    function _removeFromListedTokens(uint256 tokenId) private {
        uint256 lastTokenIndex = listedTokenIds.length - 1;
        uint256 tokenIndex = listedTokenIndex[tokenId];

        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = listedTokenIds[lastTokenIndex];
            listedTokenIds[tokenIndex] = lastTokenId;
            listedTokenIndex[lastTokenId] = tokenIndex;
        }

        listedTokenIds.pop();
        delete listedTokenIndex[tokenId];
    }

    // Helper function to add token to auctioned array
    function _addToAuctionedTokens(uint256 tokenId) private {
        auctionedTokenIndex[tokenId] = auctionedTokenIds.length;
        auctionedTokenIds.push(tokenId);
    }

    // Helper function to remove token from auctioned array
    function _removeFromAuctionedTokens(uint256 tokenId) private {
        uint256 lastTokenIndex = auctionedTokenIds.length - 1;
        uint256 tokenIndex = auctionedTokenIndex[tokenId];

        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = auctionedTokenIds[lastTokenIndex];
            auctionedTokenIds[tokenIndex] = lastTokenId;
            auctionedTokenIndex[lastTokenId] = tokenIndex;
        }

        auctionedTokenIds.pop();
        delete auctionedTokenIndex[tokenId];
    }
    
    // Fixed Price Listing Functions
    function listCard(uint256 tokenId, uint256 price) external onlyCardOwner(tokenId) whenNotPaused{
        require(!listings[tokenId].isActive, "Card already listed");
        require(!auctions[tokenId].isActive, "Card is in auction");
        require(price > 0, "Price must be greater than 0");
        
        require(pokemonContract.getApproved(tokenId) == address(this), "Marketplace not approved");
        
        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            isActive: true
        });
        
        _addToListedTokens(tokenId);
        emit CardListed(tokenId, msg.sender, price);
    }
    
    function cancelListing(uint256 tokenId) external onlyCardOwner(tokenId) listingExists(tokenId) whenNotPaused{
        delete listings[tokenId];
        _removeFromListedTokens(tokenId);
        emit CardUnlisted(tokenId);
    }
    
    function buyCard(uint256 tokenId) external payable notCurrentOwner(tokenId) listingExists(tokenId) nonReentrant whenNotPaused{
        Listing memory listing = listings[tokenId];
        require(msg.value == listing.price, "Incorrect payment amount");
        
        address seller = listing.seller;
        delete listings[tokenId];
        _removeFromListedTokens(tokenId);
        
        (bool success, ) = payable(seller).call{value: msg.value}("");
        require(success, "Transfer to seller failed");
        
        pokemonContract.safeTransferFrom(seller, msg.sender, tokenId);
        
        emit CardSold(tokenId, seller, msg.sender, msg.value);
    }
    
    // Auction Functions
    function startAuction(
        uint256 tokenId,
        uint256 startingPrice,
        uint256 duration
    ) external onlyCardOwner(tokenId) whenNotPaused{
        require(!listings[tokenId].isActive, "Card is listed for sale");
        require(!auctions[tokenId].isActive, "Auction already exists");
        require(startingPrice > 0, "Starting price must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");
        
        require(pokemonContract.getApproved(tokenId) == address(this), "Marketplace not approved");
        
        auctions[tokenId] = Auction({
            seller: msg.sender,
            startingPrice: startingPrice,
            highestBid: 0,
            highestBidder: address(0),
            endTime: block.timestamp + duration,
            isActive: true
        });
        
        _addToAuctionedTokens(tokenId);
        emit AuctionStarted(tokenId, msg.sender, startingPrice, block.timestamp + duration);
    }
    
    function placeBid(uint256 tokenId) external payable notCurrentOwner(tokenId) auctionExists(tokenId) nonReentrant whenNotPaused{
        Auction storage auction = auctions[tokenId];
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value > auction.highestBid, "Bid too low");
        require(msg.value >= auction.startingPrice, "Bid below starting price");
        
        if (auction.highestBidder != address(0)) {
            (bool success, ) = payable(auction.highestBidder).call{value: auction.highestBid}("");
            require(success, "Refund to previous bidder failed");
        }
        
        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;
        
        emit AuctionBid(tokenId, msg.sender, msg.value);
    }
    
    function finalizeAuction(uint256 tokenId) external auctionExists(tokenId) nonReentrant whenNotPaused{
        Auction storage auction = auctions[tokenId];
        require(block.timestamp >= auction.endTime, "Auction not ended yet");
        // Allow only the seller or the highest bidder (if one exists) to finalize
        require(
            msg.sender == auction.seller || (auction.highestBidder != address(0) && msg.sender == auction.highestBidder),
            "Not authorized to finalize"
        );
        
        address winner = auction.highestBidder;
        uint256 winningBid = auction.highestBid;
        address seller = auction.seller;
        
        delete auctions[tokenId];
        _removeFromAuctionedTokens(tokenId);
        
        if (winner != address(0)) {
            (bool success, ) = payable(seller).call{value: winningBid}("");
            require(success, "Transfer to seller failed");
            
            pokemonContract.safeTransferFrom(seller, winner, tokenId);
            
            emit AuctionEnded(tokenId, winner, winningBid);
        } else {
            emit AuctionCancelled(tokenId);
        }
    }
    
    function cancelAuction(uint256 tokenId) external onlyCardOwner(tokenId) auctionExists(tokenId) whenNotPaused{
        Auction storage auction = auctions[tokenId];
        require(auction.highestBidder == address(0), "Cannot cancel auction with bids");
        
        delete auctions[tokenId];
        _removeFromAuctionedTokens(tokenId);
        emit AuctionCancelled(tokenId);
    }

    // View functions to get market status
    function getAllListedTokens() external view returns (uint256[] memory) {
        return listedTokenIds;
    }

    function getAllAuctionedTokens() external view returns (uint256[] memory) {
        return auctionedTokenIds;
    }

    function isTokenListed(uint256 tokenId) external view returns (bool) {
        return listings[tokenId].isActive;
    }

    function isTokenAuctioned(uint256 tokenId) external view returns (bool) {
        return auctions[tokenId].isActive;
    }

    // Get full listing details for multiple tokens
    function getListingsDetails(uint256[] calldata tokenIds) external view returns (
        address[] memory sellers,
        uint256[] memory prices,
        bool[] memory isActive
    ) {
        sellers = new address[](tokenIds.length);
        prices = new uint256[](tokenIds.length);
        isActive = new bool[](tokenIds.length);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            Listing memory listing = listings[tokenIds[i]];
            sellers[i] = listing.seller;
            prices[i] = listing.price;
            isActive[i] = listing.isActive;
        }

        return (sellers, prices, isActive);
    }

    // Get full auction details for multiple tokens
    function getAuctionsDetails(uint256[] calldata tokenIds) external view returns (
        address[] memory sellers,
        uint256[] memory startingPrices,
        uint256[] memory highestBids,
        address[] memory highestBidders,
        uint256[] memory endTimes,
        bool[] memory isActive
    ) {
        sellers = new address[](tokenIds.length);
        startingPrices = new uint256[](tokenIds.length);
        highestBids = new uint256[](tokenIds.length);
        highestBidders = new address[](tokenIds.length);
        endTimes = new uint256[](tokenIds.length);
        isActive = new bool[](tokenIds.length);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            Auction memory auction = auctions[tokenIds[i]];
            sellers[i] = auction.seller;
            startingPrices[i] = auction.startingPrice;
            highestBids[i] = auction.highestBid;
            highestBidders[i] = auction.highestBidder;
            endTimes[i] = auction.endTime;
            isActive[i] = auction.isActive;
        }

        return (sellers, startingPrices, highestBids, highestBidders, endTimes, isActive);
    }
}