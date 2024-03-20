import { NFTStorage, File } from 'nft.storage'
import axios from 'axios';

interface IData {
  name: string;
  description: string;
  image: string; 
}

const ipfsGateways = ['https://ipfs.io/ipfs/', 'https://cloudflare-ipfs.com/ipfs/', 'https://infura-ipfs.io/ipfs/'];

export const uploadFallbackImage = async (imageUrl: string) => {
  
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to fetch the fallback image.');
      
      const imageBlob = await response.blob();
      const imageFile = new File([imageBlob], "fallback-image.jpeg", { type: "image/jpeg" });
      
      const nftstorage = new NFTStorage({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGMzQzUyQjZENkIwOUZkMDhhM0ZFZTMzRjEzMTAxMmI2MjMzMjIyYTAiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcwNzkyMjAwMjE5MSwibmFtZSI6IkltYWdpbkFJcnkgTkZUcyJ9.ylRydZfHxz3uoMDElCTqbMwokS5NObFh8s3_-FFOnoQ" })
      const metadata = await nftstorage.store({
        image: imageFile,
        name: "Proof Of Mint",
        description: "This NFT was minted as a Proof Of Mint ImaginAIryNFTs.",
      });
      
      // Construct the URL to the uploaded image's metadata on IPFS
      const metadataUrl = `https://ipfs.io/ipfs/${metadata.ipnft}/metadata.json`;
      //console.log(metadata)
      return metadataUrl;
      
    } catch (error) {
      console.error("Error uploading fallback image:", error);
      
      throw error;
    }
  };


const base64ToBlob = (base64: string, contentType: string): Blob => {
    const byteCharacters = atob(base64.replace(/^data:image\/(jpeg|png|gif|bmp);base64,/, ''));
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
}

const uploadToPinata = async (file: Blob | File, fileName: string, pinataApiKey: string, pinataSecretApiKey: string): Promise<string> => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    let formData = new FormData();
    formData.append('file', file, fileName);

    const response = await axios.post(url, formData, {
      maxBodyLength: Infinity,
      headers: {
          'pinata_api_key': pinataApiKey,
          'pinata_secret_api_key': pinataSecretApiKey,
      },
  });
  

    return response.data.IpfsHash;
};

export const uploadImage = async (imageData: string | Blob, name: string, description: string): Promise<string> => {
  const pinataApiKey = '1360d97c1d3ff7d0bc15';
    const pinataSecretApiKey = 'aacd9933fff760aecc9d5bcd58345962baf43c1889b42b80ba9dde4e5f7e90d8';

    // Convert base64 to Blob if imageData is in base64 format
    let imageBlob;
    if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
      imageBlob = base64ToBlob(imageData, 'image/jpeg');
      } else if (imageData instanceof Blob) {
          // Assuming imageData is already a Blob or binary data
          imageBlob = imageData;
      } else {
          throw new Error('Invalid imageData type');
      }

    // Step 1: Upload the image
    const imageHash = await uploadToPinata(imageBlob, 'image.jpeg', pinataApiKey, pinataSecretApiKey);

    // Step 2: Create and upload metadata JSON
    const metadata = {
        name: name,
        description: description,
        image: `ipfs://${imageHash}`,
    };
    const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    const metadataFileName = `${name.replace(/\s+/g, '_')}_metadata.json`; // Create a filename for the metadata
    const metadataHash = await uploadToPinata(metadataBlob, metadataFileName, pinataApiKey, pinataSecretApiKey);

    // Step 3: Return the URL to the metadata JSON on IPFS
    const metadataUrl = `https://ipfs.io/ipfs/${metadataHash}`;
    //console.log(metadataUrl);
    return metadataUrl;
};
export const getImageSrc = (ipfsLink: string) => {
  const cid = ipfsLink?.replace('ipfs://', '');
  const gateway = ipfsGateways[Math.floor(Math.random() * ipfsGateways.length)];
  return `${gateway}${cid}`;
};

const preloadImage = (src: string) => {
  const img = new Image();
  img.src = src;
};
export const readNFTData = async (tokenUri: string): Promise<IData> => {
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
    return { name: '', description: '', image: '' };
  }
};  

export const createTwitterShareUrl = (item: IData) => {
  const tweetBase = `✨ A Fusion of Art & AI! Discover our latest ImaginAIryNFT creation. 🌌🤖\n\n`;
  const tweetBody = `🔹 Name: "${item.name}"\n🔹 Essence: "${item.description}"\n\nExplore the art of tomorrow, today. #AINFTs #ImaginAIryNFTs\n`;
  // Optional: Add a URL to view the NFT, if available
  //const websiteUrl = encodeURIComponent('https://www.imaginairynfts.com/your-nft-path'); // Adjust the path as necessary

  const tweetText = encodeURIComponent(`${tweetBase}${tweetBody}`); // If you're including a link
  // const tweetText = encodeURIComponent(`${tweetBase}${tweetBody}`); // If not including a direct link

  return `https://twitter.com/intent/tweet?text=${tweetText}`;
};