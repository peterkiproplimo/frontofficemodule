/**
 * M-Pesa Routes Test
 * This file contains test examples for the M-Pesa API endpoints
 */

// Example test data for M-Pesa endpoints
const testData = {
  // Deposit test data
  deposit: {
    phone: "254712345678",
    amount: 100,
    userId: "60f7b3b3b3b3b3b3b3b3b3b3"
  },
  
  // Withdrawal test data
  withdrawal: {
    phone: "254712345678",
    amount: 50,
    userId: "60f7b3b3b3b3b3b3b3b3b3b3"
  },
  
  // Transaction status test data
  transactionStatus: {
    transactionId: "OEI2AK4Q16"
  }
};

// Example API endpoints
const endpoints = {
  deposit: "POST /api/mpesa/deposit",
  withdraw: "POST /api/mpesa/withdraw", 
  transactionStatus: "POST /api/mpesa/transaction-status",
  callback: "POST /api/mpesa/callback",
  transactionTimeout: "POST /api/mpesa/transaction-timeout",
  transactionResult: "POST /api/mpesa/transaction-result"
};

console.log("M-Pesa API Endpoints:");
console.log("===================");
Object.entries(endpoints).forEach(([key, endpoint]) => {
  console.log(`${key}: ${endpoint}`);
});

console.log("\nTest Data Examples:");
console.log("==================");
console.log("Deposit:", testData.deposit);
console.log("Withdrawal:", testData.withdrawal);
console.log("Transaction Status:", testData.transactionStatus);

export { testData, endpoints };
