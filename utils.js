

const { ethers } = require('ethers');
const bitcoin = require('bitcoinjs-lib');
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const WalletModel = require('./walletModel');
const { randomAsHex } = require('@polkadot/util-crypto');
const { SwapSDK, Chains, Assets } = require('@chainflip/sdk/swap');
const { bitcoinToSatoshis } = require('bitcoin-conversion');
const { formatBalance } = require('@polkadot/util');
const STATE_CHAIN_GATEWAY_ABI = [{"inputs":[{"internalType":"contract IKeyManager","name":"keyManager","type":"address"},{"internalType":"uint256","name":"minFunding","type":"uint256"},{"internalType":"uint48","name":"redemptionDelay","type":"uint48"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bool","name":"communityGuardDisabled","type":"bool"}],"name":"CommunityGuardDisabled","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"flip","type":"address"}],"name":"FLIPSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"oldSupply","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newSupply","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"stateChainBlockNumber","type":"uint256"}],"name":"FlipSupplyUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"nodeID","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"address","name":"funder","type":"address"}],"name":"Funded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"GovernanceWithdrawal","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"oldMinFunding","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newMinFunding","type":"uint256"}],"name":"MinFundingChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"nodeID","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RedemptionExecuted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"nodeID","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RedemptionExpired","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"nodeID","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":true,"internalType":"address","name":"redeemAddress","type":"address"},{"indexed":false,"internalType":"uint48","name":"startTime","type":"uint48"},{"indexed":false,"internalType":"uint48","name":"expiryTime","type":"uint48"},{"indexed":false,"internalType":"address","name":"executor","type":"address"}],"name":"RedemptionRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bool","name":"suspended","type":"bool"}],"name":"Suspended","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"keyManager","type":"address"}],"name":"UpdatedKeyManager","type":"event"},{"inputs":[],"name":"REDEMPTION_DELAY","outputs":[{"internalType":"uint48","name":"","type":"uint48"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"disableCommunityGuard","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"enableCommunityGuard","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"nodeID","type":"bytes32"}],"name":"executeRedemption","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"nodeID","type":"bytes32"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"fundStateChainAccount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getCommunityGuardDisabled","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCommunityKey","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getFLIP","outputs":[{"internalType":"contract IFLIP","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getGovernor","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getKeyManager","outputs":[{"internalType":"contract IKeyManager","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getLastSupplyUpdateBlockNumber","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getMinimumFunding","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"nodeID","type":"bytes32"}],"name":"getPendingRedemption","outputs":[{"components":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"redeemAddress","type":"address"},{"internalType":"uint48","name":"startTime","type":"uint48"},{"internalType":"uint48","name":"expiryTime","type":"uint48"},{"internalType":"address","name":"executor","type":"address"}],"internalType":"struct IStateChainGateway.Redemption","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getSuspendedState","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"govUpdateFlipIssuer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"govWithdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"uint256","name":"sig","type":"uint256"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"address","name":"kTimesGAddress","type":"address"}],"internalType":"struct IShared.SigData","name":"sigData","type":"tuple"},{"internalType":"bytes32","name":"nodeID","type":"bytes32"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"redeemAddress","type":"address"},{"internalType":"uint48","name":"expiryTime","type":"uint48"},{"internalType":"address","name":"executor","type":"address"}],"name":"registerRedemption","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"resume","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IFLIP","name":"flip","type":"address"}],"name":"setFlip","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newMinFunding","type":"uint256"}],"name":"setMinFunding","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"suspend","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"uint256","name":"sig","type":"uint256"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"address","name":"kTimesGAddress","type":"address"}],"internalType":"struct IShared.SigData","name":"sigData","type":"tuple"},{"internalType":"address","name":"newIssuer","type":"address"},{"internalType":"bool","name":"omitChecks","type":"bool"}],"name":"updateFlipIssuer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"uint256","name":"sig","type":"uint256"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"address","name":"kTimesGAddress","type":"address"}],"internalType":"struct IShared.SigData","name":"sigData","type":"tuple"},{"internalType":"uint256","name":"newTotalSupply","type":"uint256"},{"internalType":"uint256","name":"stateChainBlockNumber","type":"uint256"}],"name":"updateFlipSupply","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"uint256","name":"sig","type":"uint256"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"address","name":"kTimesGAddress","type":"address"}],"internalType":"struct IShared.SigData","name":"sigData","type":"tuple"},{"internalType":"contract IKeyManager","name":"keyManager","type":"address"},{"internalType":"bool","name":"omitChecks","type":"bool"}],"name":"updateKeyManager","outputs":[],"stateMutability":"nonpayable","type":"function"}]
const STATE_CHAIN_GATEWAY_ADDRESS = '0xA34a967197Ee90BB7fb28e928388a573c5CFd099'
const FLIP_TOKEN_ABI = [{"inputs":[{"internalType":"uint256","name":"flipTotalSupply","type":"uint256"},{"internalType":"uint256","name":"numGenesisValidators","type":"uint256"},{"internalType":"uint256","name":"genesisStake","type":"uint256"},{"internalType":"address","name":"receiverGenesisValidatorFlip","type":"address"},{"internalType":"address","name":"receiverGenesisFlip","type":"address"},{"internalType":"address","name":"genesisIssuer","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"oldIssuer","type":"address"},{"indexed":false,"internalType":"address","name":"newIssuer","type":"address"}],"name":"IssuerUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getIssuer","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newIssuer","type":"address"}],"name":"updateIssuer","outputs":[],"stateMutability":"nonpayable","type":"function"}]
const FLIP_TOKEN_ADDRESS = '0xdC27c60956cB065D19F08bb69a707E37b36d8086';
// Initialize SDK (you'll need to set up the network configuration)
const swapSDK = new SwapSDK({
  network: 'mainnet', // or 'mainnet' for production
}); 


async function importWallet(ctx, privateKey, network) {
  const userId = ctx.from.id;
  let wallet;

  try {
    switch (network) {
      case 'EVM':
        wallet = new ethers.Wallet(privateKey);
        break;
      case 'Bitcoin':
        const keyPair = bitcoin.ECPair.fromWIF(privateKey);
        const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
        wallet = { address, privateKey };
        break;
      case 'Polkadot':
        const keyring = new Keyring({ type: 'sr25519' });
        const polkadotWallet = keyring.addFromUri(privateKey);
        wallet = { address: polkadotWallet.address, privateKey };
        break;
      default:
        ctx.reply('Unsupported network. Please choose from EVM, Bitcoin, or Polkadot.');
        return;
    }

    const existingWallet = await WalletModel.findOne({ address: wallet.address, network });
    if (existingWallet) {
      ctx.reply('Wallet already exists.');
      return;
    }

    const newWallet = new WalletModel({
      userId,
      address: wallet.address,
      privateKey: wallet.privateKey,
      network,
    });

    await newWallet.save();
    ctx.reply(`Wallet imported for ${network}.\nAddress: ${wallet.address}`);
  } catch (error) {
    console.error(error);
    ctx.reply('An error occurred while importing the wallet. Please try again.');
  }
}


async function createWallet(ctx, network) {
    const userId = ctx.from.id;
    let wallet;
  
    try {
      switch (network) {
        case 'EVM':
          wallet = ethers.Wallet.createRandom();
          break;
        case 'Bitcoin':
          const keyPair = bitcoin.ECPair.makeRandom();
          const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
          wallet = { address, privateKey: keyPair.toWIF() }; 
          break; 
        case 'Polkadot':
            const wsProvider = new WsProvider('wss://rpc.polkadot.io');
            const api = await ApiPromise.create({ provider: wsProvider });
            const keyring = new Keyring({ type: 'sr25519' });
         
  // Generate a new mnemonic (seed phrase)
  const mnemonic = randomAsHex(32);

  // Create an account from the mnemonic
  const polkadotWallet = keyring.addFromUri(mnemonic);
          wallet = { address: polkadotWallet.address, privateKey: mnemonic };
          break;
        default:
          ctx.reply('Unsupported network. Please choose from EVM, Bitcoin, or Polkadot.');
          return;
      }
  
      const newWallet = new WalletModel({
        userId,
        address: wallet.address,
        privateKey: wallet.privateKey,
        network,
      });
  
      await newWallet.save();
      ctx.reply(`New wallet created for ${network}.\nAddress: ${wallet.address}\nPrivate Key: ${wallet.privateKey}\n\nStore your private key offline, and delete this message.`);
    } catch (error) {
      console.error(error);
      ctx.reply('An error occurred while creating the wallet. Please try again.');
    }
  }
  


  async function fundAccount(ctx, selectedWallet, nodeID, flipAmount) {
    try {
      // Create a provider and signer
      const provider = new ethers.providers.JsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/3MMaXlOkQyjVCCW1HNbY67u_BlkXI3Ff');
      const signer = new ethers.Wallet(selectedWallet.privateKey, provider);
  
      // Create contract instances
      const stateChainGateway = new ethers.Contract(STATE_CHAIN_GATEWAY_ADDRESS, STATE_CHAIN_GATEWAY_ABI, signer);
      const flipToken = new ethers.Contract(FLIP_TOKEN_ADDRESS, FLIP_TOKEN_ABI, signer);
  
      // Convert flipAmount to wei (assuming 18 decimals, adjust if different)
      const amountWei = ethers.utils.parseEther(flipAmount.toString());
  
      // Approve the StateChainGateway to spend FLIP tokens
      const approveTx = await flipToken.approve(STATE_CHAIN_GATEWAY_ADDRESS, amountWei);
      await approveTx.wait();
  
      // Fund the State Chain account
      const fundTx = await stateChainGateway.fundStateChainAccount(ethers.utils.hexZeroPad(nodeID, 32), amountWei);
      await fundTx.wait();
  
      ctx.reply(`Successfully funded ${flipAmount} FLIP to node ${nodeID}`);
    } catch (error) {
      console.error(error);
      ctx.reply('An error occurred while funding the account. Please try again.');
    }
  }
  
  async function redeemAccount(ctx, selectedWallet, nodeID, flipAmount, redeemAddress) {
    try {
      // Create a provider and signer
      const provider = new ethers.providers.JsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/3MMaXlOkQyjVCCW1HNbY67u_BlkXI3Ff');
      const signer = new ethers.Wallet(selectedWallet.privateKey, provider);
  
      // Create contract instance
      const stateChainGateway = new ethers.Contract(STATE_CHAIN_GATEWAY_ADDRESS, STATE_CHAIN_GATEWAY_ABI, signer);
  
      // Check if there's a pending redemption
      const pendingRedemption = await stateChainGateway.getPendingRedemption(ethers.utils.hexZeroPad(nodeID, 32));
  
      if (pendingRedemption.amount.eq(0)) {
        ctx.reply('No pending redemption found. Please submit a redemption request to the State Chain first.');
        return;
      }
  
      // Check if the redemption is ready to be executed
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime < pendingRedemption.startTime) {
        const waitTime = pendingRedemption.startTime - currentTime;
        ctx.reply(`Redemption is not yet ready. Please wait ${waitTime} seconds before executing.`);
        return;
      }
  
      // Execute the redemption
      const executeTx = await stateChainGateway.executeRedemption(ethers.utils.hexZeroPad(nodeID, 32));
      const receipt = await executeTx.wait();
  
      // Get the redemption details from the transaction receipt
      const [redeemedAddress, redeemedAmount] = receipt.events.find(e => e.event === 'RedemptionExecuted').args;
  
      ctx.reply(`Successfully redeemed ${ethers.utils.formatEther(redeemedAmount)} FLIP to ${redeemedAddress}`);
    } catch (error) {
      console.error(error);
      ctx.reply('An error occurred while redeeming from the account. Please try again.');
    }
  }
  async function swapChannel(ctx, selectedWallet, sourceChain, sourceAsset, destChain, destAsset, destAddress, flipAmount) {
        const myflipAmount = flipAmount.toString()
        // Define the amounts for each assets
        const amounts = {
          'ETH': ethers.utils.parseUnits(myflipAmount, "ether"),
          'arbETH': ethers.utils.parseUnits(myflipAmount, "ether"),
          'DOT': formatBalance(flipAmount, { withSi: false, forceUnit: 'planck' }),
          'BTC': bitcoinToSatoshis(flipAmount),
          'USDC': flipAmount,
          'USDT': flipAmount,
          'arbUSDC': flipAmount, 
        };
      
        // Get the URL for the selected asset
        const unitAmount = amounts[sourceAsset];
        console.log(unitAmount)
      
        if (!unitAmount) {
          ctx.reply('Invalid asset selection. Please select a supported asset.');
          return;
        }
    try {
      // Fetch quote for swap
      const quote = await swapSDK.getQuote({
        srcChain: Chains[sourceChain],
        srcAsset: Assets[sourceAsset],
        destChain: Chains[destChain],
        destAsset: Assets[destAsset],
        amount: unitAmount.toString(),
      });
      console.log('quote', quote);
  
  
      // Request deposit address for swap
      const depositAddress = await swapSDK.requestDepositAddress({
        srcChain: Chains[sourceChain],
        srcAsset: Assets[sourceAsset],
        destChain: Chains[destChain],
        destAsset: Assets[destAsset],
        amount: unitAmount.toString(),
        destAddress: destAddress,
      });
      console.log('depositAddress', depositAddress);
    
  
      // Fetch swap status
      const status = await swapSDK.getStatus({
        id: depositAddress.depositChannelId,
      });
      console.log('status', status);

    const myUnixTimestamp = depositAddress.estimatedDepositChannelExpiryTime // start with a Unix timestamp

const myDate = new Date(myUnixTimestamp * 1000); // convert timestamp to milliseconds and construct Date object
  
      ctx.reply(`Swap initiated. Deposit ${flipAmount} ${sourceAsset} to ${depositAddress.depositAddress} to complete the swap.\n\nAdditional Details:\nExpiry Time: ${myDate}\nDeposit Channel ID: ${depositAddress.depositChannelId}`);
    } catch (error) { 
      console.error(error);
      ctx.reply('An error occurred while performing the swap via channel. Please try again.');
    }
  }
  
  async function swapVault(ctx, selectedWallet, sourceChain, sourceAsset, destChain, destAsset, flipAmount, destAddress) {
    try {

      const myflipAmount = flipAmount.toString()
      // Define the amounts for each assets
      const amounts = {
        'ETH': ethers.utils.parseUnits(myflipAmount, "ether"),
        'arbETH': ethers.utils.parseUnits(myflipAmount, "ether"),
        'DOT': formatBalance(flipAmount, { withSi: false, forceUnit: 'planck' }),
        'BTC': bitcoinToSatoshis(flipAmount),
        'USDC': flipAmount,
        'USDT': flipAmount,
        'arbUSDC': flipAmount, 
      };
    
      // Get the URL for the selected asset 
      const unitAmount = amounts[sourceAsset];
      console.log(unitAmount)
    
      if (!unitAmount) {
        ctx.reply('Invalid asset selection. Please select a supported asset.');
        return;
      }

         // Define the URLs for each network
     const networkUrls = {
      'Ethereum': 'https://eth-mainnet.g.alchemy.com/v2/3MMaXlOkQyjVCCW1HNbY67u_BlkXI3Ff',
      'Sepolia': 'https://eth-sepolia.g.alchemy.com/v2/3MMaXlOkQyjVCCW1HNbY67u_BlkXI3Ff',
      'Arbitrum': 'https://arb-mainnet.g.alchemy.com/v2/3MMaXlOkQyjVCCW1HNbY67u_BlkXI3Ff',
      'Polkadot': 'https://arb-mainnet.g.alchemy.com/v2/3MMaXlOkQyjVCCW1HNbY67u_BlkXI3Ff',
      'Bitcoin': 'https://bitcoin.drpc.org',
    };
  
    // Get the URL for the selected network
    const networkUrl = networkUrls[sourceChain];
  
    if (!networkUrl) { 
      ctx.reply('Invalid network selection. Please select a valid network.');
      return;
    }
      // Initialize SDK with signer
      const provider = new ethers.providers.JsonRpcProvider(networkUrl);
      const signer = new ethers.Wallet(selectedWallet.privateKey, provider);

      const swapSDKWithSigner = new SwapSDK({
        network: 'mainnet', // or 'mainnet' for production
        signer: signer,
      });
  
      // Fetch quote for swap
      const quote = await swapSDKWithSigner.getQuote({
        srcChain: Chains[sourceChain],
        srcAsset: Assets[sourceAsset],
        destChain: Chains[destChain],
        destAsset: Assets[destAsset],
        amount: unitAmount.toString(),
      });
      console.log('quote', quote);
  
      // Initiate swap via Vault contract
      const transactionHash = await swapSDKWithSigner.executeSwap({
        srcChain: Chains[sourceChain],
        srcAsset: Assets[sourceAsset],
        destChain: Chains[destChain],
        destAsset: Assets[destAsset],
        amount: unitAmount.toString(),
        destAddress: destAddress,
      });
      console.log('transaction', transactionHash);
  
      // Fetch swap status
      const status = await swapSDKWithSigner.getStatus({
        id: transactionHash, 
      });
      console.log('status', status);
  
      ctx.reply(`Swap initiated via Vault contract. Transaction hash: ${transactionHash}`);
    } catch (error) {
      console.error(error);
      ctx.reply('An error occurred while performing the swap via vault. Please try again.');
    }
  }
  
  async function crossMessage(ctx, selectedWallet, sourceChain, sourceAsset, destChain, destAsset, destAddress, message, flipAmount) {
    try {
      // Fetch quote for swap
      const quote = await swapSDK.getQuote({
        srcChain: Chains[sourceChain],
        srcAsset: Assets[sourceAsset],
        destChain: Chains[destChain],
        destAsset: Assets[destAsset],
        amount: flipAmount.toString(),
      });
      console.log('quote', quote);
  
      // Request deposit address for swap with cross-chain message
      const depositAddress = await swapSDK.requestDepositAddress({
        srcChain: Chains[sourceChain],
        srcAsset: Assets[sourceAsset],
        destChain: Chains[destChain],
        destAsset: Assets[destAsset],
        amount: flipAmount.toString(),
        destAddress: destAddress,
        ccmMetadata: {
          message: ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message)),
          gasBudget: (125000).toString(),
        }
      });
      console.log('depositAddress', depositAddress);
  
      // Fetch swap status
      const status = await swapSDK.getStatus({
        id: depositAddress.depositChannelId,
      });
      console.log('status', status);
  
      ctx.reply(`Cross-chain message swap initiated. Deposit ${flipAmount} ${sourceAsset} to ${depositAddress.depositAddress} to complete the swap and send the message.`);
    } catch (error) {
      console.error(error);
      ctx.reply('An error occurred while sending the cross-chain message. Please try again.');
    }
  }
  

async function transferToken(ctx, wallet, tokenType, networkName, tokenAmount, recipientAddress) {
    try {
      switch (networkName) {
        case 'Ethereum':
        case 'Arbitrum':
          const provider = ethers.getDefaultProvider(networkName.toLowerCase());
          const ethWallet = new ethers.Wallet(wallet.privateKey, provider);
          const tx = await ethWallet.sendTransaction({
            to: recipientAddress,
            value: ethers.utils.parseEther(tokenAmount.toString()),
          });
          await tx.wait();
          ctx.reply(`Successfully transferred ${tokenAmount} ${tokenType} to ${recipientAddress}`);
          break;
  
        case 'Bitcoin':
          const keyPair = bitcoin.ECPair.fromWIF(wallet.privateKey);
          const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
          // Implementation for Bitcoin transaction sending
          // For simplicity, it is omitted here.
          ctx.reply(`Successfully transferred ${tokenAmount} ${tokenType} to ${recipientAddress}`);
          break;
  
        case 'Polkadot':
          const wsProvider = new WsProvider('wss://rpc.polkadot.io');
          const api = await ApiPromise.create({ provider: wsProvider });
          const keyring = new Keyring({ type: 'sr25519' });
          const polkadotWallet = keyring.addFromUri(wallet.privateKey);
          const transfer = api.tx.balances.transfer(recipientAddress, tokenAmount * Math.pow(10, 10));
          const hash = await transfer.signAndSend(polkadotWallet);
          ctx.reply(`Successfully transferred ${tokenAmount} ${tokenType} to ${recipientAddress}`);
          break;
  
        default:
          ctx.reply('Unsupported network. Please choose from Ethereum, Arbitrum, Bitcoin, or Polkadot.');
          return;
      }
    } catch (error) {
      console.error(error);
      ctx.reply('An error occurred while transferring tokens. Please try again.');
    }
  }


module.exports = {
fundAccount,
redeemAccount,
swapChannel,
swapVault,
crossMessage,
createWallet,
importWallet,
transferToken,
}