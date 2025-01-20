export interface User {
  id: number;
  username: string;
  wallets: Wallet[];
  tokenAddr: string;
  distributionAmount: number;
  buyUpperAmount: number;
  buyLowerAmount: number;
  buyIntervalMax: number;
  buyIntervalMin: number;
  distributionWalletNum: number;
  sellAllByTimes: number;
  slippage: number;  // Changed from `0` to `number`
}

export interface Wallet {
  privateKey: string;
  publicKey: string;
}