// bot.js
const { Telegraf, Markup, session } = require('telegraf');


const WalletModel = require('./walletModel'); // Import the Wallet model schema

const db = require('./db');
require("dotenv").config();

const { transferToken } = require('./utils');
const { fundAccount } = require('./utils');
const { redeemAccount } = require('./utils');
const { swapChannel } = require('./utils');
const { swapVault } = require('./utils');
const { createWallet } = require('./utils');
const { importWallet } = require('./utils');
const { crossMessage } = require('./utils');







const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);




bot.use(session());
// Create a state to manage the conversation flow
const conversationState = {};
// Updated Start command handler
bot.start(async (ctx) => {
    // Extract chatId from ctx
    const chatId = ctx.message.chat.id;
    // Initialize the conversation state for this user
    conversationState[chatId] = {
      step: 'initialStep', // Set the initial step here
    };
  // Check if the user has an existing wallet in the database
  const userId = ctx.from.id;
  const userWallet = await WalletModel.findOne({ userId });

  if (userWallet) {
    // User has an existing wallet
    ctx.replyWithMarkdown('*Welcome to FlipBot from Kiwi Protocol!\n\n Flip Bot is a telegram chat Bot that provides a comprehensive set of features for managing various aspects of DeFi operations in the Chainflip Ecosystem, including multichain wallet manager, Chainflip Account Manager, Cross-chain Messenger, and Cross-chain Swap, utilizing the Chainflip SDK.*\n\nChoose an option:\n\n*Wallets Manager:* Enables users to create or import wallets, deposit, and withdraw.\n\n*Chainflip Account Manager:* Enables users to fund their Chainflip account, and also redeem previously funded $FLIP from their Chainflip account.\n\n*Cross-chain Swap:*  Enables users to perform instant asset swaps across several chains via deposit channel, and vault contract.\n\n*Cross-chain messenger:*  Enables users to communicate across chains.\n\nSupported chains include: *Ethereum, Polkadot, Bitcoin, and Arbitrum*\n\nSupported Assets include: *$ETH, $FLIP, $USDC, $DOT, $BTC, $arbETH, $arbUSDC, and $USDT*', Markup
      .keyboard([
        ['Cross-chain Swap', 'Cross-chain Messenger'], 
        ['Wallets Manager', 'Chainflip Account Manager']

      ])
      .oneTime() 
      .resize()
    );
  } else {
    // User does not have a wallet
    ctx.replyWithMarkdown('*Welcome to FlipBot from Kiwi Protocol!\n\n Flip Bot is a telegram chat Bot that provides a comprehensive set of features for managing various aspects of DeFi operations in the Chainflip Ecosystem, including multichain wallet manager, Chainflip Account Manager, Cross-chain Messenger, and Cross-chain Swap, utilizing the Chainflip SDK.*\n\nChoose an option:\n\n*Wallets Manager:* Enables users to create or import wallets, deposit, and withdraw.\n\n*Chainflip Account Manager:* Enables users to fund their Chainflip account, and also redeem previously funded $FLIP from their Chainflip account.\n\n*Cross-chain Swap:*  Enables users to perform instant asset swaps across several chains via deposit channel, and vault contract.\n\n*Cross-chain messenger:*  Enables users to communicate across chains.\n\nSupported chains include: *Ethereum, Polkadot, Bitcoin, and Arbitrum*\n\nSupported Assets include: *$ETH, $FLIP, $USDC, $DOT, $BTC, $arbETH, $arbUSDC, and $USDT*', Markup
      .keyboard([
        ['Cross-chain Swap', 'Cross-chain Messenger'], 
        ['Wallets Manager', 'Chainflip Account Manager']

      ])
      .oneTime() 
      .resize()
    );
  }
});


// Wallet Management handler 
bot.hears('Wallets Manager', async (ctx) => {
  const userId = ctx.from.id;

  // Check if the user has an existing wallet in the database
  const userWallet = await WalletModel.findOne({ userId });

  if (userWallet) {
    // User has an existing wallet
    ctx.replyWithMarkdown('*You have an existing wallet. What would you like to do?*', Markup
      .keyboard([
        ['Create Wallet', 'Import Wallet'],
        [ 'Deposit', 'Withdraw'], 
      ])
      .oneTime()
      .resize()
    ); 

  } else {
    // User does not have a wallet
    ctx.replyWithMarkdown('*You do not have an existing wallet. Create or Import Wallet.*', Markup
      .keyboard([
        ['Create Wallet', 'Import Wallet'],
        [ 'Deposit', 'Withdraw'], 
      ])
      .oneTime()
      .resize()
    ); 

  }
});




