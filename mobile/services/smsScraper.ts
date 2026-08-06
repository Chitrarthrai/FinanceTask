// SMS Auto-Scraping & Regex Transaction Parsing Service for Mobile

export interface ParsedSMSTransaction {
  id: string;
  sender: string;
  rawText: string;
  amount: number;
  type: 'expense' | 'income';
  merchant: string;
  bankName: string;
  date: string;
  category: string;
  confidence: number;
}

// Common Bank SMS Sender Patterns (HDFC, ICICI, SBI, Axis, Paytm, GPay, etc.)
const BANK_KEYWORDS = [
  'HDFCBK', 'ICICIB', 'SBIBNK', 'AXISBK', 'PAYTM', 'GPAY',
  'DEBIT', 'CREDIT', 'SPENT', 'SENT', 'RECEIVED', 'ALERT'
];

/**
 * Regex parser for extracting structured transaction details from SMS body
 */
export const parseTransactionSMS = (
  smsBody: string,
  sender: string = 'UNKNOWN'
): ParsedSMSTransaction | null => {
  const text = smsBody.trim();
  const textUpper = text.toUpperCase();

  // 1. Detect if message is a financial transaction alert
  const isTransaction =
    textUpper.includes('DEBITED') ||
    textUpper.includes('CREDITED') ||
    textUpper.includes('SPENT') ||
    textUpper.includes('SENT RS') ||
    textUpper.includes('PAID RS') ||
    textUpper.includes('RECEIVED RS') ||
    textUpper.includes('TRANSFERRED');

  if (!isTransaction) return null;

  // 2. Determine Transaction Type
  const type: 'expense' | 'income' =
    textUpper.includes('CREDITED') || textUpper.includes('RECEIVED')
      ? 'income'
      : 'expense';

  // 3. Extract Amount ($ or Rs. or INR)
  const amountRegex = /(?:RS\.?|INR|\$)\s*([\d,]+(?:\.\d{1,2})?)/i;
  const matchAmount = text.match(amountRegex);
  if (!matchAmount || !matchAmount[1]) return null;

  const rawAmountStr = matchAmount[1].replace(/,/g, '');
  const amount = parseFloat(rawAmountStr);
  if (isNaN(amount) || amount <= 0) return null;

  // 4. Extract Merchant / VPA / Account Name
  let merchant = 'Unknown Merchant';
  const vpaRegex = /(?:AT|TO|INFO|VPA)\s+([A-Z0-9.\-@\s]{3,20})(?:\s+ON|\s+REF|\s+BAL|\.|\s*$)/i;
  const matchMerchant = text.match(vpaRegex);
  if (matchMerchant && matchMerchant[1]) {
    merchant = matchMerchant[1].trim();
  }

  // 5. Categorize based on merchant keywords
  let category = 'Others';
  const merchantLower = merchant.toLowerCase();
  const textLower = text.toLowerCase();

  if (merchantLower.includes('swiggy') || merchantLower.includes('zomato') || textLower.includes('food') || textLower.includes('dining')) {
    category = 'Food';
  } else if (merchantLower.includes('uber') || merchantLower.includes('ola') || textLower.includes('fuel') || textLower.includes('petrol')) {
    category = 'Transport';
  } else if (merchantLower.includes('amazon') || merchantLower.includes('flipkart') || textLower.includes('shopping')) {
    category = 'Shopping';
  } else if (textLower.includes('electricity') || textLower.includes('bill') || textLower.includes('recharge')) {
    category = 'Utilities';
  }

  return {
    id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    sender,
    rawText: smsBody,
    amount,
    type,
    merchant,
    bankName: sender.replace(/[^A-Z]/gi, '').toUpperCase() || 'BANK',
    date: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    category,
    confidence: 0.95,
  };
};

/**
 * Mock simulator for testing SMS auto-scraping service
 */
export const MOCK_SMS_FEED: { sender: string; body: string }[] = [
  {
    sender: 'HDFCBK',
    body: 'ALERT: Rs.450.00 debited from A/C **1234 on 03-AUG-26 at SWIGGY VPA swiggy@icici. Avail Bal: Rs.12,450.00.',
  },
  {
    sender: 'ICICIB',
    body: 'INR 1,200.00 debited for Fuel at SHELL PETROL PUMP on 03-AUG-26. Ref: 987654.',
  },
  {
    sender: 'SBIBNK',
    body: 'Rs.35,000.00 credited to A/C **5678 on 01-AUG-26 by SALARY CREDIT - ACME CORP.',
  },
];
