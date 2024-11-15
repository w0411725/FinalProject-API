import express from 'express';
import cors from 'cors';
import purchaseRouting from './routes/products.js';
import usersRouting from './routes/users.js';

const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(cors({
    origin: 'http://localhost:5173'
}))

// Test route
app.get('/', (req, res) => {
    res.send('Test');
  });

app.use('/products', purchaseRouting)
app.use('/users', usersRouting)

app.listen(port, () =>{
    console.log(`Example app listening on port ${port}`)
});