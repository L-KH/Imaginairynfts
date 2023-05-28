import Layout from '@/components/Layout/Layout'
import { NextPage } from 'next'
import NFTlist from '../components/NFTlist'
const MintedNFT: NextPage = () => {
  return (
    <Layout >
      <div className="flex h-full content-center">
      <div className="w-full p-10 m-auto bg-base rounded-lg shadow-md ">
        <NFTlist/>
      </div>
      </div>
    </Layout>
  )
}

export default MintedNFT
