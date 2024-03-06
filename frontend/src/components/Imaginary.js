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
import { OpenAI } from 'openai';


function App() {
  const [provider, setProvider] = useState(null)
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
  const [fallbackMintOption, setFallbackMintOption] = useState(false); // New state to manage fallback minting option

  const openai = new OpenAI({ apiKey: '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', dangerouslyAllowBrowser: true });

  // useEffect(() => {
  //   watchNetwork((newChain) => loadBlockchainData());
  // }, []);
 
  const logoUrl = 'https://raw.githubusercontent.com/L-KH/ARB-Airdrop-Checker/main/logo_imaginairy_alternative%20(1).png'; // TODO: Replace with actual logo URL
  let userFriendlyError = "We encountered an issue generating your image. Would you like to mint a special 'Proof of Mint' logo instead?";

  const apiUrlMap = {
    'stable-diffusion-2-1': 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
    'stable-diffusion-v1-5': 'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
    'stable-diffusion-v1-4': 'https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4',
    'openjourney':'https://api-inference.huggingface.co/models/prompthero/openjourney',
    'openjourney V4':'https://api-inference.huggingface.co/models/prompthero/openjourney-v4',
    'Realistic Vision':'https://api-inference.huggingface.co/models/SG161222/Realistic_Vision_V1.4',
    'anything-v5.0':'https://api-inference.huggingface.co/models/stablediffusionapi/anything-v5',
    'Dungeons-and-Diffusion':'https://api-inference.huggingface.co/models/0xJustin/Dungeons-and-Diffusion',
    'Pokemon Diffusers':'https://api-inference.huggingface.co/models/lambdalabs/sd-pokemon-diffusers',
    'DALLE': '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',
    'STABLE_DIFFUSION_MODEL_NAME':'https://stablediffusionapi.com/api/v3/text2img',

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
  const allowedChains = [534353, 57000, 5, 10, 59140, 167005, 570, 59144, 8453, 534352]; // Add more chain IDs as needed

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
        return; 
      }
    }
    const switchedNetwork = await provider.getNetwork();
    const nft = new ethers.Contract(config[switchedNetwork.chainId].nft.address, NFT, provider);
    setNFT(nft);
    setCurrentChainId(switchedNetwork.chainId);

  };


// newwwwwwwwwwwwwwwwwwwwwwwwww
const createImageWithDALLE = async (prompt) => {
  try {
    setMessage("Generating Image...");

    // Example using OpenAI's API, replace with your DALL-E API call if not using OpenAI
    const response = await openai.images.generate({ // Make sure this method exists; this is hypothetical
      model: "dall-e-2",

      prompt: prompt,
      n: 1, // Number of images to generate
      size: '512x512' // Image size, adjust as needed
    });

    if (response.data && response.data.length > 0) {
      const imageUrl = response.data[0].url;
      setImage(imageUrl); // Use this URL to display the image in your app
      return response.data[0]; // Return the image data
    }
  } catch (error) {
    console.error(error);
    setImage(logoUrl); // Fallback to a default image
    toast.error(userFriendlyError, {
      //autoClose: false,
      closeButton: true,
      onClose: () => setFallbackMintOption(true) // Enables minting the fallback logo
    });
  }
};
// ------------------------------ neew diff -----------------------------


