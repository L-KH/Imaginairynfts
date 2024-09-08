import React from 'react';
import { formatEther } from 'viem';
interface MarketItem {
    listingId: bigint;
    tokenId: bigint;
    seller: string;
    price: bigint;
    isActive: boolean;
    imageUrl?: string;
  } 
interface OfferModalProps {
  selectedItem: MarketItem | null;
  offerAmount: string;
  setOfferAmount: (amount: string) => void;
  makeOffer: (listingId: bigint, amount: string) => Promise<void>;
  setSelectedItem: (item: MarketItem | null) => void;
}

const OfferModal: React.FC<OfferModalProps> = ({
  selectedItem,
  offerAmount,
  setOfferAmount,
  makeOffer,
  setSelectedItem,
}) => {
  if (!selectedItem) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
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
              makeOffer(selectedItem.listingId, offerAmount);
              setSelectedItem(null);
            }}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Submit Offer
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfferModal