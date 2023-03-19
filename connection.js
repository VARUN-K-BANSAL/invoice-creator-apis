require('dotenv').config()
const mongoose = require('mongoose')
const CONNECTION_URL = process.env.CONNECTION_URL

mongoose.connect(CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connection Successful');
}).catch((e) => {
    console.log(e);
})