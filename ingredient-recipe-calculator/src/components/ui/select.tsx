import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  className?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ 
  children, 
  className = '', 
  value = '',
  onValueChange,
  onChange,
  ...props 
}, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onValueChange) {
      onValueChange(e.target.value);
    }
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <select
      ref={ref}
      value={value}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onChange={handleChange}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = 'Select';

export const SelectItem = React.forwardRef<HTMLOptionElement, SelectItemProps>(({ 
  children, 
  value, 
  className = '' 
}, ref) => {
  return (
    <option
      ref={ref}
      value={value}
      className={`relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-accent hover:text-accent-foreground ${className}`}
    >
      {children}
    </option>
  );
});

SelectItem.displayName = 'SelectItem'; 