// ----------------------------- neew diff ----------------------------
const createImageWithStableDiffusion = async (prompt) => {
  setMessage("Generating Image...");

  try {
    const API_KEY = "d30ec85c-a6a4-4aeb-87f6-3eaf6ca794d8"; // Replace with your actual DeepAI API key
    const response = await axios.post("https://api.deepai.org/api/text2img", {
      text: prompt,
    }, {
      headers: { 'Api-Key': API_KEY },
    });

    if (response.data && response.data.output_url) {
      setImage(response.data.output_url); // Display the image
      setMessage(""); // Clear the message once the image is set
    } else {
      throw new Error('No image URL in response');
    }
  } catch (error) {
    console.error(error);
    setImage(logoUrl); // Fallback image
    setMessage("Failed to generate image. Please try again.");
  } finally {
    setIsWaiting(false); // Ensure this is set to false to stop showing "Generating Image..."
    // Optionally, show the mint button here if it should appear right after image generation
    setShowMintButton(true);
  }
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
        if (selectedModel === 'STABLE_DIFFUSION_MODEL_NAME') { // Replace with the actual model name you're using
          const image_url = await createImageWithStableDiffusion(prompt);
          setImageData(image_url);
        } else {
          if (selectedModel === 'DALLE') {
            // Special handling for DALL-E
            const imageData = await createImageWithDALLE(prompt);
            setImageData(imageData); // Assuming this function sets the state with image data
            } else {
            // Call AI API to generate an image based on description
            const imageData = await createImage(apiUrl, seed);
            setImageData(imageData); // <-- Add this line to store the image data in state
            }}
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
    setIsWaiting(true);
    setMessage("Uploading Image...");
    // const url = await uploadImage(imageData);

    const url = image === logoUrl ? await uploadFallbackImage(logoUrl) : await uploadImage(imageData);

    // Mint NFT
    await mintImage(url);
    setIsWaiting(false);
    setMessage("Minting Complete.");
    setShowMintButton(false);
  };
  

  const uploadFallbackImage = async (imageUrl) => {
    setMessage("Uploading Fallback Image...");
    
    try {
      // Fetch the image from the URL
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to fetch the fallback image.');
      
      // Convert the image to a Blob
      const imageBlob = await response.blob();
      // Convert Blob to File object, required by NFT.Storage
      const imageFile = new File([imageBlob], "fallback-image.jpeg", { type: "image/jpeg" });
      
      // Use NFTStorage to upload the file
      const nftstorage = new NFTStorage({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGMzQzUyQjZENkIwOUZkMDhhM0ZFZTMzRjEzMTAxMmI2MjMzMjIyYTAiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcwNzkyMjAwMjE5MSwibmFtZSI6IkltYWdpbkFJcnkgTkZUcyJ9.ylRydZfHxz3uoMDElCTqbMwokS5NObFh8s3_-FFOnoQ" })
      const metadata = await nftstorage.store({
        image: imageFile,
        name: "Fallback Image",
        description: "This NFT was minted as a fallback due to an issue generating the original image.",
      });
      
      // Construct the URL to the uploaded image's metadata on IPFS
      const metadataUrl = `https://ipfs.io/ipfs/${metadata.ipnft}/metadata.json`;
      setMessage("Fallback Image Uploaded.");
      return metadataUrl;
      
    } catch (error) {
      console.error("Error uploading fallback image:", error);
      setMessage("Failed to upload fallback image.");
      // Handle error (e.g., set error state, show error message)
      // Returning null or throwing an error depending on your error handling strategy
      throw error;
    }
  };



  const createImage = async (apiUrl, seed) => {
    try {
      setMessage("Generating Image...");
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
    } catch (error) {
      console.error(error);
      setImage(logoUrl); // Sets the fallback logo URL as the image
      fetch(logoUrl)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result;
            setImageData(base64data); // Sets imageData with fallback image for minting
          };
          reader.readAsDataURL(blob);
        })
        .catch(e => console.error("Failed to convert logoUrl to Base64", e));
  
      toast.error(userFriendlyError, {
        // autoClose: false,
        closeButton: true,
        onClose: () => setFallbackMintOption(true) // Enables minting the fallback logo
      });
    }
  };

const mintFallbackLogo = async () => {
  // Logic to mint the fallback logo
  setMessage("Minting Proof of Mint logo...");
  setImage(logoUrl); // Show the fallback logo

  const imageData = await fetch(logoUrl).then(res => res.arrayBuffer());
  await mintImage(imageData, 'Proof of Mint Logo', 'This NFT certifies an attempted mint on our platform. Keep it as a token of your pioneering spirit!');
  setMessage("");
  setFallbackMintOption(false); // Reset the fallback mint option
};

  const uploadImage = async (imageData) => {
    setMessage("Uploading Image...")
    // Create instance to NFT.Storage
    //const nftstorage = new NFTStorage({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGFjYTU2MTcxQUI5MkRmOGMzNjM0MzRlODcyOUJkZWNDNzhGOEMwRTIiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY4MjExNjY5NTg5NSwibmFtZSI6Im5mdCJ9.roO9LrntQk8MkfN0CVZE1lw99t4mjb6MCGPkAw7TCt0" })
    const nftstorage = new NFTStorage({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGMzQzUyQjZENkIwOUZkMDhhM0ZFZTMzRjEzMTAxMmI2MjMzMjIyYTAiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcwNzkyMjAwMjE5MSwibmFtZSI6IkltYWdpbkFJcnkgTkZUcyJ9.ylRydZfHxz3uoMDElCTqbMwokS5NObFh8s3_-FFOnoQ" })
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
      console.error("Minting failed", error);
      toast.error("Minting failed. Please try again.");
    } finally {
      setIsWaiting(false);
      setMessage("");
    }
  };
  
  // useEffect(() => {
  //   loadBlockchainData()
  // }, [])
  
  
  
  
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
      
      <option value="stable-diffusion-2-1">Stable Diffusion 2.1</option>
      <option value="stable-diffusion-v1-5">Stable Diffusion v1.5</option>
      <option value="stable-diffusion-v1-4">Stable Diffusion v1.4</option>
      {/* <option value="openjourney">openjourney</option> */}
      <option value="openjourney V4">openjourney V4</option>
      <option value="Realistic Vision">Realistic Vision</option>
      <option value="anything-v5.0">anything V5.0</option>
      {/* <option value="Pokemon Diffusers">Pokemon Diffusers</option>
      <option value="Dungeons-and-Diffusion">Dungeons and Diffusion</option> */}
      {/* <option value="DALLE">DALLE</option>
      <option value="STABLE_DIFFUSION_MODEL_NAME">StabilityAI</option> */}

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

{/* <footer className="card flex-1 items-center justify-center border border-base-300 bg-base-100" >
      <p className="text-center text-base-content">
      💖 Enjoying our work? Show some love and support our future projects by contributing to :
        <br/>
        <a href="https://optimistic.etherscan.io/address/0x7da373Ba58A5b492F3C3282E49467dcdF2bE8f19" target="_blank" rel="noopener noreferrer">
          <b>0x7da373Ba58A5b492F3C3282E49467dcdF2bE8f19</b>
        </a>
      </p>
    </footer> */}
    <ToastContainer />

    </div>
    
  );
}
export default App;
