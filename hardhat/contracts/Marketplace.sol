// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface IImaginAIryNFT is IERC721 {
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

contract ImaginAIryMarketplace is ERC721Holder, ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;

    IImaginAIryNFT public immutable nftContract;

    struct Listing {
        uint256 listingId;    // Unique ID for the listing
        address seller;
        uint256 tokenId;
        uint256 price;
        bool isActive;
    }

    Counters.Counter private _listingIds;
    mapping(uint256 => Listing) public listings;

    uint256 public feePercentage = 250; // 2.5%
    uint256 public constant FEE_DENOMINATOR = 10000;
    address public feeRecipient;

    // Mapping to track offers (listingId => (offeror => offerAmount))
    mapping(uint256 => mapping(address => uint256)) public offers;
    
    // New mapping to track offeror addresses for each listing (listingId => offeror addresses)
    mapping(uint256 => address[]) public offerorsByListing;

    event ItemListed(uint256 indexed listingId, address indexed seller, uint256 indexed tokenId, uint256 price);
    event ItemSold(uint256 indexed listingId, address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
    event ItemPriceUpdated(uint256 indexed listingId, uint256 newPrice);
    event ItemCanceled(uint256 indexed listingId);
    event FeePercentageUpdated(uint256 newFeePercentage);
    event FeeRecipientUpdated(address newFeeRecipient);
    event OfferMade(uint256 indexed listingId, address indexed offeror, uint256 offerAmount);
    event OfferAccepted(uint256 indexed listingId, address indexed offeror, uint256 offerAmount);
    event OfferRejected(uint256 indexed listingId, address indexed offeror);

    constructor(address _nftContract) Ownable(msg.sender) {
        require(_nftContract != address(0), "Invalid NFT contract address");
        nftContract = IImaginAIryNFT(_nftContract);
        feeRecipient = msg.sender;
    }

    function listItem(uint256 tokenId, uint256 price) external {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not the owner of the NFT");
        require(price > 0, "Price must be greater than 0");

        nftContract.safeTransferFrom(msg.sender, address(this), tokenId);

        _listingIds.increment();
        uint256 listingId = _listingIds.current();

        listings[listingId] = Listing(listingId, msg.sender, tokenId, price, true); // Update to include listingId

        emit ItemListed(listingId, msg.sender, tokenId, price);
    }

    function buyItem(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing is not active");
        require(msg.value >= listing.price, "Insufficient payment");

        _processSale(listingId, msg.sender, listing.price);
    }

    function makeOffer(uint256 listingId) external payable {
        require(listings[listingId].isActive, "Listing is not active");
        require(msg.value > 0, "Offer must be greater than 0");

        // Check if the offeror already made an offer. If not, add them to the list of offerors.
        if (offers[listingId][msg.sender] == 0) {
            offerorsByListing[listingId].push(msg.sender);
        }

        offers[listingId][msg.sender] = msg.value;
        emit OfferMade(listingId, msg.sender, msg.value);
    }

    function acceptOffer(uint256 listingId, address offeror) external {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.isActive, "Listing is not active");
        require(offers[listingId][offeror] > 0, "No offer from this address");

        uint256 offerAmount = offers[listingId][offeror];
        _processSale(listingId, offeror, offerAmount);
        emit OfferAccepted(listingId, offeror, offerAmount);
    }

    function rejectOffer(uint256 listingId, address offeror) external {
        require(listings[listingId].seller == msg.sender, "Not the seller");
        require(offers[listingId][offeror] > 0, "No offer from this address");

        uint256 offerAmount = offers[listingId][offeror];
        offers[listingId][offeror] = 0;

        // Remove offeror from offerorsByListing array
        for (uint256 i = 0; i < offerorsByListing[listingId].length; i++) {
            if (offerorsByListing[listingId][i] == offeror) {
                offerorsByListing[listingId][i] = offerorsByListing[listingId][offerorsByListing[listingId].length - 1];
                offerorsByListing[listingId].pop();
                break;
            }
        }

        payable(offeror).transfer(offerAmount);
        emit OfferRejected(listingId, offeror);
    }

    function updateItemPrice(uint256 listingId, uint256 newPrice) external {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.isActive, "Listing is not active");
        require(newPrice > 0, "Price must be greater than 0");

        listing.price = newPrice;

        emit ItemPriceUpdated(listingId, newPrice);
    }

    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.isActive, "Listing is not active");

        listing.isActive = false;
        nftContract.safeTransferFrom(address(this), msg.sender, listing.tokenId);

        emit ItemCanceled(listingId);
    }

    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }

    function getActiveListings() external view returns (Listing[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= _listingIds.current(); i++) {
            if (listings[i].isActive) {
                activeCount++;
            }
        }

        Listing[] memory activeListings = new Listing[](activeCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= _listingIds.current(); i++) {
            if (listings[i].isActive) {
                activeListings[index] = listings[i];
                index++;
            }
        }

        return activeListings;
    }

    // New function to fetch all offers for a listing
    function getOffers(uint256 listingId) external view returns (address[] memory, uint256[] memory) {
        uint256 offerCount = offerorsByListing[listingId].length;
        address[] memory offerors = new address[](offerCount);
        uint256[] memory offerAmounts = new uint256[](offerCount);

        for (uint256 i = 0; i < offerCount; i++) {
            address offeror = offerorsByListing[listingId][i];
            offerors[i] = offeror;
            offerAmounts[i] = offers[listingId][offeror];
        }

        return (offerors, offerAmounts);
    }

    function setFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 1000, "Fee percentage cannot exceed 10%");
        feePercentage = _feePercentage;
        emit FeePercentageUpdated(_feePercentage);
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
        emit FeeRecipientUpdated(_feeRecipient);
    }

    function _processSale(uint256 listingId, address buyer, uint256 price) internal {
        Listing storage listing = listings[listingId];
        uint256 feeAmount = (price * feePercentage) / FEE_DENOMINATOR;
        uint256 sellerAmount = price - feeAmount;

        listing.isActive = false;

        nftContract.safeTransferFrom(address(this), buyer, listing.tokenId);
        payable(listing.seller).transfer(sellerAmount);
        payable(feeRecipient).transfer(feeAmount);

        emit ItemSold(listingId, listing.seller, buyer, listing.tokenId, price);

        // Refund excess payment if any
        if (msg.value > price) {
            payable(buyer).transfer(msg.value - price);
        }

        // Refund other offers
        for (uint256 i = 0; i < offerorsByListing[listingId].length; i++) {
            address offeror = offerorsByListing[listingId][i];
            if (offeror != buyer && offers[listingId][offeror] > 0) {
                uint256 offerAmount = offers[listingId][offeror];
                offers[listingId][offeror] = 0;
                payable(offeror).transfer(offerAmount);
            }
        }
    }

    receive() external payable {}
}
