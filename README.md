# FlipBot

FlipBot is a comprehensive Telegram bot that provides a suite of features for managing various aspects of DeFi operations in the Bitcoin ecosystem. It offers functionality for multi-chain wallet management, account management, cross-chain messaging, and cross-chain swaps, utilizing the Chainflip SDK.

## Features

- **Wallets Manager**: Create or import wallets, deposit, and withdraw funds.
- **Chainflip Account Manager**: Fund Chainflip accounts and redeem previously funded accounts.
- **Cross-chain Swap**: Perform instant asset swaps across several chains via deposit channel and vault contract.
- **Cross-chain Messenger**: Communicate across different blockchain networks.

### Supported Chains
- Ethereum
- Polkadot
- Bitcoin
- Arbitrum

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/Kiwilab-xyz/flipbot.git
   ```

2. Install dependencies:
   ```
   cd flipbot
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   MONGODB_URI=your_mongodb_connection_string
   ```

4. Start the bot:
   ```
   npm start
   ```

## Usage

Once the bot is running, you can interact with it on Telegram:

1. Start a chat with the bot by searching for its username on Telegram.
2. Send the `/start` command to begin.
3. Follow the prompts to use the various features.

## Commands

- `/start`: Initialize the bot and view the main menu.
- `Wallets Manager`: Access wallet management features.
- `Chainflip Account Manager`: Manage your Chainflip account.
- `Cross-chain Swap`: Perform cross-chain asset swaps.
- `Cross-chain Messenger`: Send messages across different blockchains.

## Development

This project uses:
- Node.js
- Telegraf.js for the Telegram bot API
- Chainflip SDK for interacting with the Chainflip protocol
- Ethers.js for Ethereum interactions
- Polkadot.js for Polkadot interactions
- BitcoinJS for Bitcoin operations


## Acknowledgements

- [Chainflip SDK](https://github.com/chainflip-io/chainflip-sdk-monorepo)
- [Telegraf](https://github.com/telegraf/telegraf)
- [Ethers.js](https://docs.ethers.io/v5/)
- [Polkadot.js](https://polkadot.js.org/)
- [BitcoinJS](https://github.com/bitcoinjs/bitcoinjs-lib)



This README provides a comprehensive overview of FlipBot, including its features, installation instructions, usage guide, and development information.