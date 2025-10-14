# M-Pesa API Documentation

## Overview
This API provides M-Pesa integration for school management system, including STK push deposits, B2C withdrawals, and transaction status queries.

## Base URL
```
http://localhost:9000/api/mpesa
```

## Authentication
All endpoints (except callbacks) require authentication via Bearer token in the Authorization header.

## Endpoints

### 1. Initiate STK Push Deposit
**POST** `/deposit`

Initiates an M-Pesa STK push for deposit to school account.

#### Request Body
```json
{
  "phone": "254712345678",
  "amount": 100,
  "userId": "60f7b3b3b3b3b3b3b3b3b3b3"
}
```

#### Response
```json
{
  "message": "STK push initiated successfully",
  "data": {
    "_id": "account_id",
    "balance": 1000,
    "user": {...},
    "createdAt": "2024-01-14T10:30:00.000Z",
    "updatedAt": "2024-01-14T10:30:00.000Z",
    "active": true
  },
  "checkoutRequestID": "ws_CO_14012024103012345678"
}
```

### 2. Initiate B2C Withdrawal
**POST** `/withdraw`

Initiates an M-Pesa B2C withdrawal from school account.

#### Request Body
```json
{
  "phone": "254712345678",
  "amount": 50,
  "userId": "60f7b3b3b3b3b3b3b3b3b3b3"
}
```

#### Response
```json
{
  "message": "Withdrawal initiated successfully",
  "data": {
    "OriginatorConversationID": "29115-34620561-1",
    "ConversationID": "AG_20191219_00005797af5d7d75d652",
    "ResponseCode": "0",
    "ResponseDescription": "Accept the service request successfully."
  }
}
```

### 3. Query Transaction Status
**POST** `/transaction-status`

Queries the status of an M-Pesa transaction.

#### Request Body
```json
{
  "transactionId": "OEI2AK4Q16"
}
```

#### Response
```json
{
  "message": "Transaction status query initiated",
  "data": {
    "ResponseCode": "0",
    "ResponseDescription": "Accept the service request successfully.",
    "ConversationID": "AG_20191219_00005797af5d7d75d652",
    "OriginatorConversationID": "29115-34620561-1"
  }
}
```

### 4. STK Push Callback
**POST** `/callback`

Webhook endpoint called by Safaricom for STK push results.

#### Request Body (from Safaricom)
```json
{
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
}
```

### 5. Transaction Timeout Callback
**POST** `/transaction-timeout`

Webhook endpoint for transaction timeout notifications.

### 6. Transaction Result Callback
**POST** `/transaction-result`

Webhook endpoint for transaction result notifications.

## Error Responses

### 400 Bad Request
```json
{
  "message": "Invalid phone number format"
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized: Missing token"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error",
  "error": "Error details"
}
```

## Environment Variables Required

```env
# M-Pesa Express (STK Push)
PESAXPRESS_KEY=your_consumer_key
PESAXPRESS_SECRET=your_consumer_secret
MPESAEXPRESS_CODE=your_shortcode
PESAXPRESS_PASSKEY=your_passkey

# M-Pesa B2C
B2C_KEY=your_b2c_consumer_key
B2C_SECRET=your_b2c_consumer_secret
B2C_SHORTCODE=your_b2c_shortcode
B2C_PASSKEY=your_b2c_passkey

# Base URL for callbacks
BASE_URL=https://yourdomain.com
```

## Models

### MpesaTransactions
Stores M-Pesa transaction records with fields for different transaction types.

### Account
User account information with balance tracking.

### Transrequest
Transaction request records for audit trail.

### Logs
System logs for user actions and transactions.

### Player
User profile information.

## Usage Examples

### Frontend Integration
```javascript
// Deposit example
const depositData = {
  phone: "254712345678",
  amount: 100,
  userId: "user_id"
};

const response = await fetch('/api/mpesa/deposit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(depositData)
});

const result = await response.json();
```

### Withdrawal example
```javascript
const withdrawalData = {
  phone: "254712345678", 
  amount: 50,
  userId: "user_id"
};

const response = await fetch('/api/mpesa/withdraw', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(withdrawalData)
});
```

## Security Notes

1. All endpoints except callbacks require authentication
2. Phone numbers are automatically formatted to Kenyan format (254XXXXXXXXX)
3. Callback URLs should be HTTPS in production
4. Environment variables should be kept secure
5. Transaction logs are maintained for audit purposes
