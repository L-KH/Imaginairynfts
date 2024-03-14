"use client";
import React, { useEffect, useState } from "react";
import { Spinner, useTabs } from "@material-tailwind/react";
import Image from "next/image";
import Modal from "@/components/extras/Modal";
import { useAccount, useBalance, useBlockNumber} from "wagmi";
import { useMint } from '@/Hooks/WriteContract';
import { apiUrlMap, addresses } from '@/constants/config';
import { getMagicPrompt, createImageWithDALLE, createImageWithStableDiffusion, createImage, createImageWithEdenAI, generateImageReplicate } from '@/services/openaiService'
import {uploadImage, uploadFallbackImage} from '@/services/ipfsUploader'
import { useQueryClient } from '@tanstack/react-query' 
import {
  IconLoading,
  IconCheck,
  IconError,
  IconArrowDown,
  IconSetting,
  IconArrowLeft,
} from "@/components/icons";
import {
  TransactionFail,
  TransactionSuccess,
} from "@/components/extras/TransactionStatus";
import { formatEther } from "viem";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MintPage = () => {
  const { address, isConnecting, isDisconnected } = useAccount();
 
  const { handleMint} = useMint();
  const logoUrl = 'https://raw.githubusercontent.com/L-KH/ARB-Airdrop-Checker/main/ImaginAIry_NFTs.png'
  const [open, setOpen] = useState<boolean>(false);
  const [txError, setTxError] = useState<boolean>(false)
  const [IsLoading, setIsLoading] = useState<boolean>(false)
  const [IsLoadingMint, setIsLoadingMint] = useState<boolean>(false)
  const [IsLoadingPrompt, setIsLoadingPrompt] = useState<boolean>(false)
  const [IsLoadingUpload, setIsLoadingUpload] = useState<boolean>(false)
  const [IsConfirmedTx, setIsConfirmedTx] = useState<string>('loading')
  const [errorMsg, setErrorMsg] = useState('');
  const [isFaild, setIsFaild] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>('');
  const [selectedModel, setSelectedModel] = useState('openjourney V4');
  const [apiUrl, setApiUrl] = useState(apiUrlMap['openjourney V4']);
  const [image, setImage] = useState(logoUrl)
  const [description, setDescription] = useState("")
  const [account, setAcount] = useState<`0x${string}`>('0x')
  const { data: balance, queryKey } = useBalance({address: account})
  const queryClient = useQueryClient()
  const { data: blockNumber } = useBlockNumber({ watch: true }) 
  const [useEdenAI, setUseEdenAI] = useState(false);
  const [useReplicate, setUseReplicate] = useState(false);


  useEffect(() => { 
    queryClient.invalidateQueries({ queryKey }) 
  }, [blockNumber])
  useEffect(() => { 
    if(address){
      setAcount(address)
    }
    
  }, [address])


  const handleGeneratePrompt = async () => {
    setIsLoadingPrompt(true)
    const generate = await getMagicPrompt(prompt)
    setPrompt(generate);
    setIsLoadingPrompt(false)
  };

  const handleGenerateImage = async () => {
    try {
      setIsLoading(true);
      let imageSrc = null; // This will hold either a base64 string or a URL
      if (selectedModel === 'DALLE') {
        // Assuming createImageWithDALLE returns a base64 string directly
        const base64Image = await createImageWithDALLE(prompt);
        if (base64Image) {
          // If it's a base64 string, prepend the necessary data URI scheme
          imageSrc = `data:image/png;base64,${base64Image}`;
        }
      } else if (selectedModel === 'EdenAI') {
        // Assuming createImageWithEdenAI returns the URL directly
        imageSrc = await createImageWithEdenAI(prompt);
      } else if (selectedModel === 'Replicate') {
        // Assuming generateImageReplicate returns the URL directly
        imageSrc = await generateImageReplicate(prompt);
      } else {
        // Fetch the model URL from apiUrlMap for other models
        const modelUrl = apiUrlMap[selectedModel];
        // Call your existing createImage or similar function
        const data = await createImage(modelUrl, prompt);
        imageSrc = data?.image; // Assuming this returns a URL
      }
  
      if (imageSrc) {
        setImage(imageSrc); // Use setImage to update state regardless of source type
      } else {
        setIsFaild(true); // Assuming there's a typo in setIsFaild, correcting to setIsFailed
        setImage(logoUrl); // Fallback to logoUrl if image generation fails
      }
    } catch (error) {
      console.error(error);
      setIsFaild(true); // Correcting possible typo here as well
      toast.error((error instanceof Error ? error.message : null) || 'An unexpected error occurred while generating the image.');
      setImage(logoUrl); // Fallback to logoUrl on error
    } finally {
      setIsLoading(false);
    }
  };


  const handleMintImage = async () => {
    try {
      setIsLoadingUpload(true)
      setIsLoadingMint(true)
      setIsConfirmedTx('loading')
      const url = image === logoUrl ? await uploadFallbackImage(logoUrl) : await uploadImage(image, name, description);
      setIsLoadingUpload(false)
      const hash = await handleMint(url)
      if (!hash) throw new Error("Failed to approve token A");
      setTxHash(hash)
      setIsLoadingMint(true)
      //console.log(hash,url,  'tx hash & uri');
      setIsConfirmedTx('success')
      setTimeout(() => {
        setOpen(false);
      }, 5000);
    } catch (error) {
      //console.log('error stake NFT ', error);
      if (error instanceof Error) {
        setErrorMsg(error.toString());
      } else if (typeof error === 'string') {
        setErrorMsg(error);
      } else {
        setErrorMsg('An unknown error occurred');
      }
      setIsLoadingMint(false)
      setTxError(true)
      setIsConfirmedTx('rejected')
      setTimeout(() => {
        setOpen(false);
      }, 5000);
    }
  };

  const changeModel = (modelName:string) => {
    setSelectedModel(modelName);
    setApiUrl(apiUrlMap[modelName]);
   };

  return (
<div className={"pt-10 px-2 md:px-10"}>
<ToastContainer />



      <div className="flex flex-col gap-16 pt-10 pb-10">

          <div>
            <div className="flex flex-col md:flex-row items-center justify-center  p-4">
              {true && (
                <div className="mb-4 md:mb-0 md:mr-4 flex-shrink-0 border border-gray-300 shadow-lg rounded-lg overflow-hidden w-full md:max-w-md lg:max-w-lg xl:max-w-xl">
                {IsLoading ? 
                <div className="relative  items-center block "> 
                  <Image src={image} alt="Generated" width={512} height={512} layout="responsive" className="w-full h-auto object-cover rounded-lg opacity-40" />
                  <div role="status" className="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2">
                  <Spinner className="h-10 w-10 text-sky-900/50 animate-spin " />
                  </div>
                </div>
               
                : 
                <Image src={image} alt="Generated" width={512} height={512} layout="responsive" className="w-full h-auto object-cover rounded-lg" />
                }
              </div>
              )}

              <div className="flex flex-col items-center w-full max-w-md ">
                <div className="p-6 bg-white/50 backdrop-blur-sm rounded-lg md:backdrop-blur-md lg:backdrop-blur-lg">
                <div className="mb-4">
                  <label htmlFor="model-select" className="block text-sm font-medium text-gray-700">Choose AI Model</label>
                  <select 
                    id="model-select"
                    value={selectedModel}
                    onChange={(e) => changeModel(e.target.value)}
                    className="mt-1 block w-full pl-3 cursor-pointer focus:outline-none  pr-10 py-2 text-base select select-bordered sm:text-sm rounded-md shadow-sm"
                  >
                    {Object.entries(apiUrlMap).map(([modelKey, modelUrl]) => (
                      // Excluding options based on condition if needed, otherwise just render the option
                        <option key={modelKey} value={modelKey}>{modelKey.replace(/-/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())}</option>
                    ))}
                  </select>
                </div>

                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded-md input input-bordered max-w-xs" placeholder="Enter image name" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">NFT description</label>
                    <input type="text" id="name" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full rounded-md input input-bordered max-w-xs" placeholder="NFT description" />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">Prompt</label>
                    <textarea id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} className="mt-1 textarea textarea-bordered w-full rounded-md sm:text-sm" placeholder="Enter prompt or generate using AI"></textarea>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-2 ">
                    {IsLoadingPrompt ? 
                    <button disabled={true} className="px-4 py-2 w-full flex items-center justify-center text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      <Spinner className="h-4 w-4 text-gray-400/50 animate-spin " />
                      </button>
                    :
                    <button onClick={handleGeneratePrompt} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Generate Prompt</button>
                    }
                    {IsLoading ? 
                    <button disabled={true} className="px-4 py-2 w-full flex items-center justify-center text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                      <Spinner className="h-4 w-4 text-gray-400/50 animate-spin " />
                      </button>
                    :
                    <button onClick={handleGenerateImage} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">Generate Image</button>
                    }
                  </div>

                  <button disabled={isDisconnected && formatEther(balance?.value || BigInt(0))> '0.001'} onClick={() => {setOpen(true);handleMintImage()}} className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                    {isDisconnected? <span>Connect Your Wallet</span>:
                    (parseFloat(formatEther(balance?.value || BigInt(0))) < 0.001 ? 
                    <span>insufficient balnce </span>: <span>Mint NFT</span>
                    )
                    
                    }</button>
                  
                </div>
              </div>
            </div>


            

          </div>






      </div>
    <Modal
      id={"mint"}
      className={"w-full"}
      open={open}
      setOpen={() => setOpen(false)}
      >


      <div
        className="mt-5 flex p-3 flex-wrap w-full"
        onClick={() => setOpen(false)}
      >
        {IsConfirmedTx === "loading" ? (
          <>
            <div className="w-full flex border flex-wrap  ">
              <div className="w-full  border-b flex items-center py-4 justify-between px-3">
                <div className="text-center inline-flex items-center">
                
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 me-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                    />
                  </svg>
                  <span className="font-medium text-sm">Upload Image to IPFS </span>
                </div>
                
                {IsLoadingUpload ? <Spinner className="h-6 w-6 text-green-500/50 animate-spin " /> : !txError ? (
                  <IconCheck />
                ) : (
                  <IconError />
                )}
              </div>
              <div className="w-full  border-b flex items-center py-4 justify-between px-3">
              <span className="font-medium text-sm"> Mint NFT </span>
                {IsLoadingMint ? <Spinner className="h-6 w-6 text-green-500/50 animate-spin " /> : !txError ? (
                  <IconCheck />
                ) : (
                  <IconError />
                )}
              </div>

            </div>
          </>
        ) : IsConfirmedTx === "success" ? (
          <TransactionSuccess
            title={"Mint successful"}
            describe={`Your unique AI-generated image is now successful minted`}
            txid={txHash}
          />
        ) : (
          <TransactionFail msg={errorMsg} />
        )}
      </div>
      </Modal>
    </div>
  );

};

export default MintPage;