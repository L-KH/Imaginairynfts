// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address public owner;
    uint256 public cost;

    // A mapping to store the tokens owned by a particular address
    mapping(address => uint256[]) private _tokensOfOwner;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _cost
    ) ERC721(_name, _symbol) {
        owner = msg.sender;
        cost = _cost;
    }
    
    function mint(string memory tokenURI) public payable {
        require(msg.value >= cost, "Payment less than cost");
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        
        // Update the mapping every time a new token is minted
        _tokensOfOwner[msg.sender].push(newItemId);
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
    // A function to get the tokens owned by a particular address
    function tokensOfOwner(address _owner) public view returns(uint256[] memory) {
        return _tokensOfOwner[_owner];
    }

    function setCost(uint256 newCost) public {
        require(msg.sender == owner, "Only owner can change cost");
        cost = newCost;
    }

    // Function to set cost in a human-readable format
    function setReadableCost(uint256 newCost, uint8 decimals) public {
        require(msg.sender == owner, "Only owner can change cost");
        cost = newCost * 10**decimals;
    }

    // Function to allow token owner to burn their NFT
    function burn(uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Caller is not owner nor approved");
        _burn(tokenId);
    }

    function withdraw() public {
        require(msg.sender == owner, "Only owner can withdraw");
        payable(owner).transfer(address(this).balance);
    }
}
