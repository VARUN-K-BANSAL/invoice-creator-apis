const mongoose = require("mongoose");

const invSchema = mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  accountArray: [
    {
      accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
      },
      amount: {
        type: String,
        required: true,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  invoiceNumber: {
    type: String,
    required: true,
    validate: {
      validator: async function (value) {
        const count = await mongoose
          .model("Invoice")
          .countDocuments({ invoiceNumber: value, year: this.year });
        return count === 0;
      },
      message: "Invoice number already exists for the same year",
    },
  },
  year: {
    type: String,
    required: true,
  },
});

invSchema.pre("validate", function (next) {
  const accountArrayTotal = this.accountArray.reduce(
    (total, account) => total + parseInt(account.amount),
    0
  );
  if (accountArrayTotal !== this.totalAmount) {
    this.invalidate(
      "totalAmount",
      "Total of amount in accountArray should be equal to Total Amount"
    );
  }

  if (this.accountArray.length === 0) {
    this.invalidate(
      "accountArray",
      "Account array should have at least one object"
    );
  }

  next();
});

const Invoice = new mongoose.model("Invoice", invSchema);

module.exports = Invoice;
