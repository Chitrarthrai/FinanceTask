import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Select } from './Select';

export const CurrencySelector: React.FC = () => {
  const { currencySymbol, setCurrencySymbol } = useData();

  const currencies = [
    { value: '$', label: 'USD ($)' },
    { value: '₹', label: 'INR (₹)' },
    { value: '€', label: 'EUR (€)' },
    { value: '£', label: 'GBP (£)' },
    { value: '¥', label: 'JPY (¥)' },
    { value: 'A$', label: 'AUD (A$)' },
  ];

  return (
    <div className="w-28">
      <Select
        value={currencySymbol}
        onChange={(e) => setCurrencySymbol(e.target.value)}
        options={currencies}
        className="text-xs py-1.5 font-mono font-semibold"
      />
    </div>
  );
};
