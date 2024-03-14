import { http, createConfig } from '@wagmi/core'
import { mainnet, linea, lineaTestnet } from '@wagmi/core/chains'

export const wagmiConfig = createConfig({
  chains: [mainnet, linea, lineaTestnet],
  transports: {
    [mainnet.id]: http(),
    [linea.id]: http(),
    [lineaTestnet.id]: http(),
  },
})