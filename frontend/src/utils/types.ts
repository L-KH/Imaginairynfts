export interface ContractConfig {
    nft: {
      address: string;
    };
  }
  
  export interface Config {
    [key: string]: ContractConfig;
  }
  