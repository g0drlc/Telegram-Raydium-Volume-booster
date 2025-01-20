import {
  Keypair,
  Connection,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  ComputeBudgetProgram,
} from '@solana/web3.js'
import {
  RPC_ENDPOINT,
  RPC_WEBSOCKET_ENDPOINT,
} from './constants'
import { Data, readJson } from './utils'
import base58 from 'bs58'
import { User } from '../types/user'
import { solanaConnection } from '../config'
import { keypairFromPrivateKey } from '../utils/utils'


// const mainKp = Keypair.fromSecretKey(new Uint8Array(PRIVATE_KEY.split(',').map(Number)))

export const gather = async (user: User) => {
  const mainKp = keypairFromPrivateKey(user.wallets[0].privateKey);
  const data: Data[] = readJson()
  if (data.length == 0) {
    console.log("No wallet to gather")
    return
  }
  for (let i = 0; i < data.length; i++) {
    try {
      const wallet = Keypair.fromSecretKey(base58.decode(data[i].privateKey))
      const balance = await solanaConnection.getBalance(wallet.publicKey)
      if (balance == 0) {
        console.log("sol balance is 0, skip this wallet")
        continue
      }
      const rent = await solanaConnection.getMinimumBalanceForRentExemption(32);
      console.log("🚀 ~ gather ~ minBalance:", rent)

      const transaction = new Transaction().add(
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 600_000 }),
        ComputeBudgetProgram.setComputeUnitLimit({ units: 20_000 }),
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: mainKp.publicKey,
          lamports: balance - 13 * 10 ** 3 - rent
        })
      )

      transaction.recentBlockhash = (await solanaConnection.getLatestBlockhash()).blockhash
      transaction.feePayer = wallet.publicKey
      console.log(await solanaConnection.simulateTransaction(transaction))
      const sig = await sendAndConfirmTransaction(solanaConnection, transaction, [wallet], { skipPreflight: true })
      console.log({ sig })
    } catch (error) {
      console.log("Failed to gather sol in a wallet")
    }
  }
}
