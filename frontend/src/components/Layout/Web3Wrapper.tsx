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
        id: 10,
        name: 'Optimism',
        network: 'Optimism Collective',
        nativeCurrency: {
          decimals: 18,
          name: 'Optimism Collective',
          symbol: 'ETH',
        },
        rpcUrls: {
          default: 'https://optimism.meowrpc.com/',
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
    
    {
      id: 59140,
      name: 'Linea Testnet',
      network: 'Linea Testnet',
      nativeCurrency: {
        decimals: 18,
        name: 'Linea Testnet',
        symbol: 'ETH',
      },
      rpcUrls: {
        default: 'https://linea-goerli.infura.io/v3/785f7bb2ad57482d9e033f63e08d24a3',
      },
      
    }
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
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider coolMode chains={chains} theme={theme}>
        <div>{children}</div>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

export default Web3Wrapper
