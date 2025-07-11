'use client';

interface ReportFiltersProps {
  filterDays: number;
  onFilterChange: (days: number) => void;
}

const filterOptions = [
  { value: 7, label: '7 Days' },
  { value: 15, label: '15 Days' },
  { value: 30, label: '30 Days' },
  { value: 365, label: '1 Year' },
];

export default function ReportFilters({ filterDays, onFilterChange }: ReportFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filterOptions.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onFilterChange(value)}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${
            filterDays === value
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}