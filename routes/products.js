import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';

//Prisma setup
const router = express.Router();
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

// Multer setup
const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, 'public/images/'); //save uploaded files in 'public/images' folder
    },
    filename: function (req, file, cb){
        const ext = file.originalname.split('.').pop(); // get file extension
        const uniqueFilename = Date.now() + '-' + Math.round(Math.random() * 1000) + '.' + ext; // generate unique filename = current timestamp + random number between 0 and 1000
        cb(null, uniqueFilename);
    }
})
const upload = multer({ storage: storage});

//
// Routes
//

// Get all products
router.get('/all', async (req, res) => {
    res.send('Test');
});

// Get product by ID
router.get('/:id', async (req, res) => {
    res.send('Test');
});

// Handle purchase (Example)
router.post('/purchase', async (req, res) => {
    res.send('Test');
});

export default router;