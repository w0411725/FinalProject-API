import express from 'express';
import cors from 'cors';
import session from 'express-session';

import purchaseRouting from './routes/products.js';
import usersRouting from './routes/users.js';

const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(cors({
    credentials: true //allow cookies
}))
app.use(session({
    secret:'gndoa#@ghiozaejhfr^&ea',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, 
        secure: false, //true if using HTTPS
        sameSite: 'lax', //should be none if client and server are on different origins
        maxAge: 3600000 // 1hr
    }
}))

// Test route
// app.get('/', (req, res) => {
//     res.send('Test');
//   });

app.use('/products', purchaseRouting)
app.use('/users', usersRouting)

app.listen(port, () =>{
    console.log(`Example app listening on port ${port}`)
});