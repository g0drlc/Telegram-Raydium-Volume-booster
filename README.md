# Telegram Raydium Volume Bot

This Raydium volume bot is designed to automate the distribution of SOL to multiple wallets and execute endless buy and sell swap transactions simultaneously on the Raydium platform. It leverages Solana's blockchain technology to perform these operations efficiently.





https://github.com/user-attachments/assets/09389af0-1ee2-46b8-a113-5f479e1a262f





NOTE: This is a older version of my Solana Volume bot, **join our [Telegram](https://t.me/g0drlc) for more info**


OPEN Source Version:




https://github.com/user-attachments/assets/b62ae9c3-347a-447f-8618-94059fefafb4




## Features
![image](https://github.com/user-attachments/assets/6e5689c3-b7ea-4675-b3d0-e602b0d6164e)


- **Automated SOL Distribution**: Distributes SOL to new wallets.**
- **Endless Buy and Sell Swaps**: Performs simultaneous buy and sell transactions.**
- **Configurable Parameters**: Allows customization of buy amounts, intervals, distribution settings, and more.**
- **Massive Buy Mode**: Enables the configuration of multiple wallets for large-scale buy operations.**
- **Sell Mode**: Gradually sells all tokens in sub-wallets through small transactions.**
- **Token Pair Settings**: Configurable token mint and pool ID for swap operations.**
- **Logging**: Supports adjustable logging levels for better monitoring and debugging.**

## Environment Variables
![image](https://github.com/user-attachments/assets/954f5ba3-e2b8-462f-8780-5d0446ec4a7f)


- **PRIVATE_KEY=                 # Private key for the main wallet**
- **RPC_ENDPOINT=                # RPC endpoint for Solana**
- **RPC_WEBSOCKET_ENDPOINT=      # RPC WebSocket endpoint for Solana**

####### BUY SETTING #######
- **IS_RANDOM=true               # Enable random buy amounts**
- **DISTRIBUTION_AMOUNT=     # Amount of SOL to distribute to each wallet**
- **BUY_AMOUNT=              # Fixed buy amount**
- **BUY_UPPER_AMOUNT=       # Upper limit for random buy amount**
- **BUY_LOWER_AMOUNT=       # Lower limit for random buy amount**

- **BUY_INTERVAL_MAX=        # Maximum interval between buys in milliseconds**
- **BUY_INTERVAL_MIN=        # Minimum interval between buys in milliseconds**

- **CHECK_BAL_INTERVAL=      # Interval to check wallet balances in milliseconds**
- **DISTRIBUTE_WALLET_NUM=      # Number of wallets to distribute SOL to**

- **SWAP_ROUTING=true            # Enable swap routing**

###### FOR MASSIVE BUY #####
- **WALLET_NUM=                 # Number of wallets for massive buy operations**

########## FOR SELL MODE ##########
- **SELL_ALL_BY_TIMES=         # Number of times to sell all tokens in sub-wallets gradually**
- **SELL_PERCENT=             # Percentage of tokens to sell from the main wallet**

#### TOKEN PAIR SETTING ####
- **TOKEN_MINT=                   # Token mint address**
- **POOL_ID=null                  # Pool ID for the token pair**

- **TX_FEE=10                    # Transaction fee**
- **ADDITIONAL_FEE=         # Additional fee (should be larger than 0.006 SOL)**
- **JITO_KEY=                    # Jito key**
- **JITO_FEE=              # Jito fee**
- **BLOCKENGINE_URL=ny.mainnet.block-engine.jito.wtf  # Block engine URL**

###### GENERAL SETTING ######
- **LOG_LEVEL=info               # Logging level (info, debug, error)**

## Additional Resources

For more detailed instructions and updates, DM me at @g0drlc on Telegram. Here you will find comprehensive documentation and community support for any issues you encounter.

### Conclusion

The Solana Volume Bot is a robust tool for managing multiple transactions on the Solana blockchain. By following the setup and execution steps outlined above, you can efficiently handle buying and selling operations with ease.

Optimize your Solana transactions today with the Solana Volume Bot!

For more information, check out our [Telegram](https://t.me/sac_volume_bot)
