import { writeContract, readContract, estimateGas , waitForTransactionReceipt} from '@wagmi/core'
import { useAccount } from 'wagmi'
import NFT from './abi/NFT2.json'
import MARKETPLACE from './abi/MARKETPLACE.json'
import { addresses } from '@/constants/config'
import { parseUnits } from 'viem'
import { config } from '@/components/Layout/Web3Wrapper'
import { ethers } from 'ethers';
import { parseEther } from 'viem';

interface MarketItem {
  itemId: bigint;
  tokenId: bigint;
  seller: string;
  owner: string;
  price: bigint;
  sold: boolean;
}

export const useMint = () => {
  const account = useAccount()

  const handleMint = async (uri: string) => {
    try {
      const chainId = account.chainId || 11155111
      const NFTAddress = addresses[chainId]?.nft?.address

      if (!NFTAddress) {
        throw new Error("NFT address not found")
      }

      const tx = await writeContract(config, {
        address: NFTAddress as `0x${string}`,
        abi: NFT,
        functionName: 'mint',
        args: [uri],
      })

      return tx
    } catch (error) {
      console.error("Error in handleMint:", error)
      throw error
    }
  }

  return { handleMint }
}

export const useListNFT = () => {
  const account = useAccount()

  const checkApproval = async (tokenId: bigint) => {
    try {
      const chainId = account.chainId || 11155111
      const NFTAddress = addresses[chainId]?.nft?.address
      const MarketplaceAddress = addresses[chainId]?.marketplace?.address

      if (!NFTAddress || !MarketplaceAddress) {
        throw new Error("NFT or Marketplace address not found")
      }

      const approvedAddress = await readContract(config, {
        address: NFTAddress as `0x${string}`,
        abi: NFT,
        functionName: 'getApproved',
        args: [tokenId],
      })

      return approvedAddress === MarketplaceAddress
    } catch (error) {
      console.error("Error in checkApproval:", error)
      throw error
    }
  }

  const approveMarketplace = async (tokenId: bigint) => {
    try {
      const chainId = account.chainId || 11155111
      const NFTAddress = addresses[chainId]?.nft?.address
      const MarketplaceAddress = addresses[chainId]?.marketplace?.address

      if (!NFTAddress || !MarketplaceAddress) {
        throw new Error("NFT or Marketplace address not found")
      }

      const tx = await writeContract(config, {
        address: NFTAddress as `0x${string}`,
        abi: NFT,
        functionName: 'approve',
        args: [MarketplaceAddress, tokenId],
      })

      await waitForTransactionReceipt(config, { hash: tx })
      return tx
    } catch (error) {
      console.error("Error in approveMarketplace:", error)
      throw error
    }
  }

  const handleListNFT = async (tokenId: bigint, price: string) => {
    try {
      const chainId = account.chainId || 11155111
      const MarketplaceAddress = addresses[chainId]?.marketplace?.address

      if (!MarketplaceAddress) {
        throw new Error("Marketplace address not found")
      }

      const isApproved = await checkApproval(tokenId)

      if (!isApproved) {
        console.log("Approving marketplace to handle the NFT...")
        await approveMarketplace(tokenId)
      }

      const priceInWei = parseEther(price)

      console.log("Listing NFT...")
      const listTx = await writeContract(config, {
        address: MarketplaceAddress as `0x${string}`,
        abi: MARKETPLACE,
        functionName: 'listItem',
        args: [tokenId, priceInWei],
      })

      await waitForTransactionReceipt(config, { hash: listTx })
      return listTx
    } catch (error) {
      console.error("Error in handleListNFT:", error)
      throw error
    }
  }

  return { handleListNFT, checkApproval }
}



export const useBuyNFT = () => {
  const account = useAccount();

  const getMarketItem = async (itemId: bigint) => {
    const chainId = account.chainId || 11155111;
    const MarketplaceAddress = addresses[chainId]?.marketplace?.address;

    if (!MarketplaceAddress) {
      throw new Error("Marketplace address not found for this chain");
    }

    const result = await readContract(config, {
      address: MarketplaceAddress as `0x${string}`,
      abi: MARKETPLACE,
      functionName: 'getMarketItem',
      args: [itemId],
    });

    console.log("Market item details:", result);
    return result;
  };

  const handleBuyNFT = async (itemId: bigint, price: bigint) => {
    try {
      const chainId = account.chainId || 11155111;
      const MarketplaceAddress = addresses[chainId]?.marketplace?.address;
  
      if (!MarketplaceAddress) {
        throw new Error("Marketplace address not found for this chain");
      }
  
      console.log("Buying NFT with itemId:", itemId.toString());
      console.log("Price:", price.toString());
      console.log("Marketplace Address:", MarketplaceAddress);
  
      const tx = await writeContract(config, {
        address: MarketplaceAddress as `0x${string}`,
        abi: MARKETPLACE,
        functionName: 'createMarketSale',
        args: [itemId],
        value: price,
      });
  
      console.log("Transaction:", tx);
      return tx;
    } catch (error) {
      console.error("Error in handleBuyNFT:", error);
      throw error;
    }
  };
  

  return { handleBuyNFT };
};
// Type guard function
function isMarketItem(item: unknown): item is MarketItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'itemId' in item &&
    'tokenId' in item &&
    'seller' in item &&
    'owner' in item &&
    'price' in item &&
    'sold' in item
  );
}
