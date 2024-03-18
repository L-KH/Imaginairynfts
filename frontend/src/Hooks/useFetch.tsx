import { readContract } from '@wagmi/core'
import NFT from './abi/NFT2.json';
import {addresses} from '@/constants/config'
import {useAccount} from "wagmi";
import { parseUnits } from 'viem';
import { config } from '@/components/Layout/Web3Wrapper'

//const contractAddress = CONTRACT_ADDRESS_TESTNET[4690]

export const useFetch = () => {
  const account = useAccount();
  const chainId = account.chain?.id;
    if (!chainId || !addresses[chainId]?.nft?.address) {
      console.error("Unsupported chain ID or chain ID is missing from the config.");
      return;
    }
  const NFTAddress = addresses[chainId].nft.address;
  const fetchBalance = async () => {
    try {
      const nftsBalance = await readContract(config, {
        address: NFTAddress as `0x${string}`,
        abi: NFT,
        functionName: 'tokensOfOwner',
        args: [account.address],
      })
      return nftsBalance as any[]
    } catch (error) {
      console.log(error)
      return []
    }
  };
  const fetchTokenURI = async (tokenId: number): Promise<string | undefined> => {
    try {
      const uri = await readContract(config, {
        address: NFTAddress as `0x${string}`,
        abi: NFT,
        functionName: 'tokenURI',
        args: [tokenId],
      });
      return uri as string;
    } catch (error) {
      console.error('Error fetching token URI', error);
      return ''
    }
  };
  const fetchBatchTokenURIs = async (currentPage: number, nftsBalance: any[] ) => {
    const PAGE_SIZE = 9;
    const startIndex = currentPage * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, nftsBalance.length);

    try {
      const urisPromises = nftsBalance.slice(startIndex, endIndex).map(fetchTokenURI);
      const uris = await Promise.all(urisPromises);
      return uris.filter((uri): uri is string => !!uri);
    } catch (error) {
      console.error('Error fetching batch of token URIs', error);
      return []
    } 
  };

  return { 
    fetchBalance,
    fetchBatchTokenURIs,

   };
};