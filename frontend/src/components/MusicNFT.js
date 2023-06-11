import { useRef, useState, useEffect } from 'react';
import { NFTStorage, File } from 'nft.storage';
import { ethers } from 'ethers';
import NFT from '../abis/NFT2.json';
import config from './config.json';
import { html as beautify } from 'js-beautify';
import abcjs from "abcjs";
import { renderAbc, CreateSynth, startAnimation } from "abcjs";

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [nft, setNFT] = useState(null);
  const [description, setDescription] = useState("");
  const [showMintButton, setShowMintButton] = useState(false);
  const [message, setMessage] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [musicData, setMusicData] = useState(null);
  const musicDiv = useRef(null);
  const [synth, setSynth] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const allowedChains = [534353, 57000, 5, 11155111, 59140, 167005]; 
  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);
    const network = await provider.getNetwork();

    if (!allowedChains.includes(network.chainId)) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: ethers.utils.hexlify(network.chainId) }],
            });
        } catch (error) {
            console.error(error);
            window.alert('Please connect to the appropriate network manually until we fix the issue');
        }
    }
    
    if (allowedChains.includes(network.chainId)) {
        const nft = new ethers.Contract(config[network.chainId].nft.address, NFT, provider);
        setNFT(nft);
    }
};


const createMusic = async () => {
  try {
    setMessage("Generating Music...");

    const data = {
      description: {input: description},
      numberOfTunes: 1,
      maxLength: 500,
      topP: 0.9,
      temperature: 1.0,
      seed: "1234"
    }
    
    // const response = await fetch('http://18.206.89.84:5000/generate_music', {
    const response = await fetch('http://18.206.89.84:5000/generate_music', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      let musicData = await response.text();
      musicData = beautify(musicData, { indent_size: 2, space_in_empty_paren: true });
      setMusicData(musicData);
  
  if (musicData) {
    var visualObj = abcjs.renderAbc(musicDiv.current, musicData, {add_classes: true, responsive: "resize"})[0];
    
    var synth = new abcjs.synth.CreateSynth();
    await synth.init({ visualObj: visualObj });
    await synth.prime();

    // To start the playback
    synth.start();
    abcjs.startAnimation(musicDiv.current, visualObj, { showCursor: true });
  }

  return musicData;
}
  } catch (error) {
    console.error(`Fetch failed: ${error}`);
  }
};
  

useEffect(() => {
  if (musicData) {
    abcjs.renderAbc(musicDiv.current, musicData, {responsive: 'resize'});
  }
}, [musicData]);
 
// useEffect(() => {
//   const music = `X:1
// L:1/4
// M:4/4
// K:Eb
// C z F z | C D E2 | E F G A | G2 A2 | F2 D2 | F2 C2 | C4 | E2 D2 | G2 A2 | C2 G2 | F2 E2 | B2 A2 |
// c2 A2 | F4 | B2 c2 | F2 D2 | E2 F2 | F4 | F/A/F/A/ D/B/G/B/ | G/F/D/B/ F/G/E/C/ |
// B,/A/B,/C/ F/C/D/E/ | F2 G2 | E2 D2 | D4 | C4 | F2 D2 | E2 G2 | C4 | z4 | z4 | z4 | z4 | z4 |
// z4 | z4 | z4 | z4 | z4 | z4 | z4 | z4 |]`;

//   // Generate sheet music SVG
//   abcjs.renderAbc(musicDiv.current, music, {responsive: 'resize'});
// }, []);
  

  
  
const submitHandler = async (e) => {
  e.preventDefault();
  if (description === "") {
    window.alert("Please provide a description");
    return;
  }
  setIsWaiting(true);
  const music = await createMusic();
  setIsWaiting(false);
  setShowMintButton(true);
};

  

  const mintHandler = async () => {
    if (!musicData) {
      window.alert("No music to mint");
      return;
    }
    setMessage("Uploading Music...");
    const url = await uploadMusic(musicData);
    setMessage("Waiting for Mint...");
    setIsWaiting(true);
    await mintMusic(url);
    setIsWaiting(false);
    setMessage("");
    setShowMintButton(false);
  };

  const uploadMusic = async (musicData) => {
    const client = new NFTStorage({ token: config.nftStorageKey });
    const cid = await client.storeBlob(new Blob([musicData]));
    return `https://ipfs.io/ipfs/${cid}`;
  };
  const mintMusic = async (url) => {
        try {
        setMessage("Waiting for Mint...")
        const signer = provider.getSigner();
        const account = await signer.getAddress();
        setAccount(account);

        const transaction = await nft.connect(signer).mint(account, url, { value: ethers.utils.parseUnits("0.001", "ether") });
        await transaction.wait()
        } catch (error) {
          console.log(error)
        }
        setMessage("Generating Image...");
      }
      useEffect(() => {
        loadBlockchainData()
      }, [])
      useEffect(() => {
        loadBlockchainData();
      }, []);

      const cardStyle = {
        maxWidth: '800px',
        margin: 'auto',
        border: '1px solid #ddd',
        borderRadius: '5px',
        padding: '20px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
      };
return (
        <div>
         
          
            <div className="card flex-1 items-center justify-center bg-warning mb-5">
              <h3 className="text-center text-warning-content text-5xl">Coming soon ...</h3>
              <p className="text-center text mb-12 text-lg">Step into a composer's paradise! Our innovative text-to-music AI is set to revolutionize the way you create melodies. Stay tuned to unlock a world of endless musical possibilities!</p>
            </div>
            <div className='mx-auto'>
              <h3 className='text-center text-2xl font-bold text-primary mb-7'>ABC Notation:</h3>
              <pre className='text-center mb-12 text-lg '>{isWaiting ? "Generating..." : ""}</pre>
              <div style={cardStyle}>
                <div ref={musicDiv}></div>
              </div>


            </div>
            <div className='form'>
                <form onSubmit={submitHandler}>
                <textarea type="text" placeholder="Create a description..." onChange={(e) => setDescription(e.target.value)} />
                <div className="mb-4 card flex-1 items-center justify-center bg-primary-focus">
                    <input className="text-center text-primary-content" type="submit" value="Create"  />
                    
                </div>
                
                
           
                {showMintButton && (
                    // <button type="button" onClick={mintHandler} className="button-style">
                    //   Mint [0.001ETH]
                    // </button>
                    // <div className="card flex-1 items-center justify-center bg-primary-focus">
                    // <input className="text-center text-primary-content" onClick={mintHandler} type="submit" value="Mint [0.001ETH]"/>
                    // </div>
                    <div className="card flex-1 items-center justify-center bg-error">
                      <input className="text-center text-error-content" type="submit" value="Minting Soon" disabled/>
                      
                    </div>
                )}
                
                </form>
                </div>
                </div>
);
}
                
export default App;

