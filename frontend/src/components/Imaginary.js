import { useState, useEffect } from 'react';
import { NFTStorage, File } from 'nft.storage'
import { Buffer } from 'buffer';
import { ethers } from 'ethers';
import axios from 'axios';
import { watchAccount, watchNetwork  } from '@wagmi/core'
import NFT from '../abis/NFT2.json'
import config from './config.json';
//--------------
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)
  const [nft, setNFT] = useState(null)
  const [seed, setSeed] = useState(0);
  const [name, setName] = useState("")
  const [prompt, setPrompt] = useState("");
  const [description, setDescription] = useState("")
  const [image, setImage] = useState(null)
  const [url, setURL] = useState(null)
  const [showMintButton, setShowMintButton] = useState(false);
  const [message, setMessage] = useState("")
  const [isWaiting, setIsWaiting] = useState(false)
  const [imageData, setImageData] = useState(null);
  const [showInstallMetamaskPopup, setShowInstallMetamaskPopup] = useState(false);
  const [shouldGenerate, setShouldGenerate] = useState(false);
  const [currentChainId, setCurrentChainId] = useState(null);

  useEffect(() => {
    watchNetwork(handleAccountChange);
  }, []);

  const handleAccountChange = (newChain)=> {
    loadBlockchainData()
  }
 

  const apiUrlMap = {
    'stable-diffusion-2-1': 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
    'stable-diffusion-v1-5': 'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
    'stable-diffusion-v1-4': 'https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4',
    'openjourney':'https://api-inference.huggingface.co/models/prompthero/openjourney',
    'openjourney V4':'https://api-inference.huggingface.co/models/prompthero/openjourney-v4',
    'Realistic Vision':'https://api-inference.huggingface.co/models/SG161222/Realistic_Vision_V1.4',
    'anything-v5.0':'https://api-inference.huggingface.co/models/stablediffusionapi/anything-v5',
    'Dungeons-and-Diffusion':'https://api-inference.huggingface.co/models/0xJustin/Dungeons-and-Diffusion',
    'pastel-mix':'https://api-inference.huggingface.co/models/andite/pastel-mix',
    'Pokemon Diffusers':'https://api-inference.huggingface.co/models/lambdalabs/sd-pokemon-diffusers',

    };
  const generateRandomSeed = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };
  const [apiUrl, setApiUrl] = useState(apiUrlMap['openjourney V4']);
  const [selectedModel, setSelectedModel] = useState('openjourney V4');
  const changeModel = (modelName) => {
   setSelectedModel(modelName);
   setApiUrl(apiUrlMap[modelName]);
  };
  const allowedChains = [534353, 57000, 5, 10, 59140, 167005, 570, 59144, 8453]; // Add more chain IDs as needed

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);
    const network = await provider.getNetwork();
  
    if (!allowedChains.includes(network.chainId)) {
      const optimismChainId = '0xe708';
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: optimismChainId }],
        });
      } catch (switchError) {
        console.error(switchError);
        toast.error('Please connect to the network manually');
        return; 
      }
    }
    const switchedNetwork = await provider.getNetwork();
    const nft = new ethers.Contract(config[switchedNetwork.chainId].nft.address, NFT, provider);
    setNFT(nft);
    setCurrentChainId(switchedNetwork.chainId);

  };
  const submitHandler = async (e, apiUrl) => {
    e.preventDefault();
    if (name === "" || prompt === "") {
      toast.error('Please provide a name and prompt');
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
      toast.error('No image to mint');
      return;
    }
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
        inputs: `${prompt} [seed:${seed}]`,
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
    setMessage("Mint your NFT...")
    return url
    
  }
  // SEED as address of ethereum
  const mintImage = async (tokenURI) => {
    try {
      setMessage("Waiting for Mint...")
      const signer = await provider.getSigner()
      const mintValue = currentChainId === 570 ? ethers.utils.parseUnits("10", "ether") : ethers.utils.parseUnits("0.001", "ether"); // Replace "sys" with the correct unit for SYS currency
      const transaction = await nft.connect(signer).mint(tokenURI, { value: mintValue })
      await transaction.wait()
    } catch (error) {
      console.log(error)
    }
    setMessage("Generating Image...");
  }
  
  useEffect(() => {
    loadBlockchainData()
  }, [])
  
  
  
  
  async function getMagicPrompt(name) {
  // Generate a new random seed each time the function is called
  const newSeed = generateRandomSeed(0, 1000);
  setSeed(newSeed);

  const response = await fetch(
    "https://api-inference.huggingface.co/models/Gustavosta/MagicPrompt-Stable-Diffusion",
    {
      headers: { Authorization: "Bearer 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" },
      method: "POST",
      body: JSON.stringify({ inputs: name }),
    }
  );
  const result = await response.json();
  
  // Check if the result is an array
  if(Array.isArray(result)) {
    return result[0]?.generated_text || "";
  } else {
    // If not an array, directly return the generated_text
    return result?.generated_text || "";
  }
}

  
  
  
  async function generatePrompt(e) {
    e.preventDefault();
    const generatedPrompt = await getMagicPrompt(name);
    setPrompt(generatedPrompt);
    setShouldGenerate(true);
  }
  
  useEffect(() => {
    if (shouldGenerate) {
      getMagicPrompt(name).then(prompt => {
        document.getElementById('setprompt').value = prompt;
      });
      setShouldGenerate(false);  // Reset shouldGenerate to false after generating the prompt descr
    }
  }, [name, shouldGenerate]);
  


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
      <option value="openjourney V4">openjourney V4</option>
      <option value="Realistic Vision">Realistic Vision</option>
      <option value="anything-v5.0">anything V5.0</option>
      <option value="Pokemon Diffusers">Pokemon Diffusers</option>
      <option value="Dungeons-and-Diffusion">Dungeons-and-Diffusion</option>
      <option value="pastel-mix">pastel-mix</option>
    </select>
  </div>
