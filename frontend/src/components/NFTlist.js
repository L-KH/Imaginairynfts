import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import NFT from '../abis/NFT2.json'
import config from './config.json';
import { ClipLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function NFTlist() {
  const [provider, setProvider] = useState(null)
  const [nft, setNFT] = useState(null)
  const [dataArray, setDataArray] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState();
  useEffect(() => {
    loadBlockchainData();
  }, []);

  const ipfsGateways = ['https://ipfs.io/ipfs/', 'https://cloudflare-ipfs.com/ipfs/', 'https://infura-ipfs.io/ipfs/'];


  const getImageSrc = (ipfsLink) => {
    const cid = ipfsLink?.replace('ipfs://', '');
    const gateway = ipfsGateways[Math.floor(Math.random() * ipfsGateways.length)];
    return `${gateway}${cid}`;
  };
  const allowedChains = [534353, 57000, 5, 10, 59140, 167005, 570, 59144, 8453, 534352]; 
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
        return; // If the switch to Goerli failed, don't try to load the NFT contract
      }
    }
    // Check the network again after attempting to switch
    const switchedNetwork = await provider.getNetwork();
    const nft = new ethers.Contract(config[switchedNetwork.chainId].nft.address, NFT, provider);
    setNFT(nft);
  };



  useEffect(() => {
    if(nft && provider) {
      setLoading(true);
      fetchNFTlist();
    }
  }, [nft, provider]);

  const fetchNFTlist = async () => {
    try {
      const signer = await provider.getSigner();
      const account = await signer.getAddress();
      const tokenIds = await nft.connect(signer).tokensOfOwner(account);
      setAccount(account)

      // Fetch metadata concurrently
    const promises = tokenIds.map(tokenId =>
      nft.connect(signer).tokenURI(tokenId)
        .then(uri => readNFTData(uri))
        .catch(error => {
          console.error(`Failed to fetch metadata for tokenId ${tokenId}:`, error);
          return { name: 'NFT Name Unavailable', description: 'Description Unavailable', image: 'default_image_url' }; // Provide fallback values
        })
    );
    const nfts = await Promise.all(promises);

    // Filter out any undefined or null NFTs that might have resulted from failed metadata fetches
    const validNfts = nfts.filter(nft => nft !== undefined && nft !== null);

    setDataArray(validNfts);
    setLoading(false);
    } catch (error) {
      console.log(error)
    }
  };
  const preloadImage = (src) => {
    const img = new Image();
    img.src = src;
  };




  const readNFTData = async (tokenUri) => {
    try {
      // Convert IPFS URL to a web gateway URL
      const ipfsGatewayUrl = tokenUri.replace('ipfs://', 'https://ipfs.io/ipfs/');
      // Use CORS proxy
      const proxiedUrl = 'https://corsproxy.io/?' + encodeURIComponent(ipfsGatewayUrl);
  
      const response = await axios.get(proxiedUrl);
      const data = response.data;
      preloadImage(getImageSrc(data.image));
      return { name: data.name, description: data.description, image: data.image };
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const openModal = (nft) => {
    setSelectedNFT(nft);
  }

  const closeModal = () => {
    setSelectedNFT(null);
  }
  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };
  return (
    <div>
      <h1 className="text-4xl font-extrabold text-secondary">My minted NFTs:</h1>
      {account ? (<>
        {loading && dataArray.length === 0 ? (
        <div className="flex justify-center items-center">
          <ClipLoader color="#4A90E2" loading={loading} size={150} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 font-semibold sm:grid-cols-2 md:grid-cols-4">
        {dataArray?.map((item, index) => (
          <div key={index} className="card flex-1 items-center justify-center border border-base-300 bg-base-100 p-4 m-2">
          <h3 className="text-2xl font-bold text-primary mb-2">{item?.name ? truncateText(item.name, 20) : 'NFT Name Unavailable'}</h3>
            <div className="mt-4 mb-4">
              <img
                className="mx-auto"
                src={getImageSrc(item.image)}
                alt="Image"
                width={200}
                height={200}
              />
            </div>
            <div className="nftlist card flex-1 items-center justify-center bg-primary-focus mb-4">
              <input onClick={() => openModal(item)} className="hover:bg-sky-500 nftlist text-center justify-center text-primary-content px-14 py-2 sm:w-auto sm:text-sm" type="button" value="Show Details"/>
            </div>
            </div>
        ))}
        
      </div>
      )}
      </>

      ):(
        <>
        <div className="card flex-1 items-center justify-center bg-error">
                      <span className="text-center text-error-content" type="submit" >Please connect your Wallet</span>
                    </div>
        </>
      )
      }
      {selectedNFT && (
  <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div className="fixed inset-0 bg-base-100 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModal}></div>
      <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      <div className="inline-block align-bottom bg-base-100 rounded-lg text-center overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div className="card flex-1 items-center justify-center bg-base-100">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center ">
                <h3 className="text-2xl font-bold text-primary mb-2 content-center " id="modal-title">
                  {selectedNFT.name}
                </h3>
                <div className="mt-2">
                  <img src={getImageSrc(selectedNFT.image)} alt="NFT" className="mx-auto mb-5 "/>
                  <h3 className="text-lg" ><b>Description:</b></h3>
                  <p className="mb-5 text-lg text-left">
                     {selectedNFT.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className='nftlist'>
            <div className="card flex-1 items-center justify-center bg-base-content mb-4">
              <input className="nftlist hover:bg-sky-500 text-center justify-center text-base-100 px-14 py-2" type="button" onClick={closeModal} value="Close"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
      <ToastContainer />

    </div>
  );
}

export default NFTlist;
