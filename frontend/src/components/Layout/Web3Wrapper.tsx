import { RainbowKitProvider, connectorsForWallets } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig ,cookieStorage, WagmiProvider, createStorage , fallback } from 'wagmi'
import { http } from 'viem' 
import { linea, base, scroll } from 'wagmi/chains'
import { daisyTheme } from '@/utils/rainbowUtils'
import {
  injectedWallet,
  rabbyWallet,
  rainbowWallet,
  metaMaskWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import linea_logo from "../assets/linea_logo.png";


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

const customLinea = { ...linea, iconUrl: linea_logo.src };

export const config = createConfig({
  // appName: 'RainbowKit demo',
  // projectId: '51d5d824bfd42cd4f17cfb3dcec82da9',
  chains: [linea, base, scroll],
  transports: {
    [linea.id]: http(),
    [base.id]: http(),
    [scroll.id]: http(),
    

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