// Create Wallet handler 
bot.hears('Create Wallet', async (ctx) => {

  ctx.replyWithMarkdown('Please enter the network name of the wallet you want to create:\n\n_Available network names are EVM, Bitcoin, and Polkadot_');
});


bot.hears(/^(EVM|Bitcoin|Polkadot)$/, async (ctx) => {
  // Parse the user input
  const input = ctx.message.text.trim().split(' ');
  const network = input[0];


  // This function should be implemented in your code
  await createWallet(ctx, network);
});



bot.hears('Import Wallet', async (ctx) => {
    // Prompt the user to enter their private key
    ctx.replyWithMarkdown('Please enter your private key, and the network name of the wallet you want to import:\n\nFor Example: *0xhsggdvd EVM*\n\n_Available network names are EVM, Bitcoin, and Polkadot_');
});

bot.hears(/^(\S+)\s+(EVM|Bitcoin|Polkadot)$/, async (ctx) => {
  // Parse the user input
  const input = ctx.message.text.trim().split(' ');
  const privateKey = input[0]
  const network = input[1];


  // This function should be implemented in your code
  await importWallet(ctx, privateKey, network);
});


// Deposit handler
bot.hears('Deposit', async (ctx) => {
  const userId = ctx.from.id;

  // Check if the user has an existing wallet in the database
  const userWallets = await WalletModel.find({ userId });

  if (!userWallets || userWallets.length === 0) {
    ctx.reply('No wallets found for your account. Please import a wallet.');
    return;
  }

 await ctx.reply('*Please copy the receiving address, and paste it in your sending wallet or exchange.*', { parse_mode: 'Markdown' })
  // Display each wallet address in separate messages with backticks
  userWallets.forEach((wallet) => {

  
    // Send the address message with the copy button
    ctx.reply(`*Wallet Address (${wallet.network}):*\n\`${wallet.address}\``, { parse_mode: 'Markdown' });
  });
});



bot.hears('Withdraw', async (ctx) => {
  // Retrieve all wallets associated with the user
  const userWallets = await WalletModel.find({ userId: ctx.from.id });

  if (!userWallets || userWallets.length === 0) {
    ctx.reply('No wallets found for your account. Please import a wallet.');
    return;
  }

  // Display the wallets to the user with serial numbers in a shortened form
  let walletListMessage = '*Available wallets:*\n';
  userWallets.forEach((wallet, index) => {
    // Shorten the wallet address by displaying the first 6 and last 4 characters
    const shortAddress = `${wallet.address.substring(0, 6)}...${wallet.address.substring(wallet.address.length - 4)}`;
    walletListMessage += `${index + 1}. (${wallet.network})Wallet Address: ${shortAddress}\n`;
  });

  // Send the message without markdown formatting
  ctx.replyWithMarkdown(walletListMessage);



  // Prompt the user to enter the name, symbol, supply, network name, and token properties
  ctx.replyWithMarkdown('Please enter the serial number of the wallet, token type, network name, token amount, and recipient address\nFor example:* 1 ETH Ethereum 500 recipientAddress*\nThe available network names are: *Ethereum, Arbitrum, Bitcoin, and Polkadot*\n\nAvailable assets are *ETH, FLIP, USDC, DOT, BTC, arbETH, arbUSDC, and USDT*');
}); 

bot.hears(/^(\d+)\s+(\S+)\s+(\S)\s+(\d+(\.\d+)?)\s+(\S+)$/, async (ctx) => {
  // Parse the user input
  const input = ctx.message.text.trim().split(' ');
  const walletIndex = parseInt(input[0], 10) - 1;
  const tokenType = input[1];
  const networkName = input[2];
  const tokenAmount = parseFloat(input[3])
  const recipientAddress = input[4];
  const userWallets = await WalletModel.find({ userId: ctx.from.id });
  // Validate the wallet index
  if (walletIndex < 0 || walletIndex >= userWallets.length) {
    ctx.reply('Invalid wallet number. Please try again.');
    return;
  }
 
  // Get the selected wallet
  const selectedWallet = userWallets[walletIndex];

  // This function should be implemented in your code
  await transferToken(ctx, selectedWallet, tokenType, networkName, tokenAmount, recipientAddress);
});

