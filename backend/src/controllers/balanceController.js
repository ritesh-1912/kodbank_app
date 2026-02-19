import { getBalanceByUsername } from '../models/KodUser.js';

/**
 * Check Balance Controller
 * Requires authentication middleware to extract username from JWT
 */
export const checkBalance = async (req, res) => {
  try {
    // Username is extracted from JWT token by authMiddleware
    const { username } = req.user;

    // Fetch balance from database using username
    const balance = await getBalanceByUsername(username);

    if (balance === null) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      balance: balance,
      message: `Your balance is: ${balance}`
    });
  } catch (error) {
    console.error('Balance check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching balance'
    });
  }
};
