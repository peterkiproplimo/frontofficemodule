/**
 * M-Pesa Integration Example
 * This file demonstrates how to use the M-Pesa API endpoints
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:9000/api/mpesa';
const AUTH_TOKEN = 'your_bearer_token_here';

// Example 1: Initiate a deposit
export const initiateDeposit = async () => {
  try {
    const depositData = {
      phone: "254712345678",
      amount: 1000,
      userId: "60f7b3b3b3b3b3b3b3b3b3b3"
    };

    const response = await axios.post(`${BASE_URL}/deposit`, depositData, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Deposit initiated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Deposit error:', error.response?.data || error.message);
    throw error;
  }
};

// Example 2: Initiate a withdrawal
export const initiateWithdrawal = async () => {
  try {
    const withdrawalData = {
      phone: "254712345678",
      amount: 500,
      userId: "60f7b3b3b3b3b3b3b3b3b3b3"
    };

    const response = await axios.post(`${BASE_URL}/withdraw`, withdrawalData, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Withdrawal initiated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Withdrawal error:', error.response?.data || error.message);
    throw error;
  }
};

// Example 3: Query transaction status
export const queryTransactionStatus = async (transactionId) => {
  try {
    const statusData = {
      transactionId: transactionId
    };

    const response = await axios.post(`${BASE_URL}/transaction-status`, statusData, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Transaction status:', response.data);
    return response.data;
  } catch (error) {
    console.error('Status query error:', error.response?.data || error.message);
    throw error;
  }
};

// Example 4: Simulate deposit callback (for testing)
export const simulateDepositCallback = async () => {
  try {
    const callbackData = {
      "Body": {
        "stkCallback": {
          "MerchantRequestID": "29115-34620561-1",
          "CheckoutRequestID": "ws_CO_14012024103012345678",
          "ResultCode": 0,
          "ResultDesc": "The service request is processed successfully.",
          "CallbackMetadata": {
            "Item": [
              {
                "Name": "Amount",
                "Value": 1000
              },
              {
                "Name": "MpesaReceiptNumber",
                "Value": "NLJ7RT61SV"
              },
              {
                "Name": "TransactionDate",
                "Value": 20240114103015
              },
              {
                "Name": "PhoneNumber",
                "Value": 254712345678
              }
            ]
          }
        }
      }
    };

    const response = await axios.post(`${BASE_URL}/deposit-callback`, callbackData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Callback processed:', response.data);
    return response.data;
  } catch (error) {
    console.error('Callback error:', error.response?.data || error.message);
    throw error;
  }
};

// Example 5: Complete deposit flow
export const completeDepositFlow = async () => {
  try {
    console.log('=== Starting Complete Deposit Flow ===');
    
    // Step 1: Initiate deposit
    console.log('\n1. Initiating deposit...');
    const depositResult = await initiateDeposit();
    
    if (depositResult.checkoutRequestID) {
      console.log(`Deposit initiated with CheckoutRequestID: ${depositResult.checkoutRequestID}`);
      
      // Step 2: Simulate callback (in real scenario, this comes from Safaricom)
      console.log('\n2. Simulating callback...');
      await simulateDepositCallback();
      
      console.log('\n3. Deposit flow completed successfully!');
    }
    
  } catch (error) {
    console.error('Deposit flow error:', error);
  }
};

// Example usage
const runExamples = async () => {
  console.log('M-Pesa Integration Examples');
  console.log('==========================');
  
  try {
    // Run complete deposit flow
    await completeDepositFlow();
    
    // Uncomment to test individual functions
    // await initiateWithdrawal();
    // await queryTransactionStatus('OEI2AK4Q16');
    
  } catch (error) {
    console.error('Example execution error:', error);
  }
};

// Export all functions for use in other modules
export {
  runExamples
};

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples();
}
