import { writeContract } from '@wagmi/core'
import NFT from './abi/NFT2.json';
import {config} from '@/constants/config'
import {useAccount} from "wagmi";
import { parseUnits } from 'viem';
import { wagmiConfig } from './config'

//const contractAddress = CONTRACT_ADDRESS_TESTNET[4690]

export const useMint = () => {
  const account = useAccount();
  console.log(account)
  const handleMint = async (tokenURI: string) => {
    const chainId = account.chain?.id;
    if (!chainId || !config[chainId]?.nft?.address) {
      console.error("Unsupported chain ID or chain ID is missing from the config.");
      return;
    }

    const NFTAddress = config[chainId].nft.address;
    const result = await writeContract(wagmiConfig,{
      address: NFTAddress as `0x${string}`,
      abi: NFT,
      functionName: 'mint',
      args: [tokenURI],
      value: parseUnits("0.001", 18)
    });

    return result;
  };

  return { handleMint };
};