bot.hears('Chainflip Account Manager', (ctx) => {
  ctx.reply('Choose an option for Chainflip Account Manager:', Markup
    .keyboard([
      ['Fund Account', 'Redeem From Account'],
    ])
    .oneTime()
    .resize()
  );
});



bot.hears('Cross-chain Swap', (ctx) => {
  ctx.reply('Choose an option for Cross-chain Swap:', Markup
    .keyboard([
      ['Swap Via Deposit Channel', 'Swap Via Vault Contract'],
    ])
    .oneTime()
    .resize()
  );
});


bot.hears('Fund Account', async (ctx) => {
  // Retrieve all wallets associated with the user
  const userWallets = await WalletModel.find({ userId: ctx.from.id });

  if (!userWallets || userWallets.length === 0) {
    ctx.reply('No wallets found for your account. Please import a wallet.');
    return;
  }

  // Display the wallets to the user with serial numbers in a shortened form
  let walletListMessage = '*Available wallets:* \n';
  userWallets.forEach((wallet, index) => {
    // Shorten the wallet address by displaying the first 6 and last 4 characters
    const shortAddress = `${wallet.address.substring(0, 6)}...${wallet.address.substring(wallet.address.length - 4)}`;
    walletListMessage += `${index + 1}.  (${wallet.network})Wallet Address: ${shortAddress}\n`;
  });

  // Send the message without markdown formatting
  ctx.replyWithMarkdown(walletListMessage);

  // Prompt the user to enter the name, symbol, supply, network name, and token properties
  ctx.replyWithMarkdown('Please enter the serial number of the wallet, nodeID, and amount of $FLIP tokens to fund.\n\nFor example: *1 nodeID 20*\n\n');
});

// Use the "Add Liquidity" handler with bot.hears
bot.hears(/^(\d+)\s+(\S+)\s+(\d+(\.\d+)?)$/, async (ctx) => {
  // Parse the user input
  const input = ctx.message.text.trim().split(' ');
  const walletIndex = parseInt(input[0], 10) - 1;
  const nodeID = input[1];
  const flipAmount = parseFloat(input[2]);


  const userWallets = await WalletModel.find({ userId: ctx.from.id });
  // Validate the wallet index
  if (walletIndex < 0 || walletIndex >= userWallets.length) {
    ctx.reply('Invalid wallet number. Please try again.');
    return;
  }
 
  // Get the selected wallet
  const selectedWallet = userWallets[walletIndex];

  // This function should be implemented in your code
  await fundAccount(ctx, selectedWallet, nodeID, flipAmount);
});


bot.hears('Redeem From Account', async (ctx) => {
  // Retrieve all wallets associated with the user
  const userWallets = await WalletModel.find({ userId: ctx.from.id });

  if (!userWallets || userWallets.length === 0) {
    ctx.reply('No wallets found for your account. Please import a wallet.');
    return;
  }

  // Display the wallets to the user with serial numbers in a shortened form
  let walletListMessage = '*Available wallets:* \n';
  userWallets.forEach((wallet, index) => {
    // Shorten the wallet address by displaying the first 6 and last 4 characters
    const shortAddress = `${wallet.address.substring(0, 6)}...${wallet.address.substring(wallet.address.length - 4)}`;
    walletListMessage += `${index + 1}.  (${wallet.network})Wallet Address: ${shortAddress}\n`;
  });

  // Send the message without markdown formatting
  ctx.replyWithMarkdown(walletListMessage);

  // Prompt the user to enter the name, symbol, supply, network name, and token properties
  ctx.replyWithMarkdown('Please enter the serial number of the wallet, nodeID, and amount of $FLIP tokens to be redeemed, and Ethereum address that will receive the redeemed $FLIP.\n\nFor example: *1 nodeID 20 redeemAddress*\n\n');
});

