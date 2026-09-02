import * as XLSX from 'xlsx';
import type {
  ParsedTransaction,
  ImportSource,
  TransactionSource,
  TransactionType,
  PaymentMethod,
  IncomeItem,
  ExpenseItem,
} from '../types';

// PDFJS worker setup
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Keyword Auto-Categorization Dictionary
const KEYWORD_CATEGORY_MAP: Record<string, string> = {
  SWIGGY: 'Food',
  ZOMATO: 'Food',
  DUNZO: 'Food',
  DOMINOS: 'Food',
  PIZZA: 'Food',
  KFC: 'Food',
  MCDONALDS: 'Food',
  RESTAURANT: 'Food',
  HOTEL: 'Food',
  CAFÉ: 'Food',
  CAFE: 'Food',
  BAKERY: 'Food',
  DINING: 'Food',
  TEA: 'Food',

  UBER: 'Transport',
  OLA: 'Transport',
  RAPIDO: 'Transport',
  METRO: 'Transport',
  RAILWAY: 'Transport',
  IRCTC: 'Transport',
  FLIGHT: 'Transport',
  AIRLINES: 'Transport',
  AUTO: 'Transport',
  CAB: 'Transport',
  TOLL: 'Transport',

  HPCL: 'Fuel',
  IOCL: 'Fuel',
  BPCL: 'Fuel',
  SHELL: 'Fuel',
  PETROL: 'Fuel',
  DIESEL: 'Fuel',
  FUEL: 'Fuel',

  AMAZON: 'Shopping',
  FLIPKART: 'Shopping',
  MYNTRA: 'Shopping',
  AJIO: 'Shopping',
  TATA_CLIQ: 'Shopping',
  RETAIL: 'Shopping',
  STORE: 'Shopping',

  NETFLIX: 'Subscriptions',
  PRIME: 'Subscriptions',
  HOTSTAR: 'Subscriptions',
  SPOTIFY: 'Subscriptions',
  YOUTUBE: 'Subscriptions',
  APPLE: 'Subscriptions',
  GOOGLE_PLAY: 'Subscriptions',

  SALARY: 'Salary',
  PAYROLL: 'Salary',
  STIPEND: 'Salary',

  ELECTRICITY: 'Electricity',
  BESCOM: 'Electricity',
  TNEB: 'Electricity',
  POWER: 'Electricity',

  JIO: 'Mobile',
  AIRTEL: 'Mobile',
  VI: 'Mobile',
  RECHARGE: 'Mobile',
  BSNL: 'Mobile',

  BLINKIT: 'Groceries',
  ZEPTO: 'Groceries',
  INSTAMART: 'Groceries',
  SUPERMARKET: 'Groceries',
  GROCERY: 'Groceries',
  MART: 'Groceries',

  ATM: 'Personal',
  CASH: 'Personal',
};

export const suggestCategoryFromDescription = (description: string): string => {
  const upper = description.toUpperCase();
  for (const [key, categoryName] of Object.entries(KEYWORD_CATEGORY_MAP)) {
    if (upper.includes(key)) {
      return categoryName;
    }
  }
  return 'Other';
};

// Date Formatter Helper (Normalizes various date formats to YYYY-MM-DD)
export const normalizeDate = (rawDate: any): string => {
  if (!rawDate) return new Date().toISOString().split('T')[0];

  if (typeof rawDate === 'number') {
    // XLSX serial date number
    const dateObj = XLSX.SSF.parse_date_code(rawDate);
    if (dateObj) {
      const y = dateObj.y;
      const m = String(dateObj.m).padStart(2, '0');
      const d = String(dateObj.d).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  const str = String(rawDate).trim();

  // Match DD/MM/YYYY or DD-MM-YYYY or YYYY-MM-DD
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (dmyMatch) {
    let day = dmyMatch[1].padStart(2, '0');
    let month = dmyMatch[2].padStart(2, '0');
    let year = dmyMatch[3];
    if (year.length === 2) year = `20${year}`;
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return new Date().toISOString().split('T')[0];
};

// Parse PDF File Text
export const parsePdfTextContent = async (file: File): Promise<string[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const lines: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    let currentLine = '';

    for (const item of textContent.items as any[]) {
      if (item.str) {
        currentLine += ' ' + item.str;
        if (item.hasEOL) {
          lines.push(currentLine.trim());
          currentLine = '';
        }
      }
    }
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }
  }
  return lines;
};

// Parse PDF Lines into Normalized Transactions
export const parsePdfStatements = (
  lines: string[],
  source: ImportSource
): Omit<ParsedTransaction, 'id' | 'selected'>[] => {
  const records: Omit<ParsedTransaction, 'id' | 'selected'>[] = [];
  const sourceEnum: TransactionSource =
    source === 'IDFC' ? 'IDFC_BANK' : source === 'HDFC' ? 'HDFC_BANK' : 'GOOGLE_PAY';

  // Date regex matching DD/MM/YYYY or DD-MM-YYYY or DD MMM YYYY
  const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}\s+[A-Za-z]{3}\s+\d{2,4})/;
  // Currency/Amount regex matching numbers like 1,250.00 or 450.50
  const amountRegex = /(\d{1,3}(?:,\d{3})*\.\d{2})/g;

  for (const line of lines) {
    const dateMatch = line.match(dateRegex);
    if (!dateMatch) continue;

    const rawDate = dateMatch[0];
    const normalizedDate = normalizeDate(rawDate);

    const amounts = line.match(amountRegex);
    if (!amounts || amounts.length === 0) continue;

    const lastAmtStr = amounts[amounts.length - 1].replace(/,/g, '');
    const numAmt = parseFloat(lastAmtStr);
    if (isNaN(numAmt) || numAmt <= 0) continue;

    const upper = line.toUpperCase();

    // Determine Credit vs Debit
    let type: TransactionType = 'expense';
    let paymentMethod: PaymentMethod = source === 'GOOGLE_PAY' ? 'UPI' : 'Bank Transfer';

    if (upper.includes('CR') || upper.includes('CREDIT') || upper.includes('DEPOSIT') || upper.includes('RECEIVED') || upper.includes('REFUND')) {
      type = 'income';
    } else if (upper.includes('DR') || upper.includes('DEBIT') || upper.includes('WITHDRAWAL') || upper.includes('PAID')) {
      type = 'expense';
    }

    // Extract Description
    let desc = line
      .replace(dateRegex, '')
      .replace(amountRegex, '')
      .replace(/CR|DR|CREDIT|DEBIT|INR|₹/gi, '')
      .trim();

    if (!desc || desc.length < 2) desc = `${source} Transaction`;

    // Extract Reference ID
    const refMatch = line.match(/\b(UPI\/\d+|REF[\/\s]\d+|\d{12})\b/i);
    const reference_id = refMatch ? refMatch[0] : undefined;

    records.push({
      date: normalizedDate,
      description: desc,
      amount: numAmt,
      type,
      category_name: suggestCategoryFromDescription(desc),
      payment_method: paymentMethod,
      source: sourceEnum,
      reference_id,
      notes: `Imported from ${source} PDF`,
      needs_review: !upper.includes('CR') && !upper.includes('DR') && !upper.includes('CREDIT') && !upper.includes('DEBIT'),
    });
  }

  return records;
};

// CSV / XLSX Parser Engine using SheetJS
export const parseSheetData = (
  rawData: any[],
  source: ImportSource
): Omit<ParsedTransaction, 'id' | 'selected'>[] => {
  if (!rawData || rawData.length === 0) return [];

  const sourceEnum: TransactionSource =
    source === 'IDFC' ? 'IDFC_BANK' : source === 'HDFC' ? 'HDFC_BANK' : 'GOOGLE_PAY';

  const records: Omit<ParsedTransaction, 'id' | 'selected'>[] = [];

  // Intelligently find header row index
  let headerIndex = 0;
  for (let i = 0; i < Math.min(15, rawData.length); i++) {
    const rowStr = JSON.stringify(rawData[i]).toLowerCase();
    if (rowStr.includes('date') || rowStr.includes('amount') || rowStr.includes('narration') || rowStr.includes('description')) {
      headerIndex = i;
      break;
    }
  }

  const headers = (rawData[headerIndex] || []).map((h: any) => String(h).trim().toLowerCase());

  // Helper to find column index by potential header names
  const getColIdx = (...names: string[]): number => {
    return headers.findIndex((h: string) => names.some((n) => h.includes(n.toLowerCase())));
  };

  const dateIdx = getColIdx('date', 'txn date', 'transaction date', 'value date', 'time');
  const descIdx = getColIdx('description', 'narration', 'particulars', 'remark', 'paid to', 'received from', 'name');
  const debitIdx = getColIdx('debit', 'withdrawal', 'dr', 'outflow', 'paid');
  const creditIdx = getColIdx('credit', 'deposit', 'cr', 'inflow', 'received');
  const amountIdx = getColIdx('amount', 'txn amount', 'transaction amount');
  const typeIdx = getColIdx('type', 'cr/dr', 'txn type', 'transaction type', 'status');
  const refIdx = getColIdx('ref', 'reference', 'txn id', 'transaction id', 'utr', 'rrn');

  for (let i = headerIndex + 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || row.length === 0) continue;

    const rawDateVal = dateIdx >= 0 ? row[dateIdx] : row[0];
    if (!rawDateVal) continue;
    const normalizedDate = normalizeDate(rawDateVal);

    let desc = descIdx >= 0 && row[descIdx] ? String(row[descIdx]).trim() : '';
    if (!desc) desc = `${source} Transaction`;

    let debitAmt = debitIdx >= 0 && row[debitIdx] ? parseFloat(String(row[debitIdx]).replace(/,/g, '')) : 0;
    let creditAmt = creditIdx >= 0 && row[creditIdx] ? parseFloat(String(row[creditIdx]).replace(/,/g, '')) : 0;
    let genericAmt = amountIdx >= 0 && row[amountIdx] ? parseFloat(String(row[amountIdx]).replace(/,/g, '')) : 0;

    let numAmt = 0;
    let type: TransactionType = 'expense';
    let needs_review = false;

    if (!isNaN(debitAmt) && debitAmt > 0) {
      numAmt = debitAmt;
      type = 'expense';
    } else if (!isNaN(creditAmt) && creditAmt > 0) {
      numAmt = creditAmt;
      type = 'income';
    } else if (!isNaN(genericAmt) && genericAmt > 0) {
      numAmt = genericAmt;
      const typeVal = typeIdx >= 0 && row[typeIdx] ? String(row[typeIdx]).toUpperCase() : '';
      if (typeVal.includes('CR') || typeVal.includes('CREDIT') || typeVal.includes('RECEIVE') || typeVal.includes('INCOME')) {
        type = 'income';
      } else if (typeVal.includes('DR') || typeVal.includes('DEBIT') || typeVal.includes('PAID') || typeVal.includes('EXPENSE')) {
        type = 'expense';
      } else {
        needs_review = true;
      }
    }

    if (isNaN(numAmt) || numAmt <= 0) continue;

    const paymentMethod: PaymentMethod = source === 'GOOGLE_PAY' ? 'UPI' : 'Bank Transfer';
    const refId = refIdx >= 0 && row[refIdx] ? String(row[refIdx]).trim() : undefined;

    records.push({
      date: normalizedDate,
      description: desc,
      amount: numAmt,
      type,
      category_name: suggestCategoryFromDescription(desc),
      payment_method: paymentMethod,
      source: sourceEnum,
      reference_id: refId,
      notes: `Imported from ${source} file`,
      needs_review,
    });
  }

  return records;
};

