'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';

interface ReportFiltersProps {
  filterDays: number;
  onFilterChange: (days: number) => void;
}

const filterOptions = [
  { value: 7, label: '7 Days', shortLabel: '7D' },
  { value: 15, label: '15 Days', shortLabel: '15D' },
  { value: 30, label: '30 Days', shortLabel: '30D' },
  { value: 90, label: '3 Months', shortLabel: '3M' },
  { value: 365, label: '1 Year', shortLabel: '1Y' },
];

export default function ReportFilters({ filterDays, onFilterChange }: ReportFiltersProps) {
  const selectedOption = filterOptions.find(option => option.value === filterDays);
  
  return (
    <Select 
      value={filterDays.toString()} 
      onValueChange={(value) => onFilterChange(parseInt(value))}
    >
      <SelectTrigger className="w-20 h-9 bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-blue-600" />
          <SelectValue className="text-blue-700 font-medium text-xs">
            {selectedOption?.shortLabel}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent align="end" className="min-w-32">
        {filterOptions.map(({ value, label }) => (
          <SelectItem 
            key={value} 
            value={value.toString()}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="h-4 w-4 text-blue-600" />
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}