import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

import { daisyTheme } from '@/utils/rainbowUtils'

const { chains, provider } = configureChains(
  // add any chain you want if its a new chain add chain info 
  // const { chains, provider } = configureChains(
    [
      {
        id: 59144,
        name: 'Linea Mainnet',
        network: 'Linea Mainnet',
        nativeCurrency: {
          decimals: 18,
          name: 'Linea Mainnet',
          symbol: 'ETH',
        },
        rpcUrls: {
          default: 'https://linea-mainnet.infura.io/v3/9044f0f3b33d456a8b77274a98cb524d',
        },
      },
      {
        id: 59140,
        name: 'Linea TestNet',
        network: 'Linea TestNet',
        nativeCurrency: {
          decimals: 18,
          name: 'Linea TestNet',
          symbol: 'ETH',
        },
        rpcUrls: {
          default: 'https://rpc.goerli.linea.build',
        },
      },
      // {
      //   id: 570,
      //   name: 'Rollux Mainnet',
      //   network: 'Rollux Mainnet',
      //   nativeCurrency: {
      //     decimals: 18,
      //     name: 'Rollux Mainnet',
      //     symbol: 'SYS',
      //   },
      //   rpcUrls: {
      //     default: 'https://rpc.rollux.com',
      //   },
      // },
      // {
      //   id: 10,
      //   name: 'Optimism',
      //   network: 'Optimism Collective',
      //   nativeCurrency: {
      //     decimals: 18,
      //     name: 'Optimism Collective',
      //     symbol: 'ETH',
      //   },
      //   rpcUrls: {
      //     default: 'https://optimism.meowrpc.com/',
      //   },
      // },
      {
        id: 534352,
        name: 'Scroll Mainnet',
        network: 'Scroll Mainnet',
        nativeCurrency: {
          decimals: 18,
          name: 'Scroll Mainnet',
          symbol: 'ETH',
        },
        rpcUrls: {
          default: 'https://mainnet-rpc.scroll.io',
        },
      },
      {
        id: 8453,
        name: 'Base Mainnet',
        network: 'Base Mainnet',
        nativeCurrency: {
          decimals: 18,
          name: 'Base Mainnet',
          symbol: 'ETH',
        },
        rpcUrls: {
          default: 'https://developer-access-mainnet.base.org/',
        },
      },
    //   {
    //     id: 534353,
    //     name: 'Scroll Testnet',
    //     network: 'Scroll Testnet',
    //     nativeCurrency: {
    //       decimals: 18,
    //       name: 'Scroll Testnet',
    //       symbol: 'ETH',
    //     },
    //     rpcUrls: {
    //       default: 'https://alpha-rpc.scroll.io/l2',
    //     },
    //   },
    //   {
    //     id: 167005,
    //     name: 'Taiko Testnet Alpha 3',
    //     network: 'Taiko Testnet Alpha 3',
    //     nativeCurrency: {
    //       decimals: 18,
    //       name: 'Taiko Testnet',
    //       symbol: 'ETH',
    //     },
    //     rpcUrls: {
    //       default: 'https://rpc.test.taiko.xyz/',
    //     },
    //   },
    //   {
    //   id: 57000,
    //   name: 'Syscoin Rollux Testnet',
    //   network: 'Syscoin Rollux Testnet',
    //   nativeCurrency: {
    //     decimals: 18,
    //     name: 'Syscoin Rollux Testnet',
    //     symbol: 'tSYS',
    //   },
    //   rpcUrls: {
    //     default: 'https://rpc-tanenbaum.rollux.com',
    //   },
      
    // },
    // {
    //   id: 5,
    //   name: 'Goerli Testnet',
    //   network: 'Goerli Testnet',
    //   nativeCurrency: {
    //     decimals: 18,
    //     name: 'Goerli Testnet',
    //     symbol: 'ETH',
    //   },
    //   rpcUrls: {
    //     default: 'https://eth-goerli.g.alchemy.com/v2/9rRR7mdpHignniSvCq9lz1LmJirbXUNo',
    //   },
      
    // },
    ],
    
  //   [alchemyProvider({ alchemyId: process.env.ALCHEMY_ID }), publicProvider()]
    
  // )
  
  [alchemyProvider({ alchemyId: process.env.ALCHEMY_ID }), publicProvider()]
)

const { connectors } = getDefaultWallets({
  appName: 'My App',
  chains,
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

const theme = daisyTheme()

const Web3Wrapper = ({ children }: any) => {
  return (
    <WagmiConfig client={wagmiClient} >
      <RainbowKitProvider coolMode chains={chains} theme={theme}>
        <div>{children}</div>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

export default Web3Wrapper