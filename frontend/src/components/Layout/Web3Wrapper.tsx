import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig , WagmiProvider  } from 'wagmi'
import { createClient, http } from 'viem' 
import { mainnet, linea, lineaTestnet } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

import { daisyTheme } from '@/utils/rainbowUtils'


const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: '51d5d824bfd42cd4f17cfb3dcec82da9',
  chains: [mainnet, linea, lineaTestnet],
  transports: {
    [mainnet.id]: http(),
  },
})

const queryClient = new QueryClient()

const theme = daisyTheme()

const Web3Wrapper = ({ children }: any) => {
  return (
    <WagmiProvider config={config}> 
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
      <div>{children}</div>
      </RainbowKitProvider>
    </QueryClientProvider>
      
    </WagmiProvider>
  )
}

export default Web3Wrapper
