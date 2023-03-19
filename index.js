require("dotenv").config();
const express = require("express");
const app = express();
const PORT = 5000;
const mongoose = require("mongoose");
require("./connection");

const Invoice = require("./Models/Invoice");
const Account = require("./Models/Account");

app.use(express.json());

app.get('/getaccounts', async (req, res) => {
  const accounts = await Account.find();
  res.status(200).send(accounts)
})
app.get('/getinvoices', async (req, res) => {
  const invoices = await Invoice.find();
  res.status(200).send(invoices)
})

app.post("/api/createinvoice", async (req, res) => {
  const { date, customerId, accountArray, totalAmount, invoiceNumber, year } =
    req.body;

  try {
    if (
      !date ||
      !customerId ||
      !accountArray ||
      !totalAmount ||
      !invoiceNumber ||
      !year
    ) {
      return res.status(400).send({ error: "All fields are compulsory" });
    }

    if (accountArray.length === 0) {
      return res
        .status(400)
        .send({ error: "Account array should have at least one object" });
    }

    const accountIds = accountArray.map((obj) => obj.accountId);
    const accounts = await Account.find({ _id: { $in: accountIds } });
    if (accounts.length !== accountIds.length) {
      return res
        .status(400)
        .send({ error: "One or more accountIds do not exist in the database" });
    }

    const existingInvoice = await Invoice.findOne({
      invoiceNumber: invoiceNumber,
      year: year,
    });
    if (existingInvoice) {
      return res
        .status(400)
        .send({ error: "Invoice number already exists for the same year" });
    }

    const accountArrayTotal = accountArray.reduce(
      (acc, obj) => acc + parseInt(obj.amount),
      0
    );
    if (accountArrayTotal !== totalAmount) {
      return res.status(400).send({
        error:
          "Total of amount in accountArray should be equal to Total Amount",
      });
    }

    const invoice = new Invoice({
      date: date,
      customerId: customerId,
      accountArray: accountArray,
      totalAmount: totalAmount,
      invoiceNumber: invoiceNumber,
      year: year,
    });

    await invoice.save();

    await Promise.all(
      accountArray.map(async (obj) => {
        let account = await Account.findById(obj.accountId);
        for(let i=0; i<account.balances.length; i++) {
            if(account.balances[i].year === year) {
              account.balances[i].balance += obj.amount
            }
        }
        await account.save();
      })
    );

    res
      .status(201)
      .send({ message: "Invoice created successfully", invoice: invoice });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

app.post("/api/createaccount", async (req, res) => {
  try {
    const { name, balances } = req.body;

    const existingAccount = await Account.findOne({ name });
    if (existingAccount) {
      return res
        .status(400)
        .send({ message: "An account with the same name already exists" });
    }

    const account = new Account({ name, balances });
    await account.save();

    res.status(201).send({ message: "Account created successfully", account });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error" });
  }
});

async function getAccountIdsBySearchText(searchText) {
  const accounts = await mongoose.model("Account").find(
    {
      "name": { "$regex": searchText, "$options": "i" }
    }
  );
  console.log(accounts);
  return accounts.map((account) => account._id);
}

app.get("/api/invoicelist", async (req, res) => {
  const skip = parseInt(req.query.skip) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const searchText = req.query.searchText || "";

  try {
    const searchTextRegex = `/.*${searchText}.*/i`

    console.log(searchTextRegex);
    const invoices = await Invoice.find({
      $or: [
        { "invoiceNumber": { "$regex": searchText, "$options": "i" } },
        {
          "customerId": { $in: await getAccountIdsBySearchText(searchText) },
        },
        { "accountArray" : { "$elemMatch" : { "amount": { "$regex": searchText, "$options": "i" }}} },
      ],
    })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const totalInvoices = await Invoice.countDocuments({
      $or: [
        { "invoiceNumber": { "$regex": searchText, "$options": "i" } },
        {
          "customerId": { $in: await getAccountIdsBySearchText(searchText) },
        },
        { "accountArray" : { "$elemMatch" : { "amount": { "$regex": searchText, "$options": "i" }}} },
      ],
    });

    console.log(totalInvoices);

    res.status(200).json({
      message: "Invoices retrieved successfully",
      invoices: invoices,
      totalInvoices: totalInvoices,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/*", (req, res) => {
  res.status(404).send({
    success: false,
    message: "Not a proper API",
  });
});

app.listen(PORT, () => {
  console.log(`Server is started on PORT : ${PORT}`);
});
