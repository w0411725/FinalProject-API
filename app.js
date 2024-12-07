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
    origin: 'http://localhost:5173', 
    credentials: true // Allows cookies/sessions to be shared
  }));

  app.use(session({
    secret: 'gndoa#@ghiozaejhfr^&ea',
    resave: false,
    saveUninitialized: false, // Avoid creating sessions until needed
    cookie: {
      httpOnly: true, 
      secure: false, // Set this to true if using HTTPS
      sameSite: 'lax', // This must be lax to allow cross-origin session sharing
      maxAge: 3600000 // 1 hour expiration
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