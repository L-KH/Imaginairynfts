import { useState, useEffect } from 'react';
import { Buffer } from 'buffer';
import { ethers } from 'ethers';
import axios from 'axios';
import { watchAccount, watchNetwork  } from '@wagmi/core'
// Components
// import Spinner from 'react-bootstrap/Spinner';
// import Navigation from './components/Navigation';
// ABIs
import NFT from '../abis/NFT.json'
// Config
import config from './config.json';
// FAQ page
// import FAQ from "./FAQ";
// import Countdown from './Countdown';
// import Footer from './components/Footer';
//--------------

function NFTlist() {
  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)
  const [nft, setNFT] = useState(null)
  const [seed, setSeed] = useState(0);
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState(null)
  const [url, setURL] = useState(null)
  const [showMintButton, setShowMintButton] = useState(false);
  const [message, setMessage] = useState("")
  const [isWaiting, setIsWaiting] = useState(false)
  const [dataArray, setDataArray] = useState(null);
  const [TokenUri, setTokenUri] = useState('');

  useEffect(() => {
    watchNetwork(handleAccountChange);
    console.log('chain')
  }, []);

  const handleAccountChange = (newChain)=> {
    // Perform actions when the account changes
    console.log('chain changed:', newChain);
    loadBlockchainData()
  }
 
  // add more function here

  const getImageSrc = (ipfsLink) => {
    const cid = ipfsLink?.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${cid}`;
  };
  
  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);
    const network = await provider.getNetwork();
    // Check if the user is connected to the Goerli or Sepolia network
    if (![0x5, 0xaa36a7, 0xe704, 0x82751, 0xdea8].includes(network.chainId)) {
      try {
        // Request the user to switch to the Goerli network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xe704' }],
        });
      } catch (error) {
        // Handle the error if the user rejects the request or the operation fails
        console.error(error);
        window.alert('Please connect to Linea network manually until we fix the issue');
      }
    } else {
      const nft = new ethers.Contract(config[network.chainId].nft.address, NFT, provider);
      setNFT(nft);
    }
  };
  async function fetchNFTlist(){
    const signer = await provider.getSigner()
    console.log(signer) 
    const totalNFT = await nft.connect(signer).totalSupply.call()
    const tokenUri = []
    for (let index = 1; index < totalNFT; index++) {
        const element = await nft.connect(signer).tokenURI(index);
        tokenUri.push(element)
        
    }
    console.log(tokenUri, totalNFT.toString())
    setTokenUri(tokenUri)
    readNFTData()
  }
    async function readNFTData(){
        try {
            const response = await axios.get(TokenUri);
            const data = response.data;
        
            const dataArray = [
            { name: data.name },
            { description: data.description },
            { image: data.image }
            ];
            console.log(dataArray)
            setDataArray(dataArray)
        } catch (error) {
            console.error('Error fetching data:', error);
            }
        
    }
  
  const createImage = async (apiUrl, seed) => {
    try {
    setMessage("Generating Image...");
    // Send the request
    const response = await axios({
      url: apiUrl,
      method: "POST",
      headers: { Authorization: `Bearer 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` },
      data: JSON.stringify({
        inputs: `${description} [seed:${seed}]`,
        options: { wait_for_model: true },
      }),
      responseType: "arraybuffer",
    });
    const type = response.headers["content-type"];
    const data = response.data;
    const base64data = Buffer.from(data).toString("base64");
    const img = `data:${type};base64,` + base64data; // <-- This is so we can render it on the page
    setImage(img);
    return data;
  } catch (er) {  console.log(er)}
  };
  
  useEffect(() => {
    watchNetwork(handleAccountChange);
    console.log('chain')
  }, []);

  useEffect(() => {
    loadBlockchainData()
    fetchNFTlist()
  
  }, [])
  useEffect(() => {
    fetchNFTlist()
  }, [])
 

  return (
    <div>
      <h1>Data Array:</h1>
      {dataArray?.map((item, index) => (
        <div key={index}>
            <p>Name: {item.name}</p>
            <p>Description: {item.description}</p>
              <img
                src={getImageSrc(item.image)}
                alt="Image"
                width={300}
                height={200}
              />
        </div>
      ))}
    </div>
  );
}
export default NFTlist;
