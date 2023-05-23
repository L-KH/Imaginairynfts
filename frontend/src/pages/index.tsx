import Layout from '@/components/Layout/Layout'
import { BigNumber } from 'ethers'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useSendTransaction } from 'wagmi'
import Imaginary from '../components/Imaginary'

const Home: NextPage = () => {
  const { data, isIdle, isError, isLoading, isSuccess, sendTransaction } =
    useSendTransaction({
      request: {
        to: '0xce4a9990251944b625c11d2f4a28b38197aa29e1',
        value: BigNumber.from('10000000000000000'), // .01 ETH
      },
    })

  return (
    <Layout>
      <Head>
        <title>Dashboard Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex-grow items-center justify-center py-10 px-20 text-center">
        <h1 className="my-12 text-6xl font-bold">
          <span className="text-secondary">Web3</span> starter template
        </h1>

        <Imaginary/>
      </main>
    </Layout>
  )
}

export default Home
