## Invoice Creator

### API's

### Get the details of all accounts in DB
```
https://rapidbooks-assignment.onrender.com/getaccounts
```
### Get the details of all invoices in DB
```
https://rapidbooks-assignment.onrender.com/getinvoices
```
### Create a new account
```
https://rapidbooks-assignment.onrender.com/api/createaccount
```
Body of request
```json
{
    "name": "temp",
    "balances": [{
        "year": "2022-23",
        "balance": 1000
    }]
}
```
### Create a new Invoice
```
https://rapidbooks-assignment.onrender.com/api/createinvoice
```
Body of request
```json
{
    "date": "2023-03-19",
    "customerId": "64169fa295ceaee9c58e1e98",
    "accountArray": [
        {
            "accountId": "64169fc795ceaee9c58e1ea0",
            "amount": "9000"
        },
        {
            "accountId": "64169faf95ceaee9c58e1e9c",
            "amount": "600"
        }
    ],
    "totalAmount": 9600,
    "invoiceNumber": "105",
    "year": "2023-24"
}
```
### Get the list of invoices according to the query
```
https://rapidbooks-assignment.onrender.com/api/invoicelist?skip=0&limit=10&searchText=10
```

