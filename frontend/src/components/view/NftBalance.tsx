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
  id: number
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

      fetchData()
      const totalPages = Math.ceil(nftsBalance.length / PAGE_SIZE);
      setTotalPages(totalPages)

    }
    console.log(address, isDisconnected, 'state')
  }, [address]);

  useEffect(() => {

    fetchData()

  }, [currentPage]);

  const fetchData = async () => {
    setLoading(true);
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
    setLoading(false);

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

  // const ModalNFT = ({ selectedNFT, closeModal }: IModal) => {
  //   return (
  //     <div className="fixed inset-0 z-20 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
  //       <div className="flex items-center justify-center min-h-screen">
  //         <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={closeModal}></div>

  //         <div className="bg-base-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl transform transition-all my-8 max-w-lg w-full">
  //           <div className="p-5">
  //             <div className="flex justify-between items-center">
  //               <h3 className="text-2xl font-medium dark:text-white">
  //                 {selectedNFT.name}
  //               </h3>
  //               <button onClick={closeModal} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" aria-label="close">
  //                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
  //               </button>
  //             </div>
  //             <div className="mt-2">
  //               <img src={getImageSrc(selectedNFT.image)} alt="NFT" className="mx-auto rounded-lg" />
  //               <p className="mt-4  dark:text-gray-400">
  //                 {selectedNFT.description}
  //               </p>
  //             </div>
  //           </div>
  //           <div className="flex justify-center p-6">
  //             <button type="button" onClick={closeModal} className="bg-primary-focus text-primary-content hover:bg-primary hover:text-white text-lg font-semibold leading-none rounded-full py-3 px-8">
  //               Close
  //             </button>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

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

              {dataArray.length == 0 ?
                (<div>
                  <p className=" md:text-sm lg:text-base px-2">
                  Looks like you haven't created your own  <span className='p-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text'>ImaginAIryNFTs.</span>
                    Bring your unique AI NFT <a href="/" className=" text-blue-600 hover:bg-gradient-to-r hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 hover:text-transparent hover:bg-clip-text p-2"> Now!</a>
                  </p>
                </div>) :
                (<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {dataArray?.map((item, index) => (
                    <div key={index} className="justify-between flex flex-col shadow-lg border border-gray-500 rounded-lg max-w-64 bg-base-100 hover:shadow-xl transition-shadow duration-300 ease-in-out">
                      <ImageWithFallback src={getImageSrc(item.image)} alt="NFT Image" />
                      <div className="m-1 max-w-sm shadow dark:border-gray-700 dark:bg-gray-800 ">
                        <div className="grid grid-cols-1 divide-y divide-sky-800 dark:divide-slate-500  gap-2">
                          <div className='text-xs flex justify-between'>
                            <span>Name:</span>
                            <span>{item?.name ? truncateText(item.name, 20) : 'Name Unavailable'}</span>
                          </div>
                          <div className='flex justify-between text-xs'>
                            <span>NFT #:</span>
                            <span>{item?.id.toString()}</span>
                          </div>
                          <div className='grid grid-cols-1'>
                            <div className='grid grid-cols-1'>

                              <p className="px-2 font-normal text-xs text-gray-500 dark:text-gray-400">
                                {item?.description ? truncateText(item.description, 100) : 'Description Unavailable'}
                              </p>
                            </div>
                            <div className='pt-4 flex flex-wrap justify-between'>
                              <button className=" text-gray-500 hover:text-sky-400 dark:hover:text-white ms-5 inset-y-0 right-0 "
                                onClick={() => window.open(createTwitterShareUrl(item), '_blank')} >

                                <span className="text-xs ">Share</span>
                              </button>
                              <button className="text-gray-500 hover:text-sky-400 dark:hover:text-white ms-5 inset-y-0 right-0"
                                onClick={() => window.open(`https://element.market/assets/linea/0xb99e5534d42500eb1d5820fba3bb8416ccb76396/${item.id}`, '_blank')} >


                                <span className="text-xs pr-4">Marketplace</span>
                              </button>
                            </div>


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
                )}



            </div>
          )}
          {/* <Pagination currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} /> */}
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <span className="text-error-content bg-error p-4 rounded-lg">Please connect your Wallet</span>
        </div>
      )}
      {/* {selectedNFT && (
        <ModalNFT selectedNFT={selectedNFT} closeModal={closeModal} />
      )} */}
      <ToastContainer />
    </div>
  );
}

export default NFTlist;