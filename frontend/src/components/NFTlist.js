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

  function ModalNFT({ selectedNFT, closeModal }) {
  return (
    <div className="fixed inset-0 z-20 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={closeModal}></div>

        <div className="bg-base-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl transform transition-all my-8 max-w-lg w-full">
          <div className="p-5">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-medium dark:text-white">
                {selectedNFT.name}
              </h3>
              <button onClick={closeModal} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" aria-label="close">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
              </button>
            </div>
            <div className="mt-2">
              <img src={getImageSrc(selectedNFT.image)} alt="NFT" className="mx-auto rounded-lg"/>
              <p className="mt-4  dark:text-gray-400">
                {selectedNFT.description}
              </p>
            </div>
          </div>
          <div className="flex justify-center p-6">
            <button type="button" onClick={closeModal} className="bg-primary-focus text-primary-content hover:bg-primary hover:text-white text-lg font-semibold leading-none rounded-full py-3 px-8">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
  return (
    <div className="px-4 sm:px-6 lg:px-8">
    <h1 className="text-5xl font-extrabold text-secondary my-8 text-center">My minted NFTs:</h1>
    {account ? (
      <>
        {loading && dataArray.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <ClipLoader color="#4A90E2" loading={loading} size={150} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {dataArray?.map((item, index) => (
              <div key={index} className="overflow-hidden shadow-lg rounded-lg h-auto w-full bg-base-100 hover:shadow-xl transition-shadow duration-300 ease-in-out">
                <div className="w-full block h-full">
                  <img alt="NFT Image" src={getImageSrc(item.image)} className="max-h-60 w-full object-cover"/>
                  <div className=" dark:bg-gray-800 w-full p-4">
                    <h3 className="text-primary text-2xl font-semibold mb-2 text-center">
                      {item?.name ? truncateText(item.name, 20) : 'NFT Name Unavailable'}
                    </h3>
                    <div className="flex justify-center mt-4">
                      <button onClick={() => openModal(item)} className="bg-primary-focus text-primary-content hover:bg-primary hover:text-white text-lg font-semibold leading-none rounded-full py-3 px-8">
                        Show Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    ) : (
      <div className="flex justify-center items-center h-64">
        <span className="text-error-content bg-error p-4 rounded-lg">Please connect your Wallet</span>
      </div>
    )}
    {selectedNFT && (
      <ModalNFT selectedNFT={selectedNFT} closeModal={closeModal} />
    )}
    <ToastContainer />
  </div>
  );
}

export default NFTlist;
