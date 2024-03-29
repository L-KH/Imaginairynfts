import { writeContract } from '@wagmi/core'
import NFT from './abi/NFT2.json';
import {addresses} from '@/constants/config'
import {useAccount} from "wagmi";
import { parseUnits } from 'viem';
import { config } from '@/components/Layout/Web3Wrapper'

//const contractAddress = CONTRACT_ADDRESS_TESTNET[4690]

export const useMint = () => {
  const account = useAccount();
  
  const handleMint = async (tokenURI: string) => {
    const chainId = account.chain?.id;
    if (!chainId || !addresses[chainId]?.nft?.address) {
      console.error("Unsupported chain ID or chain ID is missing from the config.");
      return;
    }

    const NFTAddress = addresses[chainId].nft.address;
    try {
      const result = await writeContract(config,{
        address: NFTAddress as `0x${string}`,
        abi: NFT,
        functionName: 'mint',
        args: [tokenURI],
        value: parseUnits("0.00005", 18)
      });
  
      return result;
    } catch (error) {
      console.log(error)
    }
    
  };

  return { handleMint };
};