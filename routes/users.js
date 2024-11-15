import express from 'express';
import multer from 'multer';
import bcrypt from 'bcryptjs';
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

// User signup route
router.post('/signup', upload.none(), async (req, res) => {
    const { email, password, first_name, last_name } = req.body;
  
    // Validate input: Ensure no fields are blank
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    try {
      // Check if email already exists
      const existingUser = await prisma.customer.findUnique({
        where: { email },
      });
  
      if (existingUser) {
        // If a user with the email already exists, return a conflict error
        return res.status(409).json({ error: 'Email is already in use' });
      }
  
      // Hash the password using bcrypt
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create the user in the database
      const newUser = await prisma.customer.create({
        data: {
          email,
          password: hashedPassword, // Store the hashed password
          first_name,
          last_name,
        },
      });
  
      res.status(201).json(newUser); // Respond with the new user data
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

// User login route

//temp users for testing
//johndoe@example.com
//janedoe@example.com

//temp passwords for testing
//securePassword123
//securePassword123456

router.post('/login', upload.none(), async (req, res) => {
    const { email, password } = req.body;
  
    // Step 1: Validate input to ensure no fields are blank
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
  
    try {
      // Step 2: Check if the user exists by email
      const user = await prisma.customer.findUnique({
        where: { email },
      });
  
      if (!user) {
        // Step 3: If user doesn't exist, return 404 Not Found
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Step 4: Compare the hashed password in the database with the provided password
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        // Step 5: If the password is invalid, return 401 Unauthorized
        return res.status(401).json({ error: 'Invalid password' });
      }
  
      // Step 6: If the login is successful, return the user's email
      res.status(200).json({ email: user.email });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// User logout (simplified)
router.post('/logout', (req, res) => {
    res.send('Test');
});

// Get user session (simplified)
router.get('/getSession', (req, res) => {
    res.send('Test');
});

export default router;