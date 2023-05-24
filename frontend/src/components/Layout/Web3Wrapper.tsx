import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

import { daisyTheme } from '@/utils/rainbowUtils'

const { chains, provider } = configureChains(
  // add any chain you want if its a new chain add chain info 
  // const { chains, provider } = configureChains(
    [{
      id: 57000,
      name: 'Syscoin Rollux Testnet',
      network: 'Syscoin Rollux Testnet',
      nativeCurrency: {
        decimals: 18,
        name: 'Syscoin Rollux Testnet',
        symbol: 'tSYS',
      },
      rpcUrls: {
        default: 'https://rpc-tanenbaum.rollux.com',
      },
      
    },
    {
      id: 5,
      name: 'Goerli Testnet',
      network: 'Goerli Testnet',
      nativeCurrency: {
        decimals: 18,
        name: 'Goerli Testnet',
        symbol: 'ETH',
      },
      rpcUrls: {
        default: 'https://eth-goerli.g.alchemy.com/v2/9rRR7mdpHignniSvCq9lz1LmJirbXUNo',
      },
      
    }],
    
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
