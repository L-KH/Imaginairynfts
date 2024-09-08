import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useListNFT } from '@/Hooks/WriteContract';
import { parseEther } from 'viem';

interface IData {
  id: number;
  name: string;
  description: string;
  image: string;
}

interface ListingModalProps {
  nft: IData | null;
  isOpen: boolean;
  onClose: () => void;
}

const ListingModal: React.FC<ListingModalProps> = ({ nft, isOpen, onClose }) => {
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<'idle' | 'approving' | 'listing' | 'completed' | 'error'>('idle');
  const [isApproved, setIsApproved] = useState(false);
  const { handleListNFT, checkApproval } = useListNFT();

  useEffect(() => {
    const checkNFTApproval = async () => {
      if (nft) {
        try {
          const approved = await checkApproval(BigInt(nft.id));
          console.log("Approval status:", approved);
          setIsApproved(approved);
        } catch (error) {
          console.error("Error checking NFT approval:", error);
          toast.error("Failed to check NFT approval status");
        }
      }
    };
    checkNFTApproval();
  }, [nft, checkApproval]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nft) return;

    try {
      if (!isApproved) {
        setStatus('approving');
        toast.info("Approving NFT for marketplace...");
      }

      setStatus('listing');
      const tx = await handleListNFT(BigInt(nft.id), price);
      console.log("Listing transaction:", tx);

      setStatus('completed');
      toast.success(`Successfully listed NFT ${nft.id} for ${price} ETH`);
      
      // Wait for 2 seconds before closing the modal
      setTimeout(() => {
        setStatus('idle');
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error listing NFT:", error);
      setStatus('error');
      if (error instanceof Error) {
        toast.error(`Failed to list NFT: ${error.message}`);
      } else {
        toast.error("An unknown error occurred while listing the NFT");
      }
    }
  };

  const isProcessing = status === 'approving' || status === 'listing';

  if (!isOpen || !nft) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-base-300 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-base-300 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg leading-6 font-medium text-primary" id="modal-title">
              List NFT in Marketplace
            </h3>
            <div className="mt-2">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="price" className="block text-sm font-medium">Price (ETH)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    step="0.000000000000000001"
                    min="0"
                    disabled={isProcessing}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div className="mt-5 sm:mt-6">
                  <button
                    type="submit"
                    disabled={isProcessing || status === 'completed'}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {status === 'approving' ? 'Approving...' :
                     status === 'listing' ? 'Listing...' :
                     status === 'completed' ? 'Listed Successfully' :
                     isApproved ? 'List NFT' : 'Approve and List NFT'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="bg-base-300 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingModal;