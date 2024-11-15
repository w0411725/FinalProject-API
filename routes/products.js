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
    const products = await prisma.product.findMany();
    res.send(products);
});

// Get product by ID
router.get('/:id', async (req, res) => {
    const id = req.params.id;

    if(!id||isNaN(id)){
        return res.status(400).json({ message: 'Invalid product ID.'});
    }
    try{
        const product = await prisma.product.findUnique({
            where: {
                product_id: parseInt(id)
            }
        });
        res.json(product);
    }
    catch(error){
        return res.status(404).json({ message: 'ID not found'})
    }
});

// Purchase product by ID
router.post('/purchase/:id', async (req, res) => {
    const id = req.params.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'Invalid product ID.' });
    }
    try {
        const product = await prisma.product.findUnique({
            where: {
                product_id: parseInt(id),
            },
        });

        // TODO:
        // 1) Check current product availability
        // 2) Deduct stock from inventory
        // 3) Log a purchase or create an order record

        // Respond with purchase confirmation and product details
        res.status(200).json({
            message: 'Purchase successful!',
            product: {
                id: product.product_id,
                name: product.name,
                description: product.description,
                cost: product.cost,
                image_filename: product.image_filename,
            },
        });
    } catch (error) {
        return res.status(404).json({ message: 'ID not found'})
    }
});

export default router;