// Use the "Add Liquidity" handler with bot.hears
bot.hears(/^(\d+)\s+(\S+)\s+(\d+(\.\d+)?)$/, async (ctx) => {
  // Parse the user input
  const input = ctx.message.text.trim().split(' ');
  const walletIndex = parseInt(input[0], 10) - 1;
  const nodeID = input[1];
  const flipAmount = parseFloat(input[2]);
  const redeemAddress = input[3];


  const userWallets = await WalletModel.find({ userId: ctx.from.id });
  // Validate the wallet index
  if (walletIndex < 0 || walletIndex >= userWallets.length) {
    ctx.reply('Invalid wallet number. Please try again.');
    return;
  }
 
  // Get the selected wallet
  const selectedWallet = userWallets[walletIndex];

  // This function should be implemented in your code
  await redeemAccount(ctx, selectedWallet, nodeID, flipAmount, redeemAddress);
});


bot.hears('Swap Via Deposit Channel', async (ctx) => {
  // Retrieve all wallets associated with the user
  const userWallets = await WalletModel.find({ userId: ctx.from.id });

  if (!userWallets || userWallets.length === 0) {
    ctx.reply('No wallets found for your account. Please import a wallet.');
    return;
  }

  // Display the wallets to the user with serial numbers in a shortened form
  let walletListMessage = '*Available wallets:* \n';
  userWallets.forEach((wallet, index) => {
    // Shorten the wallet address by displaying the first 6 and last 4 characters
    const shortAddress = `${wallet.address.substring(0, 6)}...${wallet.address.substring(wallet.address.length - 4)}`;
    walletListMessage += `${index + 1}.  (${wallet.network})Wallet Address: ${shortAddress}\n`;
  });

  // Send the message without markdown formatting
  ctx.replyWithMarkdown(walletListMessage);

  // Prompt the user to enter the name, symbol, supply, network name, and token properties
  ctx.replyWithMarkdown('Please enter the serial number of the wallet, source chain, source asset, destination chain, destination asset, destination address, and amount of assets to be swapped from source chain.\n\nFor example: *1 Ethereum ETH Bitcoin BTC tb1...sm 20*\n\nAvailable chains are *Ethereum, Polkadot, Bitcoin, and Arbitrum*\n\nAvailable assets are *ETH, FLIP, USDC, DOT, BTC, arbETH, arbUSDC, and USDT*');
});

// Use the "Add Liquidity" handler with bot.hears
bot.hears(/^(\d+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\d+(\.\d+)?)$/, async (ctx) => {
  // Parse the user input
  const input = ctx.message.text.trim().split(' ');
  const walletIndex = parseInt(input[0], 10) - 1;
  const sourceChain = input[1];
  const sourceAsset = input[2];
  const destChain = input[3];
  const destAsset = input[4];
  const destAddress = input[5];
  const flipAmount = parseFloat(input[6]);



  const userWallets = await WalletModel.find({ userId: ctx.from.id });
  // Validate the wallet index
  if (walletIndex < 0 || walletIndex >= userWallets.length) {
    ctx.reply('Invalid wallet number. Please try again.');
    return;
  }
 
  // Get the selected wallet
  const selectedWallet = userWallets[walletIndex];

  // This function should be implemented in your code
  await swapChannel(ctx, selectedWallet, sourceChain, sourceAsset, destChain, destAsset, destAddress, flipAmount);
});


bot.hears('Swap Via Vault Contract', async (ctx) => {
  // Retrieve all wallets associated with the user
  const userWallets = await WalletModel.find({ userId: ctx.from.id });

  if (!userWallets || userWallets.length === 0) {
    ctx.reply('No wallets found for your account. Please import a wallet.');
    return;
  }

  // Display the wallets to the user with serial numbers in a shortened form
  let walletListMessage = '*Available wallets:* \n';
  userWallets.forEach((wallet, index) => {
    // Shorten the wallet address by displaying the first 6 and last 4 characters
    const shortAddress = `${wallet.address.substring(0, 6)}...${wallet.address.substring(wallet.address.length - 4)}`;
    walletListMessage += `${index + 1}.  (${wallet.network})Wallet Address: ${shortAddress}\n`;
  });

  // Send the message without markdown formatting
  ctx.replyWithMarkdown(walletListMessage);

  // Prompt the user to enter the name, symbol, supply, network name, and token properties
  ctx.replyWithMarkdown('Please enter the serial number of the wallet, source chain, source asset, destination chain, destination asset, amount, and destination address.\n\nFor example: *1 Ethereum ETH Bitcoin BTC 20 tb1...sm*\n\nAvailable chains are *Ethereum, Polkadot, Bitcoin, and Arbitrum*\n\nAvailable assets are *ETH, FLIP, USDC, DOT, BTC, arbETH, arbUSDC, and USDT*');
});

