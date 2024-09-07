import React, { useState, useEffect, useCallback } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { readContract, writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { formatEther, parseEther } from 'viem';
import { toast } from 'react-toastify';
import { addresses } from '@/constants/config';
import { config } from '@/components/Layout/Web3Wrapper';
import MARKETPLACE_ABI from '@/Hooks/abi/MARKETPLACE.json';
import NFT_ABI from '@/Hooks/abi/NFT2.json';

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

      console.log("Active Listings:", activeListings);

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

          let imageUrl = '';
          if (tokenURI) {
            try {
              const response = await fetch(tokenURI);
              const metadata = await response.json();
              imageUrl = metadata.image;
            } catch (error) {
              console.warn(`Error fetching metadata for token ${item.tokenId}:`, error);
            }
          }

          return {
            listingId: item.listingId || null,
            tokenId: item.tokenId,
            seller: item.seller,
            price: item.price,
            isActive: item.isActive,
            imageUrl: imageUrl || undefined,
          };
        })
      );

      console.log("Fetched Items:", items);

      const validItems = items.filter((item): item is MarketItem => item.listingId !== null);

      console.log("Valid Items:", validItems);

      setMarketItems(validItems);
    } catch (error) {
      console.error("Error fetching market items:", error);
      toast.error("Failed to fetch market items");
    } finally {
      setLoading(false);
    }
  }, [MarketplaceAddress, NFTAddress]);
  
  
  
  

  useEffect(() => {
    fetchMarketItems();
  }, [fetchMarketItems]);

  const listItem = async (tokenId: bigint, price: string) => {
    if (!address || !MarketplaceAddress) return;

    try {
      const priceInWei = parseEther(price);
      const hash = await writeContract(config, {
        address: MarketplaceAddress as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: 'listItem',
        args: [tokenId, priceInWei],
      });

      await waitForTransactionReceipt(config, { hash });
      toast.success("Item listed successfully");
      fetchMarketItems();
    } catch (error) {
      console.error("Error listing item:", error);
      toast.error("Failed to list item");
    }
  };

  const buyItem = async (listingId: bigint, price: bigint) => {
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
  };

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
  const filteredAndSortedItems = React.useMemo(() => {
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
      
      <div className="mb-8 flex flex-wrap justify-between items-center">
        <div className="w-full md:w-auto mb-4 md:mb-0">
          <input
            type="text"
            placeholder="Search by Token ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Items</option>
            <option value="forSale">For Sale</option>
            <option value="mySales">My Sales</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="price">Sort by Price</option>
            <option value="tokenId">Sort by Token ID</option>
          </select>
        </div>
      </div>
  
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          
      {filteredAndSortedItems.map((item) => (
        <div key={item.listingId?.toString() || item.tokenId.toString()} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src={item.imageUrl || '/placeholder.png'} alt={`NFT ${item.tokenId}`} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">Token ID: {item.tokenId.toString()}</h2>
                <p className="text-gray-600 mb-2">Price: {formatEther(item.price)} ETH</p>
                <p className="text-gray-600 mb-4">Seller: {item.seller.slice(0, 6)}...{item.seller.slice(-4)}</p>
                {item.seller.toLowerCase() !== address?.toLowerCase() && (
                  <>
                    <button
                      onClick={() => buyItem(item.listingId, item.price)}
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 mb-2"
                    >
                      Buy Now
                    </button>
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
                    >
                      Make Offer
                    </button>
                  </>
                )}
                {item.seller.toLowerCase() === address?.toLowerCase() && (
                  <>
                    <button
                      onClick={() => cancelListing(item.listingId)}
                      className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300 mb-2"
                    >
                      Cancel Listing
                    </button>
                    <button
                      onClick={() => {
                        const newPrice = prompt("Enter new price in ETH:");
                        if (newPrice) updateItemPrice(item.listingId, newPrice);
                      }}
                      className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition duration-300"
                    >
                      Update Price
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
  
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Make an Offer</h2>
            <p>Token ID: {selectedItem.tokenId.toString()}</p>
            <p>Current Price: {formatEther(selectedItem.price)} ETH</p>
            <input
              type="number"
              step="0.01"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              className="w-full px-4 py-2 mt-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter offer amount in ETH"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSelectedItem(null)}
                className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-300 mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedItem && offerAmount) {
                    makeOffer(selectedItem.listingId, offerAmount);
                    setSelectedItem(null);
                  }
                }}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
              >
                Submit Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  

};

export default MarketplacePage;
