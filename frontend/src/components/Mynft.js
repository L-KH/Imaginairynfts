import React, { useState, useEffect } from "react";
import { ethers } from 'ethers';
import axios from 'axios'; // make sure to import axios to fetch data from URL
import NFT from '../abis/NFT2.json'

const contractAddress = "0xcaa8aa6733cff9a916b931e34b2cb817193bfb19"; 

const Mynft = () => {
  const [myNFTs, setMyNFTs] = useState([]);

  useEffect(() => {
    loadNFTs();
  }, [])

  async function loadNFTs() {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Please install MetaMask to use this dApp!");
        return;
      }
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const nftContract = new ethers.Contract(contractAddress, NFT.abi, signer);

      const balance = await nftContract.balanceOf(account);
      
      const nfts = [];
      for (let i = 0; i < balance; i++) {
        const tokenId = await nftContract.tokenOfOwnerByIndex(account, i);
        const tokenURI = await nftContract.tokenURI(tokenId);

        // Fetch the metadata from the URL
        const metadata = await axios.get(tokenURI);
        
        const item = {
          tokenId,
          name: metadata.data.name,
          description: metadata.data.description,
          image: metadata.data.image,
        };
        
        nfts.push(item);
      }

      setMyNFTs(nfts);
    } catch (error) {
      console.error("Error loading NFTs: ", error);
    }
  }

  return (
    <div>
      <h2>My NFTs</h2>
      {myNFTs.map((nft, i) => (
        <div key={i}>
          <h3>{nft.name}</h3>
          <p>{nft.description}</p>
          <img src={nft.image} alt={nft.name} />
        </div>
      ))}
    </div>
  )
}

export default Mynft;
