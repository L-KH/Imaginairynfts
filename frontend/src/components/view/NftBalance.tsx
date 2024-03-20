import { useState, useEffect } from 'react';
import { useAccount, useBalance, useBlockNumber } from "wagmi";
import { useFetch } from '@/Hooks/useFetch';
import { getImageSrc, readNFTData, createTwitterShareUrl } from '@/services/ipfsUploader'

import { ClipLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  IconError,
} from "@/components/icons";


interface IModal {
  selectedNFT: IData;
  closeModal: () => void;
}
interface IData {
  name: string;
  description: string;
  image: string;
}
interface IPageIndexer {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
}

interface IImage {
  src: string;
  alt: string;
}

function NFTlist() {
  const PAGE_SIZE = 8;
  const useFteched = useFetch();
  const { address, isConnecting, isDisconnected } = useAccount();

  const [dataArray, setDataArray] = useState<IData[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<IData | null>(null);
  const [nftsBalance, setNftsBalance] = useState<any[]>([])
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [tokenURIs, setTokenURIs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (address) {
      setLoading(true);
      fetchData()
      const totalPages = Math.ceil(nftsBalance.length / PAGE_SIZE);
      setTotalPages(totalPages)
      setLoading(false);
    }
    console.log(address, isDisconnected, 'state')
  }, [address]);

  useEffect(() => {

    setLoading(true);
    fetchData()
    setLoading(false);

  }, [currentPage]);

  const fetchData = async () => {
    const balance = await useFteched?.fetchBalance()
    if (balance) {
      setNftsBalance(balance)
      console.log(balance, 'balance')
    }
    if (balance) {
      const uris = await useFteched?.fetchBatchTokenURIs(currentPage, balance)
      console.log(uris, 'uris')
      if (uris) {
        const dataList = await Promise.all(uris.map(uri => readNFTData(uri)));
        console.log(dataList, 'list');
        setDataArray(dataList)
      }

    }

  }



  const openModal = (nft: IData) => {
    setSelectedNFT(nft);
  }

  const closeModal = () => {
    setSelectedNFT(null);
  }
  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  const ModalNFT = ({ selectedNFT, closeModal }: IModal) => {
    return (
      <div className="fixed inset-0 z-20 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="flex items-center justify-center min-h-screen">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={closeModal}></div>

          <div className="bg-base-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl transform transition-all my-8 max-w-lg w-full">
            <div className="p-5">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-medium dark:text-white">
                  {selectedNFT.name}
                </h3>
                <button onClick={closeModal} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" aria-label="close">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </button>
              </div>
              <div className="mt-2">
                <img src={getImageSrc(selectedNFT.image)} alt="NFT" className="mx-auto rounded-lg" />
                <p className="mt-4  dark:text-gray-400">
                  {selectedNFT.description}
                </p>
              </div>
            </div>
            <div className="flex justify-center p-6">
              <button type="button" onClick={closeModal} className="bg-primary-focus text-primary-content hover:bg-primary hover:text-white text-lg font-semibold leading-none rounded-full py-3 px-8">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const Pagination = ({ currentPage, setCurrentPage, totalPages }: IPageIndexer) => {
    // Helper function to change page
    const goToPage = (pageNumber: number) => {
      setCurrentPage(pageNumber);
    };

    return (
      <nav aria-label="Page navigation example" className='p-4 m-auto' >
        <ul className="inline-flex -space-x-px text-base h-10">
          <li>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
              Previous
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, index) => index).map(pageNumber => (
            <li key={pageNumber}>
              <button
                onClick={() => goToPage(pageNumber)}
                className={`flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${currentPage === pageNumber ? "bg-gray-200 dark:bg-gray-600" : ""}`}
              >
                {pageNumber + 1}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  };
  const ImageWithFallback = ({ src, alt }: IImage) => {
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
      setHasError(true);
    };

    if (hasError || !src) {
      return (
        <div className='border border-gray-500 shadow  rounded-md p-4 m-auto max-w-64 object-cover'>
          <IconError /> 
        </div>
      );
    }

    return (
      <div className='m-2 shadow-md  '>
      <img alt={alt} src={src} className="rounded-md max-h-60 w-full object-cover" onError={handleError} />
      </div>
    );
  };


  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* <h1 className="text-5xl font-extrabold text-secondary my-8 text-center">My minted NFTs:</h1> */}
      {address ? (
        <div className=' justify-between'>
          {loading ? (
            // <div className="flex justify-center items-center h-64">
            //   <ClipLoader color="#4A90E2" loading={loading} size={150} />
            // </div>
            <div className=' flex flex-wrap'>
              {[...Array(8)].map((_, index) => (

                <div key={index} className="border border-gray-500 shadow rounded-md p-4 max-w-64 w-full mx-auto mb-4">
                  <div className="animate-pulse flex flex-col space-x-4">
                    <div className="rounded-md bg-slate-700 min-h-48"></div>
                    <div className="flex-1 py-4 space-y-6">
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="h-2 bg-slate-700 rounded col-span-2"></div>
                          <div className="h-2 bg-slate-700 rounded col-span-1"></div>
                        </div>
                        <div className="h-2 bg-slate-700 rounded"></div>
                      </div>
                      <div className="h-2 bg-slate-700 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center ">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {dataArray?.map((item, index) => (
                  <div key={index} className="justify-between flex flex-col shadow-lg border border-gray-500 rounded-lg max-w-64 bg-base-100 hover:shadow-xl transition-shadow duration-300 ease-in-out">
                    <ImageWithFallback src={getImageSrc(item.image)} alt="NFT Image" />
                    <div className="m-1 max-w-sm shadow dark:border-gray-700 dark:bg-gray-800 ">
                      <div className="grid grid-cols-1 divide-y gap-2">
                        <div className='flex justify-between'>
                          <span>Name:</span>
                          <span>{item?.name ? truncateText(item.name, 20) : 'Name Unavailable'}</span>
                        </div>
                        <div className='grid grid-cols-1'>
                          <div className='grid grid-cols-1'>

                            <p className="px-2 font-normal text-xs text-gray-500 dark:text-gray-400">
                              {item?.description ? truncateText(item.description, 100) : 'Description Unavailable'}
                            </p>
                          </div>

                          <button className="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5 inset-y-0 right-0 "
                            onClick={() => window.open(createTwitterShareUrl(item), '_blank')} >
                            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 17">
                              <path fill-rule="evenodd" d="M20 1.892a8.178 8.178 0 0 1-2.355.635 4.074 4.074 0 0 0 1.8-2.235 8.344 8.344 0 0 1-2.605.98A4.13 4.13 0 0 0 13.85 0a4.068 4.068 0 0 0-4.1 4.038 4 4 0 0 0 .105.919A11.705 11.705 0 0 1 1.4.734a4.006 4.006 0 0 0 1.268 5.392 4.165 4.165 0 0 1-1.859-.5v.05A4.057 4.057 0 0 0 4.1 9.635a4.19 4.19 0 0 1-1.856.07 4.108 4.108 0 0 0 3.831 2.807A8.36 8.36 0 0 1 0 14.184 11.732 11.732 0 0 0 6.291 16 11.502 11.502 0 0 0 17.964 4.5c0-.177 0-.35-.012-.523A8.143 8.143 0 0 0 20 1.892Z" clip-rule="evenodd" />
                            </svg>
                            <span className="sr-only">Share</span>
                          </button>

                        </div>
                        {/* Share on Twitter Button */}
                        {/* <button
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          onClick={() => window.open(createTwitterShareUrl(item), '_blank')}
                        >
                          Share on Twitter
                        </button> */}

                      </div>
                    </div>
                  </div>
                ))}
              </div>


            </div>
          )}
          <Pagination currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <span className="text-error-content bg-error p-4 rounded-lg">Please connect your Wallet</span>
        </div>
      )}
      {selectedNFT && (
        <ModalNFT selectedNFT={selectedNFT} closeModal={closeModal} />
      )}
      <ToastContainer />
    </div>
  );
}

export default NFTlist;