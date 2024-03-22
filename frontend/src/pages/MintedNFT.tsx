import Layout from '@/components/Layout/Layout'
import { NextPage } from 'next'
import NFTlist from '../components/NFTlist'
import NftBalance from '@/components/view/NftBalance'

const MintedNFT: NextPage = () => {
  return (
    <Layout >
      <div className="flex h-full content-center">
      <div className="w-full p-10 m-auto  ">
        {/* <NFTlist/> */}
        <NftBalance/>
        
      </div>
      </div>
    </Layout>
  )
}

export default MintedNFT
