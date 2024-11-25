import express from 'express';
import { PrismaClient } from '@prisma/client';
import {hashPassword, comparePassword} from '../lib/utility.js'
import passwordSchema from '../lib/passwordValidator.js';

//Prisma setup
const router = express.Router();
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

//
// Routes
//

// User signup route
router.post('/signup', async (req, res) => {
    const { email, password, first_name, last_name } = req.body;
  
    // Validate input: Ensure no fields are blank
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const passwordRules = passwordSchema.validate(password, {
      list: true 
    });
  
    try {
      // Check if email already exists
      const existingUser = await prisma.customer.findUnique({
        where: { 
          email: email, 
        }
      });
  
      if (existingUser) {
        // If a user with the email already exists, return a conflict error
        return res.status(409).json({ error: 'Email is already in use' });
      }

      if (passwordRules.length > 0) {
        return res.status(400).json({
          error: 'Password does not meet the required policy.',
          details: passwordRules, // Return failed validation rules
        });
      }
  
      // Hash the password using bcrypt
      const hashedPassword = await hashPassword(password);
  
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
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

// User login route

router.post('/login', async (req, res) => {
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
      const isPasswordValid = await comparePassword(password, user.password);
  
      if (!isPasswordValid) {
        // Step 5: If the password is invalid, return 401 Unauthorized
        return res.status(401).json({ error: 'Invalid password' });
      }
      // Step 6: Setup User Session Data
      req.session.email = user.email;
      req.session.user_id = user.customer_id;
      req.session.name = user.first_name+' '+user.last_name;
  
      // Step 7: If the login is successful, return the user's email and a success message
      res.json({
        message: 'Login Successful',
        user: {
          user_id: req.session.user_id,
          email: req.session.email,
          name: req.session.name
        }
      });
  
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// User logout
router.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to logout' });
        }
        res.status(200).json({ message: 'Logout successful' });
    });
  } else {
      res.status(400).json({ error: 'No active session found' });
  }
});

// Get user session
router.get('/getSession', async (req, res) => {
  if (!req.session || !req.session.user_id) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  // Return session data
  res.status(200).json({
    user_id: req.session.user_id,
    email: req.session.email,
    first_name: req.session.first_name,
    last_name: req.session.last_name,
  });
});

export default router;