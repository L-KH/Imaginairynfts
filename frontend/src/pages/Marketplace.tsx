import Layout from '@/components/Layout/Layout'
import { NextPage } from 'next'
import MarketplacePage from '@/components/view/MarketplacePage'

const MintedNFT: NextPage = () => {
  return (
    <Layout >
      <div className="flex h-full content-center">
      <div className="w-full p-10 m-auto  ">
        {/* <NFTlist/> */}
        <MarketplacePage/>
        
      </div>
      </div>
    </Layout>
  )
}

export default MintedNFT
