const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");


//apis
const auth = require("./api/auth");
const job = require("./api/job");

//App
const app = express();

//middlewares
const whitelist = [
    // "https://tradingdiscrepancy.com",
    "http://localhost:3000",
    // "http://192.168.91.151:3000/"
];
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
};
app.use(cors({}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || "5000";


app.get('/', function (req, res) {
    res.send("Hello World!");
});

app.use('/auth', auth);
app.use('/job', job);

app.listen(port, () => {
    console.log(`Server Running at ${port}🚀`);
});