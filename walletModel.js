// walletModel.js
const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: { type: Number, required: true }, // Adjust the data type as needed
  address: { type: String, required: true },
  privateKey: { type: String, required: true },
  network: { type: String, required: true },
});

module.exports = mongoose.model('FlipWallet', walletSchema);
