import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  FileText,
  X,
  History,
  FolderPlus,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
} from 'lucide-react';
import type {
  ParsedTransaction,
  ImportSource,
  Category,
  IncomeItem,
  ExpenseItem,
  ImportHistoryItem,
} from '../types';
import { parseStatementFile } from '../services/statementParser';
import { dataService } from '../services/dataService';
import { importHistoryService } from '../services/importHistoryService';
import { formatINR, formatDate } from '../utils/formatters';

interface StatementImportPageProps {
  categories: Category[];
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  onImportSuccess: () => void;
}

export const StatementImportPage: React.FC<StatementImportPageProps> = ({
  categories,
  incomes,
  expenses,
  onImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');
  const [source, setSource] = useState<ImportSource>('IDFC');

  // File & Parsing State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedRecords, setParsedRecords] = useState<ParsedTransaction[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Review Screen Search/Filter
  const [reviewSearch, setReviewSearch] = useState('');
  const [hideDuplicates, setHideDuplicates] = useState(false);

  // Add Custom Category Modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [catType, setCatType] = useState<'income' | 'expense'>('expense');

  // History State
  const [historyItems, setHistoryItems] = useState<ImportHistoryItem[]>([]);

  useEffect(() => {
    importHistoryService.getHistory().then((data) => setHistoryItems(data));
  }, []);

  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    setParseError(null);
    setIsParsing(true);

    try {
      const records = await parseStatementFile(file, source, incomes, expenses);
      setParsedRecords(records);
    } catch (e: any) {
      console.error('File Parse Error:', e);
      setParseError(e.message || 'Failed to parse the uploaded statement.');
      setParsedRecords(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Toggle record selection
  const handleToggleSelect = (id: string) => {
    if (!parsedRecords) return;
    setParsedRecords(
      parsedRecords.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r))
    );
  };

  const handleSelectAll = (select: boolean) => {
    if (!parsedRecords) return;
    setParsedRecords(parsedRecords.map((r) => ({ ...r, selected: select })));
  };

  // Update parsed record fields
  const handleUpdateRecord = (id: string, updates: Partial<ParsedTransaction>) => {
    if (!parsedRecords) return;
    setParsedRecords(
      parsedRecords.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const handleDeleteRecord = (id: string) => {
    if (!parsedRecords) return;
    setParsedRecords(parsedRecords.filter((r) => r.id !== id));
  };

  // Confirm Import & Save to Database
  const handleConfirmImport = async () => {
    if (!parsedRecords) return;
    const selectedToImport = parsedRecords.filter((r) => r.selected);
    if (selectedToImport.length === 0) {
      alert('Please select at least one transaction to import.');
      return;
    }

    setIsSaving(true);
    try {
      const { importedCount } = await dataService.importBulkTransactions(
        selectedToImport,
        selectedFile?.name || `${source}_Statement`,
        source
      );

      setSaveSuccessMsg(`Successfully imported ${importedCount} transactions into your ledger!`);
      setParsedRecords(null);
      setSelectedFile(null);
      onImportSuccess();

      const updatedHistory = await importHistoryService.getHistory();
      setHistoryItems(updatedHistory);

      setTimeout(() => setSaveSuccessMsg(null), 5000);
    } catch (e: any) {
      alert(`Error saving imported transactions: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Custom Category Creation
  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    await dataService.addCategory({
      name: newCatName.trim(),
      type: catType,
    });

    setNewCatName('');
    setIsCatModalOpen(false);
    onImportSuccess();
  };

  // Math for review banner
  const selectedRecords = parsedRecords?.filter((r) => r.selected) || [];
  const totalImportIncome = selectedRecords
    .filter((r) => r.type === 'income')
    .reduce((s, r) => s + r.amount, 0);
  const totalImportExpense = selectedRecords
    .filter((r) => r.type === 'expense')
    .reduce((s, r) => s + r.amount, 0);

  const duplicateCount = parsedRecords?.filter((r) => r.is_duplicate).length || 0;

  const filteredRecords = (parsedRecords || []).filter((r) => {
    const matchesSearch =
      r.description.toLowerCase().includes(reviewSearch.toLowerCase()) ||
      r.category_name.toLowerCase().includes(reviewSearch.toLowerCase());
    const matchesDuplicates = hideDuplicates ? !r.is_duplicate : true;
    return matchesSearch && matchesDuplicates;
  });

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-blue-600" />
            <span>Import Statement (IDFC, HDFC, Google Pay)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload bank or UPI statements to automatically extract, categorize, and import transactions.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-800/80 w-full sm:w-64">
          <button
            onClick={() => setActiveTab('upload')}
            className={`w-1/2 rounded-xl py-2 text-xs font-bold transition-all min-h-[40px] ${
              activeTab === 'upload' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Upload Statement
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`w-1/2 rounded-xl py-2 text-xs font-bold transition-all min-h-[40px] ${
              activeTab === 'history' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Import History
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Upload Tab */}
      {activeTab === 'upload' && !parsedRecords && (
        <div className="space-y-6">
          {/* Source Selection Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              1. Select Statement Source
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'IDFC', label: 'IDFC FIRST Bank', desc: 'PDF, CSV, XLSX' },
                { id: 'HDFC', label: 'HDFC Bank', desc: 'PDF, CSV, XLSX' },
                { id: 'GOOGLE_PAY', label: 'Google Pay', desc: 'PDF, CSV, XLSX' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSource(item.id as ImportSource)}
                  className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all min-h-[72px] ${
                    source === item.id
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 dark:border-blue-500 shadow-md ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40'
                  }`}
                >
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {item.label}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 mt-1">
                    Supports {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Dropzone Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              2. Upload {source === 'IDFC' ? 'IDFC FIRST Bank' : source === 'HDFC' ? 'HDFC Bank' : 'Google Pay'} Statement File
            </h3>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-8 sm:p-12 text-center hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-950/10 transition-colors cursor-pointer flex flex-col items-center justify-center space-y-3"
            >
              <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600">
                <Upload className="h-7 w-7" />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Drag & drop your statement here, or{' '}
                  <label className="text-blue-600 hover:underline cursor-pointer">
                    browse
                    <input
                      type="file"
                      accept=".pdf,.csv,.xlsx,.xls"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supported File Formats: <span className="font-bold text-slate-700 dark:text-slate-300">PDF, CSV, XLSX</span> (Max 25MB)
                </p>
              </div>
            </div>

            {isParsing && (
              <div className="flex items-center justify-center gap-3 py-6">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Reading and parsing statement entries...
                </span>
              </div>
            )}

            {parseError && (
              <div className="rounded-2xl bg-rose-50 p-4 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Screen after parsing */}
      {parsedRecords && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="rounded-3xl border border-blue-200 bg-blue-50/70 p-6 dark:border-blue-950 dark:bg-blue-950/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-600 px-3 py-0.5 text-[10px] font-extrabold text-white uppercase">
                  {source} Statement
                </span>
                {duplicateCount > 0 && (
                  <span className="rounded-full bg-amber-100 px-3 py-0.5 text-[10px] font-extrabold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {duplicateCount} Duplicates Detected
                  </span>
                )}
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                Review & Confirm Transactions ({selectedRecords.length} Selected of {parsedRecords.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Edit categories, toggle Income/Expense types, and unselect unwanted items before importing.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
              <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Selected Income</span>
                <span className="text-emerald-600 text-sm">{formatINR(totalImportIncome)}</span>
              </div>

              <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Selected Expense</span>
                <span className="text-rose-600 text-sm">{formatINR(totalImportExpense)}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setParsedRecords(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={isSaving || selectedRecords.length === 0}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-50 min-h-[44px]"
                >
                  {isSaving ? 'Importing...' : `Import ${selectedRecords.length} Transactions`}
                </button>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleSelectAll(true)}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Select All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => handleSelectAll(false)}
                className="text-xs font-bold text-slate-500 hover:underline"
              >
                Deselect All
              </button>
              <span className="text-slate-300">|</span>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideDuplicates}
                  onChange={(e) => setHideDuplicates(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600"
                />
                <span>Hide Duplicates ({duplicateCount})</span>
              </label>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex items-center w-full sm:w-64">
                <Search className="absolute left-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter review items..."
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsCatModalOpen(true)}
                className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 shrink-0 min-h-[40px]"
              >
                <FolderPlus className="h-4 w-4 text-blue-600" />
                <span>+ Category</span>
              </button>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
                  <tr>
                    <th className="px-4 py-4 text-center">Select</th>
                    <th className="px-4 py-4">Date</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-4 py-4">Type</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-4 py-4">Amount</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredRecords.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                        item.is_duplicate ? 'bg-amber-50/30 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                        />
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-600 dark:text-slate-400">
                        {formatDate(item.date)}
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                        {item.description}
                        {item.reference_id && (
                          <span className="block text-[10px] font-mono text-slate-400 font-normal">
                            Ref: {item.reference_id}
                          </span>
                        )}
                        {item.is_duplicate && (
                          <span className="inline-block mt-0.5 rounded bg-amber-100 px-2 py-0.5 text-[9px] font-extrabold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            Already Imported
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateRecord(item.id, {
                              type: item.type === 'income' ? 'expense' : 'income',
                            })
                          }
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase transition-all ${
                            item.type === 'income'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {item.type === 'income' ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownLeft className="h-3 w-3" />
                          )}
                          <span>{item.type}</span>
                        </button>
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={item.category_name}
                          onChange={(e) =>
                            handleUpdateRecord(item.id, { category_name: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white cursor-pointer"
                        >
                          {categories
                            .filter((c) => c.type === item.type)
                            .map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                        </select>
                      </td>

                      <td
                        className={`px-4 py-4 font-extrabold text-sm ${
                          item.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {formatINR(item.amount)}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(item.id)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                          title="Remove from import"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View (iPhone/Android Optimized) */}
          <div className="lg:hidden space-y-3">
            {filteredRecords.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 bg-white dark:bg-slate-900 shadow-sm space-y-3 ${
                  item.is_duplicate
                    ? 'border-amber-300 dark:border-amber-800 bg-amber-50/30'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => handleToggleSelect(item.id)}
                      className="h-5 w-5 rounded border-slate-300 text-blue-600 cursor-pointer"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.description}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {formatDate(item.date)} {item.reference_id ? `• Ref: ${item.reference_id}` : ''}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-sm font-extrabold ${
                      item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {formatINR(item.amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateRecord(item.id, {
                        type: item.type === 'income' ? 'expense' : 'income',
                      })
                    }
                    className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${
                      item.type === 'income'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {item.type}
                  </button>

                  <select
                    value={item.category_name}
                    onChange={(e) => handleUpdateRecord(item.id, { category_name: e.target.value })}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {categories
                      .filter((c) => c.type === item.type)
                      .map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleDeleteRecord(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="h-4 w-4 text-blue-600" />
              <span>Statement Upload History Log</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
                <tr>
                  <th className="px-6 py-4">File Name</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4">Imported Date</th>
                  <th className="px-6 py-4">Transaction Count</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {historyItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No statement imports recorded yet.
                    </td>
                  </tr>
                ) : (
                  historyItems.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span>{h.file_name}</span>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-blue-600 dark:text-blue-400 uppercase">
                        {h.source}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {formatDate(h.imported_at)}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        {h.transaction_count} items
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Custom Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderPlus className="h-4 w-4 text-blue-600" />
                <span>Add Custom Category</span>
              </h3>
              <button onClick={() => setIsCatModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategorySubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Category Type</label>
                <div className="mt-1 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setCatType('expense')}
                    className={`w-1/2 rounded-lg py-2 text-xs font-bold ${
                      catType === 'expense' ? 'bg-rose-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatType('income')}
                    className={`w-1/2 rounded-lg py-2 text-xs font-bold ${
                      catType === 'income' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Subscriptions, Pet Care"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="w-1/2 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
