import { Connection, PublicKey, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import { Wallet } from '../types/user';
import bs58 from "bs58";
import { solanaConnection } from '../config';

export const getBalance = async (publicKey: PublicKey): Promise<number> => {
    const solAmount = (await solanaConnection.getBalance(publicKey)) / LAMPORTS_PER_SOL;
    console.log("sol amountttttttt", solAmount)
    return solAmount;
};

export const createAccount = async (): Promise<Wallet> => {
    const wallet = Keypair.generate();

    // Convert private key to hex or base58
    const privateKey = Buffer.from(wallet.secretKey).toString('hex'); // Hex encoding for private key
    const publicKey = wallet.publicKey.toBase58(); // Base58 for public key

    return {
        privateKey,
        publicKey
    };
};

// Function to create Keypair from private key in hex format
export const keypairFromPrivateKey = (privateKeyHex: string): Keypair => {
    //Convert the hexadecimal private key to a Uint8Array
    const secretKeyUint8Array = new Uint8Array(
        privateKeyHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
    );
    console.log("privatekey", privateKeyHex)
    const keypair = Keypair.fromSecretKey(secretKeyUint8Array);
    console.log("keypair", keypair)
    return keypair;
};

export const validatorTokenAddr = (pupbkey: string) => {
    try {
        new PublicKey(pupbkey)
        return true
    } catch (e) {
        return false
    }
}