// Primary Entry Point: Parse any uploaded file (PDF, CSV, XLSX)
export const parseStatementFile = async (
  file: File,
  source: ImportSource,
  existingIncomes: IncomeItem[],
  existingExpenses: ExpenseItem[]
): Promise<ParsedTransaction[]> => {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  let rawParsedRecords: Omit<ParsedTransaction, 'id' | 'selected'>[] = [];

  if (ext === 'pdf') {
    try {
      const pdfLines = await parsePdfTextContent(file);
      rawParsedRecords = parsePdfStatements(pdfLines, source);
    } catch (e) {
      console.error('PDF parsing error:', e);
      throw new Error('Unable to read this PDF statement format. Please upload CSV/XLSX if available.');
    }
  } else if (ext === 'csv' || ext === 'xlsx' || ext === 'xls') {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[];
    rawParsedRecords = parseSheetData(rawData, source);
  } else {
    throw new Error('Unsupported file format. Please upload PDF, CSV, or XLSX file.');
  }

  if (rawParsedRecords.length === 0) {
    throw new Error(`Could not find valid transaction rows in the uploaded ${file.name}.`);
  }

  const sourceEnum: TransactionSource =
    source === 'IDFC' ? 'IDFC_BANK' : source === 'HDFC' ? 'HDFC_BANK' : 'GOOGLE_PAY';

  // Duplicate Detection against existing DB records
  const parsedTransactions: ParsedTransaction[] = rawParsedRecords.map((rec, index) => {
    const id = `import-${Date.now()}-${index}`;

    // Check duplicate by reference_id
    let isDuplicate = false;

    if (rec.reference_id) {
      const matchInc = existingIncomes.some((i) => i.reference_id === rec.reference_id);
      const matchExp = existingExpenses.some((e) => e.reference_id === rec.reference_id);
      if (matchInc || matchExp) isDuplicate = true;
    }

    // Check duplicate by date + amount + description + source
    if (!isDuplicate) {
      const matchInc = existingIncomes.some(
        (i) =>
          i.date === rec.date &&
          Math.abs(i.amount - rec.amount) < 0.01 &&
          i.description.toLowerCase().trim() === rec.description.toLowerCase().trim() &&
          i.source === sourceEnum
      );

      const matchExp = existingExpenses.some(
        (e) =>
          e.date === rec.date &&
          Math.abs(e.amount - rec.amount) < 0.01 &&
          e.description.toLowerCase().trim() === rec.description.toLowerCase().trim() &&
          e.source === sourceEnum
      );

      if (matchInc || matchExp) isDuplicate = true;
    }

    return {
      ...rec,
      id,
      is_duplicate: isDuplicate,
      selected: !isDuplicate, // Unselect duplicates by default
    };
  });

  return parsedTransactions;
};
