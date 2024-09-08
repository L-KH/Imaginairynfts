// MarketplacePage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { readContract, writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { formatEther, parseEther } from 'viem';
import { toast } from 'react-toastify';
import { addresses } from '@/constants/config';
import { config } from '@/components/Layout/Web3Wrapper';
import MARKETPLACE_ABI from '@/Hooks/abi/MARKETPLACE.json';
import NFT_ABI from '@/Hooks/abi/NFT2.json';
import MarketplaceFilters from './MarketplaceFilters';
import MarketItemCard from './MarketItemCard';
import OfferModal from './OfferModal';

import 'react-toastify/dist/ReactToastify.css';

interface MarketItem {
  listingId: bigint;
  tokenId: bigint;
  seller: string;
  price: bigint;
  isActive: boolean;
  imageUrl?: string;
}

interface Offer {
  offeror: string;
  amount: bigint;
}

const MarketplacePage: React.FC = () => {
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('price');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [offerAmount, setOfferAmount] = useState('');
  const [userOffers, setUserOffers] = useState<{ [key: string]: bigint }>({});

  const { address } = useAccount();
  const chainId = useChainId() || 11155111; // Default to Sepolia if chainId is not available

  const NFTAddress = addresses[chainId]?.nft?.address;
  const MarketplaceAddress = addresses[chainId]?.marketplace?.address;

  const fetchMarketItems = useCallback(async () => {
    if (!MarketplaceAddress || !NFTAddress) {
      toast.error("Contract addresses not found");
      return;
    }

    try {
      setLoading(true);
      const activeListings = await readContract(config, {
        address: MarketplaceAddress as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: 'getActiveListings',
      }) as any[];

      const items: MarketItem[] = await Promise.all(
        activeListings.map(async (item: any) => {
          let tokenURI = '';
          try {
            tokenURI = await readContract(config, {
              address: NFTAddress as `0x${string}`,
              abi: NFT_ABI,
              functionName: 'tokenURI',
              args: [item.tokenId],
            }) as string;
          } catch (error) {
            console.warn(`Error fetching tokenURI for token ${item.tokenId}:`, error);
          }

          const metadata = tokenURI ? await fetchMetadata(tokenURI) : {};
          return {
            listingId: item.listingId,
            tokenId: item.tokenId,
            seller: item.seller,
            price: item.price,
            isActive: item.isActive,
            imageUrl: metadata.image || '/placeholder.png',
          };
        })
      );

      setMarketItems(items);
    } catch (error) {
      console.error("Error fetching market items:", error);
      toast.error("Failed to fetch market items");
    } finally {
      setLoading(false);
    }
  }, [MarketplaceAddress, NFTAddress]);

  async function fetchMetadata(tokenURI: string) {
    try {
      const response = await fetch(tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/'));
      return await response.json();
    } catch (error) {
      console.error("Error fetching metadata:", error);
      return {};
    }
  }

  const fetchOffersForListing = async (listingId: bigint) => {
    try {
      const offersItems = await readContract(config, {
        address: MarketplaceAddress as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: 'getOffers',
        args: [listingId],
      });
      const [offerors, amounts] = offersItems as any[];
      return offerors.map((offeror: string, index: number) => ({
        offeror,
        amount: amounts[index],
      }));
    } catch (error) {
      console.error("Error fetching offers for listing:", error);
      return  [];

    }
   
  };

  useEffect(() => {
    fetchMarketItems();
  }, [fetchMarketItems]);

  const buyItem = useCallback(async (listingId: bigint, price: bigint) => {
    if (!address || !MarketplaceAddress) return;
    try {
      const hash = await writeContract(config, {
        address: MarketplaceAddress as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: 'buyItem',
        args: [listingId],
        value: price,
      });

      await waitForTransactionReceipt(config, { hash });
      toast.success("Item purchased successfully");
      fetchMarketItems();
    } catch (error) {
      console.error("Error buying item:", error);
      toast.error("Failed to purchase item");
    }
  }, [address, MarketplaceAddress, fetchMarketItems]);

  const makeOffer = async (listingId: bigint, amount: string) => {
    if (!address || !MarketplaceAddress) return;

    try {
      const offerAmount = parseEther(amount);
      const hash = await writeContract(config, {
        address: MarketplaceAddress as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: 'makeOffer',
        args: [listingId],
        value: offerAmount,
      });

      await waitForTransactionReceipt(config, { hash });
      toast.success("Offer made successfully");
      setUserOffers({ ...userOffers, [listingId.toString()]: offerAmount });
      fetchMarketItems();
    } catch (error) {
      console.error("Error making offer:", error);
      toast.error("Failed to make offer");
    }
  };

  const acceptOffer = async (listingId: bigint, offeror: string) => {
    if (!address || !MarketplaceAddress) return;

    try {
      const hash = await writeContract(config, {
        address: MarketplaceAddress as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: 'acceptOffer',
        args: [listingId, offeror],
      });

      await waitForTransactionReceipt(config, { hash });
      toast.success("Offer accepted successfully");
      fetchMarketItems();
    } catch (error) {
      console.error("Error accepting offer:", error);
      toast.error("Failed to accept offer");
    }
  };

  const rejectOffer = async (listingId: bigint, offeror: string) => {
    if (!address || !MarketplaceAddress) return;

    try {
      const hash = await writeContract(config, {
        address: MarketplaceAddress as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: 'rejectOffer',
        args: [listingId, offeror],
      });

      await waitForTransactionReceipt(config, { hash });
      toast.success("Offer rejected successfully");
      fetchMarketItems();
    } catch (error) {
      console.error("Error rejecting offer:", error);
      toast.error("Failed to reject offer");
    }
  };

  const cancelListing = async (listingId: bigint) => {
    if (!address || !MarketplaceAddress) return;

    try {
      const hash = await writeContract(config, {
        address: MarketplaceAddress as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: 'cancelListing',
        args: [listingId],
      });

      await waitForTransactionReceipt(config, { hash });
      toast.success("Listing cancelled successfully");
      fetchMarketItems();
    } catch (error) {
      console.error("Error cancelling listing:", error);
      toast.error("Failed to cancel listing");
    }
  };

  const updateItemPrice = async (listingId: bigint, newPrice: string) => {
    if (!address || !MarketplaceAddress) return;

    try {
      const newPriceInWei = parseEther(newPrice);
      const hash = await writeContract(config, {
        address: MarketplaceAddress as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: 'updateItemPrice',
        args: [listingId, newPriceInWei],
      });

      await waitForTransactionReceipt(config, { hash });
      toast.success("Item price updated successfully");
      fetchMarketItems();
    } catch (error) {
      console.error("Error updating item price:", error);
      toast.error("Failed to update item price");
    }
  };

  const filteredAndSortedItems = useMemo(() => {
    return marketItems
      .filter(item => {
        if (filter === 'all') return true;
        if (filter === 'forSale') return item.isActive;
        if (filter === 'mySales') return item.seller.toLowerCase() === address?.toLowerCase();
        return true;
      })
      .filter(item => item.tokenId.toString().includes(searchTerm))
      .sort((a, b) => {
        if (sortBy === 'price') return Number(a.price - b.price);
        if (sortBy === 'tokenId') return Number(a.tokenId - b.tokenId);
        return 0;
      });
  }, [marketItems, filter, searchTerm, sortBy, address]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">ImaginAIry NFT Marketplace</h1>
      
      <MarketplaceFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filter={filter}
        setFilter={setFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAndSortedItems.map((item) => (
            <MarketItemCard
              key={item.listingId.toString()}
              item={item}
              address={address}
              buyItem={buyItem}
              setSelectedItem={setSelectedItem}
              cancelListing={cancelListing}
              updateItemPrice={updateItemPrice}
              fetchOffersForListing={fetchOffersForListing}
              acceptOffer={acceptOffer}
              rejectOffer={rejectOffer}
            />
          ))}
        </div>
      )}

      <OfferModal
        selectedItem={selectedItem}
        offerAmount={offerAmount}
        setOfferAmount={setOfferAmount}
        makeOffer={makeOffer}
        setSelectedItem={setSelectedItem}
      />
    </div>
  );
};

export default MarketplacePage;