import { RainbowKitProvider, connectorsForWallets } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig ,cookieStorage, WagmiProvider, createStorage , fallback } from 'wagmi'
import { http } from 'viem' 
import { linea } from 'wagmi/chains'
import { daisyTheme } from '@/utils/rainbowUtils'
import {
  injectedWallet,
  rabbyWallet,
  rainbowWallet,
  metaMaskWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';


const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet, rainbowWallet, walletConnectWallet, rabbyWallet, injectedWallet],
    },
  ],
  {
    appName: 'Imaginairy NFTs',
    projectId: '51d5d824bfd42cd4f17cfb3dcec82da9',
  }
)


export const config = createConfig({
  // appName: 'RainbowKit demo',
  // projectId: '51d5d824bfd42cd4f17cfb3dcec82da9',
  chains: [linea],
  transports: {
    [linea.id]: fallback([
      http("https://rpc.linea.build"),
      http("https://linea.rpc.thirdweb.com"),
      http('https://linea.getblock.io/409ebee8ad60475696a77cd3cb1aefae'),
      http('https://linea-mainnet.infura.io/v3/409ebee8ad60475696a77cd3cb1aefae'),
      http("https://linea-mainnet-public.unifra.io"),
      http("https://linea.blockpi.network/v1/rpc/public"),
    ]),
    

  },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),

  connectors: connectors,
})

export const queryClient = new QueryClient()

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
