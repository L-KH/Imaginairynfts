import React, { useState, useEffect } from 'react';
import { formatEther } from 'viem';

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

interface MarketItemCardProps {
  item: MarketItem;
  address: string | undefined;
  buyItem: (listingId: bigint, price: bigint) => Promise<void>;
  setSelectedItem: (item: MarketItem | null) => void;
  cancelListing: (listingId: bigint) => Promise<void>;
  updateItemPrice: (listingId: bigint, newPrice: string) => Promise<void>;
  fetchOffersForListing: (listingId: bigint) => Promise<Offer[]>;
  acceptOffer: (listingId: bigint, offeror: string) => Promise<void>;
  rejectOffer: (listingId: bigint, offeror: string) => Promise<void>;
}

const MarketItemCard: React.FC<MarketItemCardProps> = ({
  item,
  address,
  buyItem,
  setSelectedItem,
  cancelListing,
  updateItemPrice,
  fetchOffersForListing,
  acceptOffer,
  rejectOffer,
}) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showOffers, setShowOffers] = useState(false);

  useEffect(() => {
    const fetchOffers = async () => {
      const itemOffers = await fetchOffersForListing(item.listingId);
      setOffers(itemOffers);
    };
    fetchOffers();
  }, [item.listingId, fetchOffersForListing]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <img src={item.imageUrl} alt={`NFT ${item.tokenId}`} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">Token ID: {item.tokenId.toString()}</h2>
        <p className="text-gray-600 mb-2">Price: {formatEther(item.price)} ETH</p>
        <p className="text-gray-600 mb-4">Seller: {item.seller.slice(0, 6)}...{item.seller.slice(-4)}</p>

        {item.seller.toLowerCase() !== address?.toLowerCase() && (
          <div className="space-y-2">
            <button
              onClick={() => buyItem(item.listingId, item.price)}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Buy Now
            </button>
            <button
              onClick={() => setSelectedItem(item)}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
            >
              Make Offer
            </button>
          </div>
        )}

        {item.seller.toLowerCase() === address?.toLowerCase() && (
          <div className="space-y-2">
            <button
              onClick={() => cancelListing(item.listingId)}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
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
            <button
              onClick={() => setShowOffers(!showOffers)}
              className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition duration-300"
            >
              {showOffers ? 'Hide Offers' : `Show Offers (${offers.length})`}
            </button>
          </div>
        )}

        {showOffers && offers.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-semibold">Offers:</h3>
            {offers.map((offer, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <span>{offer.offeror.slice(0, 6)}...{offer.offeror.slice(-4)}</span>
                <span>{formatEther(offer.amount)} ETH</span>
                <div>
                  <button
                    onClick={() => acceptOffer(item.listingId, offer.offeror)}
                    className="bg-green-500 text-white py-1 px-2 rounded mr-2 hover:bg-green-600 transition duration-300"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => rejectOffer(item.listingId, offer.offeror)}
                    className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 transition duration-300"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


export default MarketItemCard