</div>
      <div className='form '>
        <form onSubmit={(e) => submitHandler(e, apiUrl)}>
          <input className='text-primary'type="text" placeholder="Create a name(title)..." onChange={(e) => { setName(e.target.value) }} />
          <input className='text-primary' type="text" placeholder="Create a description(public)..." onChange={(e) => setDescription(e.target.value)} />
          
          <div className="card flex-1 items-center justify-center bg-neutral-focus">
          <input
            className="text-center text-neutral-content magicbutton"
            type="button" // Change this from "" to "button"
            onClick={generatePrompt}
            value="🌟Magic Prompt🌟 [Beta]"
          /></div>
        

        <textarea
          id="setprompt"
          className="text-primary"
          type="text"
          placeholder="Create a prompt(private)..."
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt} // Make sure the textarea shows the current value of the prompt state
        />
          <div className="mb-4 card flex-1 items-center justify-center bg-primary-focus">
            <input className="text-center text-primary-content" type="submit" value="Create"/>
          </div>
          
          {showMintButton && (
            <div className="card flex-1 items-center justify-center bg-primary-focus">
                <input className="text-center text-primary-content" type="submit" onClick={(e) => { e.preventDefault(); mintHandler(); }} value={currentChainId === 570 ? "Mint [10 SYS]" : "Mint [0.001ETH]"}/>
            </div>
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

<footer className="card flex-1 items-center justify-center border border-base-300 bg-base-100" >
      <p className="text-center text-base-content">
      💖 Enjoying our work? Show some love and support our future projects by contributing to :
        <br/>
        <a href="https://optimistic.etherscan.io/address/0x7da373Ba58A5b492F3C3282E49467dcdF2bE8f19" target="_blank" rel="noopener noreferrer">
          <b>0x7da373Ba58A5b492F3C3282E49467dcdF2bE8f19</b>
        </a>
      </p>
    </footer>
    <ToastContainer />

    </div>
    
  );
}
export default App;
