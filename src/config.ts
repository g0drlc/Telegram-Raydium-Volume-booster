import dotenv from "dotenv";
import { Connection } from "@solana/web3.js";
dotenv.config();

export const solanaConnection = new Connection(process.env.RPC_ENDPOINT!, {
    wsEndpoint: process.env.RPC_WEBSOCKET_ENDPOINT,
})

export const GENERIC_ERROR_MESSAGE =
    "An error occurred. Please try again later.";