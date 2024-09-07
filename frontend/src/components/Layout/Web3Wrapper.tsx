import { RainbowKitProvider, connectorsForWallets } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig, cookieStorage, WagmiProvider, createStorage } from 'wagmi'
import { http } from 'viem'
import { linea, scroll, sepolia } from 'wagmi/chains'
import { daisyTheme } from '@/utils/rainbowUtils'
import {
  injectedWallet,
  rabbyWallet,
  rainbowWallet,
  metaMaskWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import linea_logo from "../assets/linea_logo.png";

const taiko = {
  id: 0x28c58,
  name: 'Taiko Mainnet',
  nativeCurrency: {
    name: 'Taiko Mainnet',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.taiko.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Taiko Mainnet Explorer', url: 'https://taikoscan.io' },
  },
  testnet: true,
};
const zepolia = {
  id: 0xAA36A7,
  name: 'Zepolia ',
  nativeCurrency: {
    name: 'Zepolia ',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://sepolia.infura.io/v3/'] },
  },
  blockExplorers: {
    default: { name: 'Taiko Mainnet Explorer', url: 'https://sepolia.etherscan.io' },
  },
  testnet: true,
};
const mint = {
  id: 0xb9,
  name: 'Mint Mainnet',
  nativeCurrency: {
    name: 'Mint Mainnet',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.mintchain.io'] },
  },
  blockExplorers: {
    default: { name: 'Mint Mainnet Explorer', url: 'https://explorer.mintchain.io' },
  },
  testnet: true,
};
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
  chains: [linea, scroll, taiko, mint, sepolia, zepolia],
  transports: {
    [linea.id]: http(),
    //[base.id]: http(),
    [scroll.id]: http(),
    [taiko.id]: http('https://rpc.taiko.xyz'),
    [mint.id]: http('https://rpc.mintchain.io'),
    [zepolia.id]: http(),
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
