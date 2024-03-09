import { NFTStorage, File } from 'nft.storage'


export const uploadFallbackImage = async (imageUrl: string) => {
  
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to fetch the fallback image.');
      
      const imageBlob = await response.blob();
      const imageFile = new File([imageBlob], "fallback-image.jpeg", { type: "image/jpeg" });
      
      const nftstorage = new NFTStorage({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGMzQzUyQjZENkIwOUZkMDhhM0ZFZTMzRjEzMTAxMmI2MjMzMjIyYTAiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcwNzkyMjAwMjE5MSwibmFtZSI6IkltYWdpbkFJcnkgTkZUcyJ9.ylRydZfHxz3uoMDElCTqbMwokS5NObFh8s3_-FFOnoQ" })
      const metadata = await nftstorage.store({
        image: imageFile,
        name: "Fallback Image",
        description: "This NFT was minted as a fallback due to an issue generating the original image.",
      });
      
      // Construct the URL to the uploaded image's metadata on IPFS
      const metadataUrl = `https://ipfs.io/ipfs/${metadata.ipnft}/metadata.json`;
      
      return metadataUrl;
      
    } catch (error) {
      console.error("Error uploading fallback image:", error);
      
      throw error;
    }
  };


  export const uploadImage = async (imageData:string, name:string, description:string ) => {
    
    const nftstorage = new NFTStorage({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGMzQzUyQjZENkIwOUZkMDhhM0ZFZTMzRjEzMTAxMmI2MjMzMjIyYTAiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcwNzkyMjAwMjE5MSwibmFtZSI6IkltYWdpbkFJcnkgTkZUcyJ9.ylRydZfHxz3uoMDElCTqbMwokS5NObFh8s3_-FFOnoQ" })
    // Send request to store image
    const { ipnft } = await nftstorage.store({
      image: new File([imageData], "image.jpeg", { type: "image/jpeg" }),
      name: name,
      description: description,
    })
    const url = `https://ipfs.io/ipfs/${ipnft}/metadata.json`
    return url
    
  }