// Use the "Add Liquidity" handler with bot.hears
bot.hears(/^(\d+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\d+(\.\d+)?)\s+(\S+)$/, async (ctx) => {
  // Parse the user input
  const input = ctx.message.text.trim().split(' ');
  const walletIndex = parseInt(input[0], 10) - 1;
  const sourceChain = input[1];
  const sourceAsset = input[2];
  const destChain = input[3];
  const destAsset = input[4];
  const flipAmount = parseFloat(input[5]);
  const destAddress = input[6];




  const userWallets = await WalletModel.find({ userId: ctx.from.id });
  // Validate the wallet index
  if (walletIndex < 0 || walletIndex >= userWallets.length) {
    ctx.reply('Invalid wallet number. Please try again.');
    return;
  }
 
  // Get the selected wallet
  const selectedWallet = userWallets[walletIndex];

  // This function should be implemented in your code
  await swapVault(ctx, selectedWallet, sourceChain, sourceAsset, destChain, destAsset, flipAmount, destAddress);
});

bot.hears('Cross-chain Messenger', async (ctx) => {
  // Retrieve all wallets associated with the user
  const userWallets = await WalletModel.find({ userId: ctx.from.id });

  if (!userWallets || userWallets.length === 0) {
    ctx.reply('No wallets found for your account. Please import a wallet.');
    return;
  }

  // Display the wallets to the user with serial numbers in a shortened form
  let walletListMessage = '*Available wallets:* \n';
  userWallets.forEach((wallet, index) => {
    // Shorten the wallet address by displaying the first 6 and last 4 characters
    const shortAddress = `${wallet.address.substring(0, 6)}...${wallet.address.substring(wallet.address.length - 4)}`;
    walletListMessage += `${index + 1}.  (${wallet.network})Wallet Address: ${shortAddress}\n`;
  });

  // Send the message without markdown formatting
  ctx.replyWithMarkdown(walletListMessage);

  // Prompt the user to enter the name, symbol, supply, network name, and token properties
  ctx.replyWithMarkdown('Please enter the serial number of the wallet, source chain, source asset, destination chain, destination asset, destination address, message, and amount of assets to be swapped from source chain.\n\nFor example: *1 Ethereum ETH Bitcoin BTC tb1...sm Oxdead 20*\n\nAvailable chains are *Ethereum, Polkadot, Bitcoin, and Arbitrum*\n\nAvailable assets are *ETH, FLIP, USDC, DOT, BTC, arbETH, arbUSDC, and USDT*');
});

// Use the "Add Liquidity" handler with bot.hears
bot.hears(/^(\d+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\d+(\.\d+)?)$/, async (ctx) => {
  // Parse the user input
  const input = ctx.message.text.trim().split(' ');
  const walletIndex = parseInt(input[0], 10) - 1;
  const sourceChain = input[1];
  const sourceAsset = input[2];
  const destChain = input[3];
  const destAsset = input[4];
  const destAddress = input[5];
  const message = input[6]
  const flipAmount = parseFloat(input[7]);



  const userWallets = await WalletModel.find({ userId: ctx.from.id });
  // Validate the wallet index
  if (walletIndex < 0 || walletIndex >= userWallets.length) {
    ctx.reply('Invalid wallet number. Please try again.');
    return;
  }
 
  // Get the selected wallet
  const selectedWallet = userWallets[walletIndex];

  // This function should be implemented in your code
  await crossMessage(ctx, selectedWallet, sourceChain, sourceAsset, destChain, destAsset, destAddress, message, flipAmount);
});



bot.launch({ handleUpdates: true });

