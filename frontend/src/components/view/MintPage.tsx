"use client";
import React, { memo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Modal from "@/components/extras/Modal";
import styles from "@/components/assets/styles/css/mintPage.module.css";
import { useAccount } from "wagmi";
import { Mint } from '@/Hooks/WriteContract';
import { WalletConnecting } from "@/components/extras/WalletConnecting";
import logo from '@/components/assets/logo-bg.png'
import { apiUrlMap } from '@/constants/config';
import { getMagicPrompt, createImageWithDALLE, createImageWithStableDiffusion, createImage } from '@/services/openaiService'





const MintPage = () => {
  const { address, isConnecting, isDisconnected } = useAccount();
  const [open, setOpen] = useState<boolean>(false);
  const [txError, setTxError] = useState<boolean>(false)
  const [IsLoading, setIsLoading] = useState<boolean>(false)
  const [IsLoadingWithdraw, setIsLoadingWithdraw] = useState<boolean>(false)
  const [IsConfirmedTx, setIsConfirmedTx] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState('');
  const [isFaild, setIsFaild] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>('');
  const [selectedModel, setSelectedModel] = useState('openjourney V4');
  const [apiUrl, setApiUrl] = useState(apiUrlMap['openjourney V4']);
  const [image, setImage] = useState('https://raw.githubusercontent.com/L-KH/ARB-Airdrop-Checker/main/logo_imaginairy_alternative%20(1).png')

  const handleGeneratePrompt = async () => {
    const generate = await getMagicPrompt(prompt)
    setPrompt(generate);
  };

  const handleGenerateImage = async () => {
    const data = await createImage(apiUrl, prompt)
    if(data){
      setImage(data?.image)
    } else{
      setIsFaild(true)
    }
    
    console.log(data, 'Generating image...');
    // Set the generatedImage state to a URL of the generated image (replace with your actual image generation logic)
    setGeneratedImage('https://via.placeholder.com/150');
  };

  const handleMintImage = () => {
    // Placeholder function for minting the image
    console.log('Minting image...');
    // Implement minting logic here
  };

  const changeModel = (modelName:string) => {
    setSelectedModel(modelName);
    setApiUrl(apiUrlMap[modelName]);
   };

  return (
    <div className={"pt-20 md:px-20 px-8"}>


      <div className="flex flex-col gap-16 pt-10 pb-10">
        {address ?
          <div>
            <div className="flex flex-col md:flex-row items-center justify-center  p-4">
              {true && (
                <div className="mb-4 md:mb-0 md:mr-4 flex-shrink-0 border border-gray-400 shadow-lg rounded-lg overflow-hidden" style={{ width: '256px', height: '256px' }}>
                  <Image src={image} alt="Generated" width={512} height={512} layout="responsive" className="object-cover rounded-lg" />
                </div>
              )}

              <div className="flex flex-col items-center w-full max-w-md">
                <div className="p-6 bg-white shadow-md rounded-lg">
                <div className="mb-4">
                  <label htmlFor="model-select" className="block text-sm font-medium text-gray-700">Choose AI Model</label>
                  <select
                    id="model-select"
                    value={selectedModel}
                    onChange={(e) => changeModel(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                  >
                    {Object.entries(apiUrlMap).map(([modelKey, modelUrl]) => (
                      // Excluding options based on condition if needed, otherwise just render the option
                      <option key={modelKey} value={modelKey}>{modelKey.replace(/-/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())}</option>
                    ))}
                  </select>
                </div>

                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Enter image name" />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">Prompt</label>
                    <textarea id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Enter prompt or generate using AI"></textarea>
                  </div>

                  <div className="flex space-x-4 mb-4">
                    <button onClick={handleGeneratePrompt} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Generate Prompt</button>
                    <button onClick={handleGenerateImage} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">Generate Image</button>
                  </div>

                  <button onClick={handleMintImage} className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">Mint Image</button>
                </div>
              </div>
            </div>









            {/* <button
                  disabled={!address}
                  onClick={() => setOpen(true)}
                  className={`disabled:opacity-50 disabled:bg-base-200 disabled:shadow-none disabled:cursor-not-allowed disabled:text-accent flex flex-row w-full btn btn-primary hover:bg-transparent shadow-3xl border border-primary rounded-none min-h-0 h-10 px-5 hover:bg-opacity-10 hover:shadow-none ${styles.add_remove_lock_btn}`}
                >
                  
                  <div>create lock</div>
                </button> */}

            <Modal
              id={"choose_pool"}
              className={"w-full"}
              open={open}
              setOpen={() => setOpen(false)}
            >
              <button
                disabled={!address}
                onClick={() => setOpen(true)}
                className={`disabled:opacity-50 disabled:bg-base-200 disabled:shadow-none disabled:cursor-not-allowed disabled:text-accent flex flex-row w-full btn btn-primary hover:bg-transparent shadow-3xl border border-primary rounded-none min-h-0 h-10 px-5 hover:bg-opacity-10 hover:shadow-none ${styles.add_remove_lock_btn}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.35568 1.16947C8.46367 0.888431 7.51004 0.959024 6.66358 1.3657C5.81891 1.77151 5.14227 2.48175 4.73794 3.36109C4.51254 3.85129 4.44045 4.44516 4.4143 5.00608C4.39562 5.4067 4.39961 5.84098 4.4034 6.25424C4.40343 6.25838 4.40347 6.26254 4.40351 6.26667H3.66683C2.93045 6.26667 2.3335 6.86362 2.3335 7.6V13.6C2.3335 14.3364 2.93045 14.9333 3.66683 14.9333H12.3335C13.0699 14.9333 13.6668 14.3364 13.6668 13.6V7.6C13.6668 6.86362 13.0699 6.26667 12.3335 6.26667H12.057C12.054 5.69363 12.042 5.12933 11.994 4.62161C11.9345 3.99026 11.813 3.35236 11.5158 2.87553C11.0066 2.05881 10.2461 1.45001 9.35568 1.16947ZM10.857 6.26667C10.8539 5.7072 10.8423 5.18987 10.7994 4.73436C10.7429 4.13576 10.6386 3.7368 10.4974 3.51038C10.1298 2.92059 9.59511 2.50305 8.99509 2.31401C8.39663 2.12546 7.75758 2.1714 7.18324 2.44734C6.6071 2.72414 6.12364 3.21989 5.82821 3.86241C5.70372 4.13314 5.63764 4.5334 5.613 5.06196C5.59595 5.42756 5.59947 5.8071 5.60316 6.20517C5.60335 6.22562 5.60354 6.24612 5.60373 6.26667H10.857ZM3.66683 7.46667H12.3335C12.4071 7.46667 12.4668 7.52637 12.4668 7.6V13.6C12.4668 13.6736 12.4071 13.7333 12.3335 13.7333H3.66683C3.59319 13.7333 3.5335 13.6736 3.5335 13.6V7.6C3.5335 7.52637 3.59319 7.46667 3.66683 7.46667Z"
                    fill="black"
                  />
                  <path
                    d="M8.32893 10.878C8.71971 10.742 9.00016 10.3704 9.00016 9.93333C9.00016 9.38104 8.55245 8.93333 8.00016 8.93333C7.44788 8.93333 7.00016 9.38104 7.00016 9.93333C7.00016 10.3704 7.28061 10.742 7.6714 10.878C7.66839 10.896 7.66683 10.9145 7.66683 10.9333V11.9333C7.66683 12.1174 7.81607 12.2667 8.00016 12.2667C8.18426 12.2667 8.3335 12.1174 8.3335 11.9333V10.9333C8.3335 10.9145 8.33193 10.896 8.32893 10.878Z"
                    fill="black"
                  />
                </svg>
                <div>Mint Image process ...</div>
              </button>

            </Modal>

          </div>





          : <div><WalletConnecting className="flex content-center gap-4" BtnClassName="" /></div>}
      </div>
    </div>
  );

};

export default MintPage;