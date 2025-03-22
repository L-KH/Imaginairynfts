import { RainbowKitProvider, connectorsForWallets } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig, cookieStorage, WagmiProvider, createStorage } from 'wagmi'
import { http } from 'viem'
import { linea, scroll, base } from 'wagmi/chains'
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

const ink = {
  id: 0xdef1,
  name: 'Ink Mainnet',
  nativeCurrency: {
    name: 'Ink Mainnet',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc-gel.inkonchain.com'] },
  },
  blockExplorers: {
    default: { name: 'Ink Mainnet Explorer', url: 'https://explorer.inkonchain.com' },
  },
  testnet: true,
};
const cyber = {
  id: 0x1d88,
  name: 'Cyber Mainnet',
  nativeCurrency: {
    name: 'Cyber Mainnet',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://cyber.alt.technology'] },
  },
  blockExplorers: {
    default: { name: 'Cyber Mainnet Explorer', url: 'https://cyberscan.co' },
  },
  testnet: true,
};
const sonic = {
  id: 0x92,
  name: 'Sonic Mainnet',
  nativeCurrency: {
    name: 'Sonic Mainnet',
    symbol: 'S',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.soniclabs.com'] },
  },
  blockExplorers: {
    default: { name: 'Sonic Mainnet Explorer', url: 'https://sonicscan.org' },
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
  chains: [linea, taiko, mint, ink, sonic],
  transports: {
    [linea.id]: http(),
    [sonic.id]: http('https://rpc.soniclabs.com'),
    [taiko.id]: http('https://rpc.taiko.xyz'),
    [ink.id]: http('https://rpc-gel.inkonchain.com'),
    [mint.id]: http('https://rpc.mintchain.io'),
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
