"use client";
import React, { memo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Modal from "@/components/extras/Modal";
import styles from "@/components/assets/styles/css/mintPage.module.css";
import { useAccount,  } from "wagmi";
import { useMint } from '@/Hooks/WriteContract';
import { WalletConnecting } from "@/components/extras/WalletConnecting";
import logo from '@/components/assets/logo-bg.png'
import { apiUrlMap, addresses } from '@/constants/config';
import { getMagicPrompt, createImageWithDALLE, createImageWithStableDiffusion, createImage } from '@/services/openaiService'
import {uploadImage, uploadFallbackImage} from '@/services/ipfsUploader'
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




const MintPage = () => {
  const { address, isConnecting, isDisconnected } = useAccount();

  const { handleMint} = useMint();
  const logoUrl = 'https://raw.githubusercontent.com/L-KH/ARB-Airdrop-Checker/main/logo_imaginairy_alternative%20(1).png'
  const [open, setOpen] = useState<boolean>(false);
  const [txError, setTxError] = useState<boolean>(false)
  const [IsLoading, setIsLoading] = useState<boolean>(false)
  const [IsLoadingMint, setIsLoadingMint] = useState<boolean>(false)
  const [IsLoadingUpload, setIsLoadingUpload] = useState<boolean>(false)
  const [IsConfirmedTx, setIsConfirmedTx] = useState<string>('success')
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

  const handleGeneratePrompt = async () => {
    const generate = await getMagicPrompt(prompt)
    setPrompt(generate);
  };

  const handleGenerateImage = async () => {
    try {
      setIsLoading(true)
      const data = await createImage(apiUrl, prompt)
    if(data !== null && data !== undefined){
      setImage(data?.image)
    } else{
      setIsFaild(true)
      setImage(logoUrl)
    }
    setIsLoading(false)
    } catch (error) {
      console.log(error)
      setIsLoading(false)
    }
  };

  const handleMintImage = async () => {
    try {
      setIsLoadingUpload(true)
      setIsLoadingMint(true)
      setIsConfirmedTx('loading')
      const url = image === logoUrl ? await uploadFallbackImage(logoUrl) : await uploadImage(image, name, description);
      setIsLoadingUpload(false)
      const hash =  handleMint(url)
      console.log(hash,url,  'tx hash & uri');
    } catch (error) {
      console.log('error stake NFT ', error);
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
    <div className={"pt-10 md:px-10 px-2"}>


      <div className="flex flex-col gap-16 pt-10 pb-10">

          <div>
            <div className="flex flex-col md:flex-row items-center justify-center  p-4">
              {true && (
                <div className="mb-4 md:mb-0 md:mr-4 flex-shrink-0 border border-gray-300 shadow-lg rounded-lg overflow-hidden w-full max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl">
                <Image src={image} alt="Generated" width={512} height={512} layout="responsive" className="w-full h-auto object-cover rounded-lg" />
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

                  <div className="flex space-x-4 mb-4">
                    <button onClick={handleGeneratePrompt} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Generate Prompt</button>
                    <button onClick={handleGenerateImage} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">Generate Image</button>
                  </div>

                  <button onClick={() => {setOpen(true);handleMintImage()}} className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">Mint Image</button>
                  
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
                <span>Upload Image to IPFS </span>
                {IsLoadingUpload ? <IconLoading /> : !txError ? (
                  <IconCheck />
                ) : (
                  <IconError />
                )}
              </div>
              <div className="w-full  border-b flex items-center py-4 justify-between px-3">
                <span>Mint NFT </span>
                {IsLoadingMint ? <IconLoading /> : !txError ? (
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