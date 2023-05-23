import { useState, useEffect } from 'react';
import { NFTStorage, File } from 'nft.storage'
import { Buffer } from 'buffer';
import { ethers } from 'ethers';
import axios from 'axios';
// Components
// import Spinner from 'react-bootstrap/Spinner';
// import Navigation from './components/Navigation';
// ABIs
import NFT from './abis/NFT.json'
// Config
import config from './config.json';
// FAQ page
import FAQ from "./FAQ";
import Countdown from './Countdown';
import Footer from './components/Footer';
//--------------
import { wagmiClient } from '../Layout/Web3Wrapper'


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
    useEffect(() => {
      if (window.ethereum) {
        const handleNetworkChanged = () => {
          window.location.reload();
        };
    
        window.ethereum.on('networkChanged', handleNetworkChanged);
        return () => {
          window.ethereum.removeListener('networkChanged', handleNetworkChanged);
        };
      }
    }, []);
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
      const nft = new ethers.Contract(config[network.chainId].nft.address, NFT, provider);
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
    if (!account) {
      setShowInstallMetamaskPopup(true);
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
      headers: { Authorization: `Bearer ${process.env.REACT_APP_API_KEY}` },
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
    const nftstorage = new NFTStorage({ token: process.env.REACT_APP_NFT_STORAGE_API_KEY })
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
  const [faqs, setFaqs] = useState([
    {
      question: "How does ImaginAIry NFTs' AI generate digital art based on the given prompt?",
      answer:
      "ImaginAIry NFTs uses AI algorithms to turn user prompts into unique digital art, considering factors like style, composition, and color. Users provide a title and prompt, and the AI crafts a personalized piece in line with the 'Your Prompt, Your Art, Your NFT' vision. Users can regenerate the artwork with different seeds until they find the perfect masterpiece, ensuring full control over the creative process.",
      open: true
    },
    {
      question: "Can I sell or transfer my minted NFT to someone else?",
      answer: "Yes, once you mint your AI-generated digital art as an NFT, you have full ownership of the digital asset. You can sell, trade, or transfer your NFT on various platforms that support the Ethereum blockchain and NFT transactions.",
      open: false
    },
    {
      question:
        "Is there a limit to the number of times I can regenerate the artwork before minting?",
      answer: "There is no limit to the number of times you can regenerate the artwork before minting. You can continue experimenting with different seeds and prompts until you find the perfect masterpiece that matches your vision.",
      open: false
    },
    {
      question:
        "How does the 'Your prompt, Your art, Your NFT' concept work?",
      answer: "Our platform allows users to input their chosen prompts and titles, which are then used to generate one-of-a-kind digital art pieces. Users have the option to create multiple artworks until they find the perfect one. Once they're satisfied with the generated art, they can mint it as an NFT at a cost of 0.0001 ETH. This unique approach puts creative control in the hands of users, ensuring that their NFTs truly represent their personal ideas and vision.",
      open: false
    },
    {
      question:
        "Will there be a project-specific token?",
      answer: "Yes! We're excited to announce that we'll be launching a token in the near future. Our token will serve as a reward mechanism for users who mint NFTs and successfully sell them on platforms like OpenSea. The rewards will be based on the listing price and the number of times the NFT is bought. More details about our token and its utility will be revealed soon.",
      open: false
    },
    {
      question:
        "Are there any special events or promotions related to the project's token?",
      answer: "We have some exciting plans in the pipeline to show our appreciation for our early supporters and users. While we can't reveal all the details just yet, we highly recommend keeping a close eye on our social media channels and website for updates and announcements about upcoming events, promotions, and the official launch of our token. Who knows? You might just find yourself rewarded in ways you didn't expect!",
      open: false
    }
  ]);
  const toggleFAQ = index => {
    setFaqs(
      faqs.map((faq, i) => {
        if (i === index) {
          faq.open = !faq.open;
        } else {
          faq.open = false;
        }

        return faq;
      })
    );
  };

  return (
    <div>
      
      {/* <Navigation account={account} setAccount={setAccount} provider={provider} /> */}
      <Countdown />
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
          <textarea type="text" placeholder="Create a description..." onChange={(e) => setDescription(e.target.value)} />
          <input type="submit" value="Create" className="button-style"/>
          {showMintButton && (
            <button type="button" onClick={mintHandler} className="button-style">
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
      <div className="title_brand" >
        <h1 >About</h1>
          <div className="about-container">
            <p>
              ImaginAIry NFTs (Revolutionizing Digital Art through AI) is a groundbreaking platform that leverages the power of artificial intelligence to help users create personalized, unique digital art pieces and mint them as non-fungible tokens (NFTs). By combining advanced AI technology with user-driven creativity, we strive to offer an unparalleled experience for art enthusiasts, collectors, and digital creators alike.
            </p>

            <h5>Our Vision: "Your Prompt, Your Art, Your NFT"</h5>
            <p>
              At the core of ImaginAIry NFTs is the belief that everyone should have the opportunity to express their creativity and turn their ideas into valuable digital assets. The concept of "your prompt, your art, your NFT" encapsulates our commitment to providing users with full control over the creative process, from ideation to minting.
            </p>

            <h5>The Creative Process</h5>
            <p>
              Our platform empowers users to transform their ideas into reality through a simple, user-friendly interface. Users choose a title and prompt, which serves as the foundation for their AI-generated artwork. The AI model then crafts a unique and personalized piece based on these inputs. If the initial result doesn't fully satisfy the user, they can regenerate the artwork using a different random seed until they discover their perfect masterpiece.
            </p>
            <p>
              Once satisfied with their creation, users can mint their custom digital art as an NFT for a nominal fee of 0.0001 ETH. This process establishes their ownership of the one-of-a-kind digital asset and adds it to their growing collection of unique, AI-generated artworks.
            </p>
            <p>Embark on a journey of limitless creative possibilities with ImaginAIry NFTs. Together, we can revolutionize the world of digital art and NFTs, empowering creators to unleash their imagination and bring their ideas to life. Join us today and be a part of the future of art.</p>
          </div>
    
  <h1>FAQ</h1></div>
  <div className="faqs">
        {faqs.map((faq, index) => (
          <FAQ faq={faq} index={index} key={index} toggleFAQ={toggleFAQ} />
        ))}
      </div>
      <div className="App">
    <Footer />
  </div>
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
