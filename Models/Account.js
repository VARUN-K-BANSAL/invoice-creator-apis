const mongoose = require("mongoose");

const accSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  balances: [
    {
      year: {
        type: String,
        required: true,
      },
      balance: {
        type: Number,
        required: true,
      },
    },
  ],
});

const Account = new mongoose.model("Account", accSchema);

module.exports = Account;
