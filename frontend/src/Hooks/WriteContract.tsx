import { useWriteContract  } from 'wagmi';
import NFT from './abi/NFT2.json';
import {config} from '@/constants/config'
import {useAccount} from "wagmi";
import { parseUnits } from 'viem';

//const contractAddress = CONTRACT_ADDRESS_TESTNET[4690]
export const Mint = () => {
  const account = useAccount();
 
  
  let NFTAddress: `0x${string}`;

  if (account.chain?.id) {
    NFTAddress  = config[account.chain?.id].nft.address
    const { data: hash, writeContract } = useWriteContract();
  
    const handleMint = (account: string, amount: number, price: string) => {
      
        writeContract({
          address: NFTAddress as `0x${string}`,
          abi: NFT,
          functionName: 'mint',
          args: [],
          value: parseUnits("0.001", 18)
        });
      
    };
     return { hash, handleMint };  
 
  } else {
    console.error("Unsupported chain ID or chain ID is missing from the config.");
  }
   
};
