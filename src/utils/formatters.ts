/**
 * Formats a number in Indian Rupee standard format (e.g. ₹91,000, ₹2,70,000, ₹7,00,000)
 */
export const formatINR = (amount: number | null | undefined, showSymbol: boolean = true): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? '₹0' : '0';
  }

  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(rounded);

  return showSymbol ? `₹${formatted}` : formatted;
};

/**
 * Compact Indian Rupee format for small cards/charts (e.g. ₹1.5L, ₹70K, ₹1.2Cr)
 */
export const formatCompactINR = (amount: number | null | undefined): string => {
  if (!amount || isNaN(amount)) return '₹0';
  
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(2)}Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(1)}L`;
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(0)}K`;
  }

  return `${sign}₹${abs}`;
};

/**
 * Format date string into human-readable format e.g. "25 Aug 2026"
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format percentage e.g. 18.5%
 */
export const formatPercent = (value: number, decimals: number = 1): string => {
  if (isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
};
