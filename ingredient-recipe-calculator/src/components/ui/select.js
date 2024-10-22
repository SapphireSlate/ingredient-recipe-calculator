import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const Select = ({ value, onChange, children, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [dropdownStyles, setDropdownStyles] = useState({});

  useEffect(() => {
    if (isOpen && selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setDropdownStyles({
        position: 'absolute',
        top: `${rect.bottom + scrollTop}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        zIndex: 9999,
        backgroundColor: 'white', // Ensure solid background
      });
    }
  }, [isOpen]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      setIsOpen(!isOpen);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const renderDropdown = () => (
    <div 
      ref={dropdownRef}
      style={dropdownStyles}
      className="bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
      role="listbox"
    >
      {React.Children.map(children, (child, index) =>
        React.cloneElement(child, {
          onClick: () => {
            onChange(child.props.value);
            setIsOpen(false);
          },
          role: 'option',
          'aria-selected': child.props.value === value,
          tabIndex: isOpen ? 0 : -1,
        })
      )}
    </div>
  );

  return (
    <>
      <div className="relative" ref={selectRef}>
        <button
          type="button"
          className="w-full flex items-center justify-between px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          {value || placeholder || 'Select...'}
          <span className="ml-2" aria-hidden="true">▼</span>
        </button>
      </div>
      {isOpen && createPortal(renderDropdown(), document.body)}
    </>
  );
};

const SelectItem = ({ value, children, onClick, ...props }) => (
  <div
    className="px-3 py-2 cursor-pointer hover:bg-gray-100 bg-white"
    onClick={() => onClick(value)}
    {...props}
  >
    {children}
  </div>
);

export { Select, SelectItem };
