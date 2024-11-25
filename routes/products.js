import express from 'express';
import { PrismaClient } from '@prisma/client';

//Prisma setup
const router = express.Router();
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

//
// Routes
//

// Get all products
router.get('/all', async (req, res) => {
    try {
        // Fetch all products from the database
        const products = await prisma.product.findMany();

        // Return the products as a JSON response
        res.status(200).json(products);

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get product by ID
router.get('/:id', async (req, res) => {
    const id = req.params.id;

    // Validate if the ID is a valid integer
    if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'Invalid product ID.' });
    }

    try {
        // Retrieve the product from the database
        const product = await prisma.product.findUnique({
            where: {
                product_id: parseInt(id)
            },
        });

        // Check if the product exists
        if (!product) {
            return res.status(404).json({ message: `Product with ID ${id} not found.` });
        }

        // Return the product as a JSON response
        res.status(200).json(product);

    } catch (error) {
        res.status(500).json({ message: 'Error retrieving product' });
    }
});

// Purchase product by ID
router.post('/purchase', async (req, res) => {

    // Check if the user is logged in
    if (!req.session || !req.session.user_id) {
        return res.status(401).json({ error: 'Unauthorized: Please log in.' });
    }

    const {
        street,
        city,
        province,
        country,
        postal_code,
        credit_card,
        credit_expire,
        credit_cvv,
        cart,
        invoice_amt,
        invoice_tax,
        invoice_total,
    } = req.body;

    // Validate input
    if (!street || !city || !province || !country || !postal_code || !credit_card || !credit_expire || !credit_cvv || !cart || !invoice_amt || !invoice_tax || !invoice_total) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Parse the cart string into an array of product IDs
        const cartItems = cart.split(',').map(Number);
        const productCounts = cartItems.reduce((acc, productId) => {
            acc[productId] = (acc[productId] || 0) + 1;
            return acc;
        }, {});

        // Create a purchase record
        const customer_id = req.session.user_id;
        const purchase = await prisma.purchase.create({
            data: {
                customer_id,
                street,
                city,
                province,
                country,
                postal_code,
                credit_card,
                credit_expire,
                credit_cvv,
                invoice_amt: parseFloat(invoice_amt),
                invoice_tax: parseFloat(invoice_tax),
                invoice_total: parseFloat(invoice_total),
                order_date: new Date(),
            },
        });

        // Create purchase items for each product in the cart
        const purchaseItems = [];
        for (const [product_id, quantity] of Object.entries(productCounts)) {

            // Check if the product exists
            const product = await prisma.product.findUnique({
                where: { product_id: parseInt(product_id) },
            });

            if (!product) {
                return res.status(400).json({ error: `Product ID ${product_id} not found.` });
            }

            // Create a PurchaseItem entry
            const purchaseItem = await prisma.purchaseItem.create({
                data: {
                    purchase_id: purchase.purchase_id,
                    product_id: parseInt(product_id),
                    quantity,
                },
            });
            purchaseItems.push(purchaseItem);
        }

        // Return a success response
        res.status(201).json({
            message: 'Purchase completed successfully!',
            purchase,
            items: purchaseItems,
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to complete purchase' });
    }
});

export default router;