import Layout from '@/components/Layout/Layout'
import { BigNumber } from 'ethers'
import type { NextPage } from 'next'
import Head from 'next/head'
//import { useSendTransaction } from 'wagmi'
//import Imaginary from '../components/Imaginary'
import MintPage from '@/components/view/MintPage'
// import MyNFTs from '../components/MyNFTs'

const Home: NextPage = () => {
  // const { data, isIdle, isError, isLoading, isSuccess, sendTransaction } =
  //   useSendTransaction({
  //     request: {
  //       to: '0xce4a9990251944b625c11d2f4a28b38197aa29e1',
  //       value: BigNumber.from('10000000000000000'), // .01 ETH
  //     },
  //   })

  return (
    <Layout>
      <Head>
        <title>Dashboard Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {/* <Imaginary/> */}
        <MintPage/>
      </main>
    </Layout>
  )
}

export default Home
