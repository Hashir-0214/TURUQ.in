// src/components/ui/select/Select.jsx

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search, Check } from 'lucide-react';

const Select = ({
    options = [],
    value = null,
    onChange = () => { },
    placeholder = 'Select an option...',
    isMulti = false,
    isSearchable = false,
    isClearable = true,
    isDisabled = false,
    size = 'md',
    variant = 'default'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const selectRef = useRef(null);
    const searchRef = useRef(null);

    const sizeClasses = {
        sm: 'text-sm py-1.5 px-3',
        md: 'text-base py-2.5 px-4',
        lg: 'text-lg py-3 px-5'
    };

    const variantClasses = {
        default: 'bg-white border-gray-300 hover:border-gray-400',
        filled: 'bg-gray-100 border-gray-200 hover:bg-gray-200',
        ghost: 'bg-transparent border-gray-200 hover:bg-gray-50'
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (selectRef.current && !selectRef.current.contains(e.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && isSearchable && searchRef.current) {
            searchRef.current.focus();
        }
    }, [isOpen, isSearchable]);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        setHighlightedIndex(0);
    }, [searchTerm]);

    const handleSelect = (option) => {
        if (isMulti) {
            const newValue = value || [];
            const exists = newValue.find(v => v.value === option.value);
            if (exists) {
                onChange(newValue.filter(v => v.value !== option.value));
            } else {
                onChange([...newValue, option]);
            }
        } else {
            onChange(option);
            setIsOpen(false);
            setSearchTerm('');
        }
    };

    const handleRemove = (option, e) => {
        e.stopPropagation();
        if (isMulti) {
            onChange(value.filter(v => v.value !== option.value));
        } else {
            onChange(null);
        }
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange(isMulti ? [] : null);
    };

    const handleKeyDown = (e) => {
        if (!isOpen && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
            e.preventDefault();
            setIsOpen(true);
            return;
        }

        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredOptions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredOptions[highlightedIndex]) {
                    handleSelect(filteredOptions[highlightedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSearchTerm('');
                break;
            default:
                break;
        }
    };

    const isSelected = (option) => {
        if (isMulti) {
            return value?.some(v => v.value === option.value);
        }
        return value?.value === option.value;
    };

    const getDisplayValue = () => {
        if (isMulti && value?.length > 0) {
            return (
                <div className="flex flex-wrap gap-1.5">
                    {value.map(v => (
                        <span
                            key={v.value}
                            className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 rounded-md px-2 py-0.5 text-sm font-medium transition-colors hover:bg-blue-200"
                        >
                            {v.label}
                            <X
                                size={14}
                                className="cursor-pointer hover:text-blue-900 transition-colors"
                                onClick={(e) => handleRemove(v, e)}
                            />
                        </span>
                    ))}
                </div>
            );
        }
        if (value) {
            return <span className="text-gray-900">{value.label}</span>;
        }
        return <span className="text-gray-400">{placeholder}</span>;
    };

    const showClearButton = isClearable && (
        (isMulti && value?.length > 0) || (!isMulti && value)
    );

    return (
        <div ref={selectRef} className="relative w-full">
            <div
                className={`
          relative flex items-center justify-between border rounded-lg cursor-pointer
          transition-all duration-200 ease-in-out
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
          ${isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
        `}
                onClick={() => !isDisabled && setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                tabIndex={isDisabled ? -1 : 0}
            >
                <div className="flex-1 min-w-0 mr-2">
                    {getDisplayValue()}
                </div>

                <div className="flex items-center gap-1">
                    {showClearButton && (
                        <X
                            size={18}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={handleClear}
                        />
                    )}
                    <ChevronDown
                        size={20}
                        className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                            }`}
                    />
                </div>
            </div>

            <div
                className={`
          absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg
          transition-all duration-200 ease-in-out origin-top
          ${isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-95 pointer-events-none'}
        `}
            >
                {isSearchable && (
                    <div className="p-2 border-b border-gray-200">
                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                ref={searchRef}
                                type="text"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                )}

                <div className="max-h-60 overflow-y-auto p-1">
                    {filteredOptions.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500">
                            No options found
                        </div>
                    ) : (
                        filteredOptions.map((option, idx) => (
                            <div
                                key={option.value}
                                className={`
                  flex items-center justify-between px-4 py-2.5 rounded-md cursor-pointer
                  transition-all duration-150 ease-in-out
                  ${isSelected(option) ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                  ${highlightedIndex === idx ? 'bg-gray-100' : ''}
                  hover:bg-gray-100
                `}
                                onClick={() => handleSelect(option)}
                                onMouseEnter={() => setHighlightedIndex(idx)}
                            >
                                <span className="font-medium">{option.label}</span>
                                {isSelected(option) && (
                                    <Check size={18} className="text-blue-600" />
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Select;