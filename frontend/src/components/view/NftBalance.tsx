import { useState, useEffect } from 'react';
import { useAccount, useBalance, useBlockNumber} from "wagmi";
import { useFetch } from '@/Hooks/useFetch';
import {getImageSrc, readNFTData} from '@/services/ipfsUploader'

import { ClipLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    IconError,
  } from "@/components/icons";


interface IModal{
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
    const PAGE_SIZE = 9;
    const useFteched = useFetch();
    const { address, isConnecting, isDisconnected } = useAccount();

  const [dataArray, setDataArray] = useState<IData[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<IData| null>(null);
  const [nftsBalance, setNftsBalance] = useState<any[]>([])
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [tokenURIs, setTokenURIs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if(address){
        setLoading(true);
        fetchData()
        const totalPages = Math.ceil(nftsBalance.length / PAGE_SIZE);
        setTotalPages(totalPages)
        setLoading(false);
    }
    console.log(address, isDisconnected, 'state')
  }, [currentPage, address]);



const fetchData = async () => {
    const balance  = await useFteched?.fetchBalance()
    if(balance){
        setNftsBalance(balance)
        console.log(balance, 'balance')
    }
    if(balance){
        const uris = await useFteched?.fetchBatchTokenURIs(currentPage, balance)
        console.log( uris, 'uris')
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

  const  ModalNFT = ({ selectedNFT, closeModal }: IModal) => {
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
                <img src={getImageSrc(selectedNFT.image)} alt="NFT" className="mx-auto rounded-lg"/>
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
        const goToPage = (pageNumber:number) => {
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
            <div className='max-h-60 w-full object-cover justify-center'>
              <IconError/> {/* Your fallback UI here */}
            </div>
          );
        }
      
        return (
          <img alt={alt} src={src} className="max-h-60 w-full object-cover" onError={handleError} />
        );
      };
  return (
    <div className="px-4 sm:px-6 lg:px-8">
    {/* <h1 className="text-5xl font-extrabold text-secondary my-8 text-center">My minted NFTs:</h1> */}
    {address ? (
      <>
        {loading && dataArray.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <ClipLoader color="#4A90E2" loading={loading} size={150} />
          </div>
        ) : (
            <div className="flex flex-col justify-center items-center ">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {dataArray?.map((item, index) => (
              <div key={index} className="justify-between flex flex-col shadow-lg border border-gray-500 rounded-lg w-full max-w-sm bg-base-100 hover:shadow-xl transition-shadow duration-300 ease-in-out">
                    
                    <ImageWithFallback src={getImageSrc(item.image)} alt="NFT Image" />
                  
                  <div className="m-1 max-w-sm   shadow dark:border-gray-700 dark:bg-gray-800 ">
                  <div className=" grid grid-cols-1 divide-y  gap-2">
                    <div className='flex justify-between ' >
                      <span>
                        Name:
                      </span>
                      <span>
                      {item?.name ? truncateText(item.name, 20) : ' Name Unavailable'}
                      </span>
                    </div>
                    <div className='flex flex-wrap ' >
                      <span>
                        description:
                      </span>
                      <p className="px-2 font-normal text-xs text-gray-500 dark:text-gray-400" >
                       {item?.description ? truncateText(item.description, 100) : 'description Unavailable'}
                      </p>
                    </div>
                  </div>
                  {/* <h5 className="mb-2 text-sm font-semibold tracking-tight text-gray-500 dark:text-white"> {item?.name ? truncateText(item.name, 20) : ' Name Unavailable'} </h5>
                  <p className="mb-3 font-normal text-xs text-gray-500 dark:text-gray-400">
                  {item?.description ? truncateText(item.description, 100) : 'description Unavailable'}
                    </p> */}
                    {/* <h3 className="text-primary text-2xl font-semibold mb-2 text-center">
                      {item?.name ? truncateText(item.name, 20) : 'NFT Name Unavailable'}
                    </h3>
                    <div className="flex justify-center pb-2">
                      <button onClick={() => openModal(item)} className="bg-primary-focus text-primary-content hover:bg-primary hover:text-white text-lg font-semibold leading-none rounded-full py-3 px-8">
                        Show Details
                      </button>
                    </div> */}
                  </div>
              </div>
            ))}
          </div>
          
          <Pagination currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
          </div>
        )}
      </>
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