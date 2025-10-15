/**
 * Deposit Callback Test
 * This file demonstrates how the deposit callback route works
 */

// Example callback payload from Safaricom for successful deposit
const successfulDepositCallback = {
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
            "Value": 100
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

// Example callback payload for failed deposit
const failedDepositCallback = {
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "29115-34620561-2", 
      "CheckoutRequestID": "ws_CO_14012024103012345679",
      "ResultCode": 1032,
      "ResultDesc": "Request cancelled by user"
    }
  }
};

// Test function to simulate callback
const testDepositCallback = async () => {
  console.log("Testing Deposit Callback Route");
  console.log("==============================");
  
  try {
    // Test successful deposit callback
    const successResponse = await fetch('http://localhost:9000/api/mpesa/deposit-callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(successfulDepositCallback)
    });
    
    const successResult = await successResponse.json();
    console.log("Success Callback Response:", successResult);
    
    // Test failed deposit callback
    const failResponse = await fetch('http://localhost:9000/api/mpesa/deposit-callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(failedDepositCallback)
    });
    
    const failResult = await failResponse.json();
    console.log("Failed Callback Response:", failResult);
    
  } catch (error) {
    console.error("Callback test error:", error);
  }
};

// Export test data and function
export { 
  successfulDepositCallback, 
  failedDepositCallback, 
  testDepositCallback 
};

console.log("Deposit Callback Test Data Ready");
console.log("Run testDepositCallback() to test the endpoint");
