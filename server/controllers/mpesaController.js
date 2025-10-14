import dotenv from "dotenv";
import axios from "axios";

import formatDate from "../utils/formatDate.js";

// Importing mongoose models
import Account from "../models/Account.js";
import MpesaTransactions from "../models/MpesaTransactions.js";
import Transrequest from "../models/Transrequest.js";
import Logs from "../models/Logs.js";
import Player from "../models/Player.js";

dotenv.config();

/**
 * @desc Initiate M-Pesa STK push for deposit
 * @route POST /api/mpesa/deposit
 * @access Private
 */
export const depositTest = async (req, res) => {
  try {
    const { phone, amount, userId } = req.body;
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ message: "Unauthorized: Missing token" });
    }

    const phoneNumber = formatKenyanPhoneNumber(phone);

    if (phoneNumber === "Invalid phone number") {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    const consumer_key = process.env.PESAXPRESS_KEY;
    const consumer_secret = process.env.PESAXPRESS_SECRET;
    const url = "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

    const authString = `${consumer_key}:${consumer_secret}`;
    const buffer = Buffer.from(authString, "utf-8");
    const auth = buffer.toString("base64");

    const { data } = await axios.get(url, {
      headers: { Authorization: "Basic " + auth },
    });

    if (data.access_token) {
      const timestamp = formatDate();
      const shortcode = process.env.MPESAEXPRESS_CODE;
      const passkey = process.env.PESAXPRESS_PASSKEY;
      const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

      const stkPushData = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: parseInt(amount),
        PartyA: phoneNumber,
        PartyB: shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: `${process.env.BASE_URL}/api/mpesa/callback`,
        AccountReference: phoneNumber,
        TransactionDesc: "Deposit to School Account",
      };

      const stkResponse = await axios.post(
        "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        stkPushData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.access_token}`,
            Host: "api.safaricom.co.ke",
          },
        }
      );

      if (stkResponse.data.ResponseCode === "0") {
        // Find user account
        const account = await Account.findOne({ user: currentUser.userId });

        // Save transaction record
        const transaction = new MpesaTransactions({
          type: "1", // Deposit type
          MerchantRequestID: stkResponse.data.MerchantRequestID,
          CheckoutRequestID: stkResponse.data.CheckoutRequestID,
          trans_time: timestamp,
          amount: amount,
          phone: phone,
          user: userId || currentUser.userId,
          account: account?._id,
        });
        await transaction.save();

        // Save transaction request
        const transrequest = new Transrequest({
          amount: amount,
          phone: phone,
          user: currentUser.userId,
          transactionType: 'deposit',
          description: 'M-Pesa STK Push Deposit'
        });
        await transrequest.save();

        const user = await Player.findById(currentUser.userId);

        res.status(200).json({
          message: "STK push initiated successfully",
          data: {
            _id: account?.id,
            balance: account?.balance,
            user: user,
            createdAt: account?.createdAt,
            updatedAt: account?.updatedAt,
            active: account?.active,
          },
          checkoutRequestID: stkResponse.data.CheckoutRequestID,
        });
      } else {
        res.status(400).json({
          message: "Failed to initiate STK push",
          error: stkResponse.data,
        });
      }
    } else {
      res.status(500).json({ message: "Failed to get access token" });
    }
  } catch (error) {
    console.error("Deposit error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * @desc Initiate M-Pesa B2C withdrawal
 * @route POST /api/mpesa/withdraw
 * @access Private
 */
export const withdraw = async (req, res) => {
  try {
    const { phone, amount, userId } = req.body;
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ message: "Unauthorized: Missing token" });
    }

    const account = await Account.findOne({ user: req.user.userId });

    if (parseFloat(amount) > parseFloat(account.balance)) {
      return res.status(400).json({ message: "Insufficient balance in your wallet" });
    }

    const ipAddress = req.socket.remoteAddress;

    const consumer_key = process.env.B2C_KEY;
    const consumer_secret = process.env.B2C_SECRET;
    const url = "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
    const authString = `${consumer_key}:${consumer_secret}`;
    const buffer = Buffer.from(authString, "utf-8");
    const auth = buffer.toString("base64");

    const { data } = await axios.get(url, {
      headers: { Authorization: "Basic " + auth },
    });

    if (data.access_token) {
      const timestamp = formatDate();
      const shortcode = process.env.B2C_SHORTCODE;
      const passkey = process.env.B2C_PASSKEY;

      const b2cData = {
        InitiatorName: "KARIUKI",
        SecurityCredential: passkey,
        CommandID: "BusinessPayment",
        Amount: parseInt(amount),
        PartyA: shortcode,
        PartyB: parseInt(phone),
        Remarks: `Customer Withdrawal`,
        QueueTimeOutURL: `${process.env.BASE_URL}/api/mpesa/transaction-timeout`,
        ResultURL: `${process.env.BASE_URL}/api/mpesa/transaction-result`,
        Occassion: `Customer Withdrawal`,
      };

      const b2cResponse = await axios.post(
        "https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest",
        b2cData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + data.access_token,
            Host: "api.safaricom.co.ke",
          },
        }
      );

      if (b2cResponse.data.ResponseCode === "0") {
        // Update account balance
        const filter = { user: userId || currentUser.userId };
        const update = {
          balance: parseFloat(account?.balance) - parseFloat(amount),
        };
        await Account.findOneAndUpdate(filter, update);

        // Save transaction record
        const transaction = new MpesaTransactions({
          type: "2", // Withdrawal type
          OriginatorConversationID: b2cResponse.data.OriginatorConversationID,
          ConversationID: b2cResponse.data.ConversationID,
          trans_time: timestamp,
          amount: parseInt(amount),
          phone: phone,
          user: userId || currentUser.userId,
          account: account?._id,
        });
        await transaction.save();

        // Save log
        const log = new Logs({
          ip: ipAddress,
          description: `Withdrawn ${amount} - Account Name:${phone}`,
          user: userId || currentUser.userId,
          action: 'withdrawal',
          status: 'success'
        });
        await log.save();

        res.status(200).json({
          message: "Withdrawal initiated successfully",
          data: b2cResponse.data,
        });
      } else {
        res.status(400).json({
          message: "Failed to initiate withdrawal",
          error: b2cResponse.data,
        });
      }
    } else {
      res.status(500).json({ message: "Failed to get access token" });
    }
  } catch (error) {
    console.error("Withdrawal error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * @desc Query M-Pesa transaction status
 * @route POST /api/mpesa/transaction-status
 * @access Private
 */
export const transactionStatus = async (req, res) => {
  try {
    const { transactionId } = req.body;

    const consumer_key = "FH9hAhMJLPK4bmgfwRA4X5rmDw6bAcFS";
    const consumer_secret = "Acug9RyTeMxgGWQt";
    const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
    const auth = Buffer.from(`${consumer_key}:${consumer_secret}`).toString("base64");

    const { data } = await axios.get(url, {
      headers: { Authorization: "Bearer " + auth },
    });

    if (data.access_token) {
      const timestamp = formatDate();
      const shortcode = 600995;
      const passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
      const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

      const statusData = {
        Initiator: "SAFARIBUST",
        SecurityCredential: password,
        CommandID: "TransactionStatusQuery",
        TransactionID: transactionId,
        PartyA: shortcode,
        IdentifierType: "4",
        ResultURL: `${process.env.BASE_URL}/api/mpesa/transaction-status-result`,
        QueueTimeOutURL: `${process.env.BASE_URL}/api/mpesa/transaction-status-timeout`,
        Remarks: "Transaction status query",
        Occassion: "Status check",
      };

      const statusResponse = await axios.post(
        "https://sandbox.safaricom.co.ke/mpesa/transactionstatus/v1/query",
        statusData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + data.access_token,
          },
        }
      );

      res.status(200).json({
        message: "Transaction status query initiated",
        data: statusResponse.data,
      });
    } else {
      res.status(500).json({ message: "Failed to get access token" });
    }
  } catch (error) {
    console.error("Transaction status error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * @desc M-Pesa STK push callback
 * @route POST /api/mpesa/callback
 * @access Public
 */
export const mpesaCallback = async (req, res) => {
  try {
    const { Body } = req.body;
    const { stkCallback } = Body;

    if (stkCallback.ResultCode === 0) {
      // Transaction successful
      const { CheckoutRequestID, MerchantRequestID } = stkCallback;
      
      // Update transaction status
      await MpesaTransactions.findOneAndUpdate(
        { CheckoutRequestID },
        { 
          status: 'completed',
          mpesaReceiptNumber: stkCallback.CallbackMetadata?.Item?.[0]?.Value,
          transactionDate: stkCallback.CallbackMetadata?.Item?.[2]?.Value,
          phoneNumber: stkCallback.CallbackMetadata?.Item?.[3]?.Value,
          amount: stkCallback.CallbackMetadata?.Item?.[0]?.Value
        }
      );

      console.log("STK Push successful:", stkCallback);
    } else {
      // Transaction failed
      const { CheckoutRequestID } = stkCallback;
      
      await MpesaTransactions.findOneAndUpdate(
        { CheckoutRequestID },
        { 
          status: 'failed',
          errorMessage: stkCallback.ResultDesc
        }
      );

      console.log("STK Push failed:", stkCallback);
    }

    res.status(200).json({ message: "Callback received successfully" });
  } catch (error) {
    console.error("Callback error:", error);
    res.status(500).json({ message: "Callback processing failed" });
  }
};

/**
 * @desc M-Pesa transaction timeout callback
 * @route POST /api/mpesa/transaction-timeout
 * @access Public
 */
export const transactionTimeout = async (req, res) => {
  try {
    console.log("Transaction timeout:", req.body);
    res.status(200).json({ message: "Timeout callback received" });
  } catch (error) {
    console.error("Timeout callback error:", error);
    res.status(500).json({ message: "Timeout callback processing failed" });
  }
};

/**
 * @desc M-Pesa transaction result callback
 * @route POST /api/mpesa/transaction-result
 * @access Public
 */
export const transactionResult = async (req, res) => {
  try {
    console.log("Transaction result:", req.body);
    res.status(200).json({ message: "Result callback received" });
  } catch (error) {
    console.error("Result callback error:", error);
    res.status(500).json({ message: "Result callback processing failed" });
  }
};

/**
 * Helper function to format Kenyan phone numbers
 */
function formatKenyanPhoneNumber(phoneNumber) {
  // Remove any spaces and non-numeric characters
  phoneNumber = phoneNumber.replace(/\D/g, "");

  // Check if the phone number starts with "254" and has 12 digits (including the country code)
  if (/^254\d{9}$/.test(phoneNumber)) {
    return phoneNumber; // Phone number is already in the correct format
  } else if (/^0\d{9}$/.test(phoneNumber)) {
    // Add "254" in front of the phone number
    return "254" + phoneNumber.slice(1);
  } else {
    // Handle invalid phone numbers
    return "Invalid phone number";
  }
}