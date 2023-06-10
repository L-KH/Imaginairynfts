import { useState, useEffect } from 'react';
import { NFTStorage, File } from 'nft.storage'
import { Buffer } from 'buffer';
import { ethers } from 'ethers';
import axios from 'axios';
// Components
// import Spinner from 'react-bootstrap/Spinner';
// import Navigation from './components/Navigation';
// ABIs
//import NFT from '../abis/NFT.json'
import NFT from '../abis/NFT2.json'

// Config
import config from './config.json';
// FAQ page
// import FAQ from "./FAQ";
// import Countdown from './Countdown';
// import Footer from './components/Footer';
//--------------
import { wagmiClient } from './Layout/Web3Wrapper';

function App() {
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
  const [imageData, setImageData] = useState(null);
  const [showInstallMetamaskPopup, setShowInstallMetamaskPopup] = useState(false);


  async function readAcount() {
    const account = await wagmiClient.connector?.getAccount()
    setAccount(account)
  }
  async function fetchData() {
    if(account){
      try {
      const signer = wagmiClient.provider;
      const account = await wagmiClient.connector?.getAccount()
      const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);
        // call contract function
    } catch (error) {
      console.log(error)
    }
    }else {
      console.log('not conected')
    }
    
  }
  // add more function here

  const apiUrlMap = {
    'stable-diffusion-2-1': 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
    'stable-diffusion-v1-5': 'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
    'stable-diffusion-v1-4': 'https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4',
    'openjourney':'https://api-inference.huggingface.co/models/prompthero/openjourney',
    'anything-v4.0':'https://api-inference.huggingface.co/models/andite/anything-v4.0',
    'Dungeons-and-Diffusion':'https://api-inference.huggingface.co/models/0xJustin/Dungeons-and-Diffusion',
    'pastel-mix':'https://api-inference.huggingface.co/models/andite/pastel-mix',

    };
    // useEffect(() => {
    //   if (window.ethereum) {
    //     const handleNetworkChanged = () => {
    //       window.location.reload();
    //     };
    
    //     window.ethereum.on('networkChanged', handleNetworkChanged);
    //     return () => {
    //       window.ethereum.removeListener('networkChanged', handleNetworkChanged);
    //     };
    //   }
    // }, []);
  const generateRandomSeed = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };
  const [apiUrl, setApiUrl] = useState(apiUrlMap['openjourney']);
  const [selectedModel, setSelectedModel] = useState('openjourney');
  const changeModel = (modelName) => {
   setSelectedModel(modelName);
   setApiUrl(apiUrlMap[modelName]);
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
      const nft = new ethers.Contract(config[network.chainId].nft.address, NFT.abi, provider);
      setNFT(nft);
    }
  };
  const submitHandler = async (e, apiUrl) => {
    e.preventDefault();
    if (name === "" || description === "") {
      window.alert("Please provide a name and description");
      return;
    }
    setIsWaiting(true);
    // Update the seed value
    setSeed(generateRandomSeed(1, 1000000));
    // Call AI API to generate an image based on description
    const imageData = await createImage(apiUrl, seed);
    setImageData(imageData); // <-- Add this line to store the image data in state
    setIsWaiting(false);
    setShowMintButton(true);
  };
  const closeInstallMetamaskPopup = () => {
    setShowInstallMetamaskPopup(false);
  };
  
  const mintHandler = async () => {
    if (!imageData) {
      window.alert("No image to mint");
      return;
    }
    // if (!account) {
    //   setShowInstallMetamaskPopup(true);
    //   return;
    // }
    setMessage("Uploading Image...");
    const url = await uploadImage(imageData);
    setMessage("Waiting for Mint...");
    setIsWaiting(true);
    // Mint NFT
    await mintImage(url);
    setIsWaiting(false);
    setMessage("");
    setShowMintButton(false);
  };
  
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
  const uploadImage = async (imageData) => {
    setMessage("Uploading Image...")
    // Create instance to NFT.Storage
    const nftstorage = new NFTStorage({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGFjYTU2MTcxQUI5MkRmOGMzNjM0MzRlODcyOUJkZWNDNzhGOEMwRTIiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY4MjExNjY5NTg5NSwibmFtZSI6Im5mdCJ9.roO9LrntQk8MkfN0CVZE1lw99t4mjb6MCGPkAw7TCt0" })
    // Send request to store image
    const { ipnft } = await nftstorage.store({
      image: new File([imageData], "image.jpeg", { type: "image/jpeg" }),
      name: name,
      description: description,
    })
    const url = `https://ipfs.io/ipfs/${ipnft}/metadata.json`
    setURL(url)

    return url
  }
  const mintImage = async (tokenURI) => {
    setMessage("Waiting for Mint...")
    const signer = await provider.getSigner()
    const transaction = await nft.connect(signer).mint(tokenURI, { value: ethers.utils.parseUnits("0.001", "ether") })
    await transaction.wait()
  }
  useEffect(() => {
    loadBlockchainData()
  }, [])
  
  

  return (
    <div>
      
      {/* <Navigation account={account} setAccount={setAccount} provider={provider} /> */}
      
      <div className="model-switch-container">
      
  <div className="model-switch">
    <select
      value={selectedModel}
      onChange={(e) => changeModel(e.target.value)}
      className="model-select"
    >
      
      <option value="stable-diffusion-2-1">stable-diffusion-2-1</option>
      <option value="stable-diffusion-v1-5">stable-diffusion-v1-5</option>
      <option value="stable-diffusion-v1-4">stable-diffusion-v1-4</option>
      <option value="openjourney">openjourney</option>
      <option value="anything-v4.0">anything-v4.0</option>
      <option value="Dungeons-and-Diffusion">Dungeons-and-Diffusion</option>
      <option value="pastel-mix">pastel-mix</option>
    </select>
  </div>
</div>
      <div className='form'>
        <form onSubmit={(e) => submitHandler(e, apiUrl)}>
          <input type="text" placeholder="Create a name..." onChange={(e) => { setName(e.target.value) }} />
          <textarea type="text" placeholder="Create a prompt..." onChange={(e) => setDescription(e.target.value)} />
          <div className="card flex-1 items-center justify-center bg-primary-focus">
            <input className="text-center text-primary-content" type="submit" value="Create"/>
          </div>
          
          {showMintButton && (
            <button  className="card flex-1 items-center justify-center bg-primary-focus text-center text-primary-content button-style" onClick={mintHandler} >
              Mint [0.001ETH]
            </button>
          )}
        </form>
      


        <div className="image">
          {image ? (
            <div className="image__container">
              <img src={image} alt="AI generated image" />
              {isWaiting && (
                <div className="image__overlay">
                  <p>{message}</p>
                </div>
              )}
            </div>
          ) : isWaiting ? (
            <div className="image__placeholder">
              {/* <Spinner animation="border" /> */}
              <p>{message}</p>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
  
      {!isWaiting && url && (
        <p>
          View&nbsp;<a href={url} target="_blank" rel="noreferrer">Metadata</a>
        </p>
      )}
  {showInstallMetamaskPopup && (
  <div
    className="install-metamask-popup-overlay"
    onClick={closeInstallMetamaskPopup}
  >
    <div
      className="install-metamask-popup"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="install-metamask-popup__close"
        onClick={closeInstallMetamaskPopup}
      >
        &times;
      </button>
      <h3>Please install MetaMask before minting</h3>
      <p>
        MetaMask is required to interact with the blockchain and mint NFTs.
        Please install the MetaMask extension and refresh the page.
      </p>
      <button
  className="install-metamask-popup__button"
  onClick={() => window.open('https://metamask.io/download', '_blank')}
>
  Install MetaMask
</button>
    </div>
  </div>
)}

    </div>
  );
}
export default App;
