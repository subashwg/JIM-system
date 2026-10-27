import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  width?: string;
  icon?: React.ReactNode;
}

interface Coords {
  top: number;
  left: number;
  width: number;
  placement: 'bottom' | 'top';
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select an option...',
  searchable = false,
  disabled = false,
  width = '100%',
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [coords, setCoords] = useState<Coords | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Find currently selected option
  const selectedOption = options.find((opt) => opt.value === value);

  // Filter options based on search query
  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opt.subLabel && opt.subLabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Compute fixed viewport coordinates to prevent stacking-context clipping/overlaying
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // If trigger scrolls completely out of viewport, dismiss popover
    if (rect.bottom < 0 || rect.top > viewportHeight) {
      setIsOpen(false);
      setSearchTerm('');
      setFocusedIndex(-1);
      return;
    }

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimatedHeight = 260;

    // Smart-flip to top if space below is cramped and above has more room
    const shouldFlip = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

    const top = shouldFlip ? rect.top - 6 : rect.bottom + 6;
    let left = rect.left;
    const elemWidth = rect.width;

    // Horizontal viewport boundary protection
    if (left + elemWidth > viewportWidth - 10) {
      left = Math.max(10, viewportWidth - elemWidth - 10);
    }
    if (left < 10) {
      left = 10;
    }

    setCoords({
      top,
      left,
      width: elemWidth,
      placement: shouldFlip ? 'top' : 'bottom',
    });
  }, []);

  // Sync position on window resize and scroll events (capture captures scroll in parent containers)
  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, updatePosition]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, searchable]);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setSearchTerm('');
      setFocusedIndex(-1);
    }
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
    setFocusedIndex(-1);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        updatePosition();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setSearchTerm('');
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[focusedIndex].value);
      }
    }
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'relative',
        width,
        userSelect: 'none',
      }}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            marginBottom: '0.45rem',
          }}
        >
          {label}
        </label>
      )}

      {/* Dropdown Trigger */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.65rem',
          padding: '0.65rem 0.9rem',
          background: isOpen ? 'rgba(200, 102, 62, 0.08)' : 'rgba(15, 23, 42, 0.85)',
          border: isOpen
            ? '1px solid var(--accent-primary)'
            : '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          boxShadow: isOpen ? '0 0 0 3px rgba(200, 102, 62, 0.22)' : 'none',
          color: selectedOption ? 'var(--text-main)' : 'var(--text-dim)',
          fontSize: '0.875rem',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'var(--transition-smooth)',
          outline: 'none',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
          {icon && <span style={{ color: 'var(--accent-primary-light)', display: 'flex' }}>{icon}</span>}
          {selectedOption?.icon && (
            <span style={{ color: 'var(--accent-primary-light)', display: 'flex' }}>
              {selectedOption.icon}
            </span>
          )}
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: selectedOption ? 600 : 400,
              color: selectedOption ? 'var(--text-main)' : 'var(--text-dim)',
            }}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              style={{
                fontSize: '0.65rem',
                padding: '0.15rem 0.45rem',
                borderRadius: 'var(--radius-full)',
                background: 'var(--accent-primary-bg)',
                color: 'var(--accent-primary-light)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                flexShrink: 0,
              }}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          size={16}
          style={{
            color: isOpen ? 'var(--accent-primary)' : 'var(--text-dim)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), color 0.15s ease',
            flexShrink: 0,
          }}
        />
      </button>

      {/* Floating Menu Popover Portaled to document.body (prevents stacking context clipping) */}
      {isOpen &&
        coords &&
        createPortal(
          <div
            ref={popoverRef}
            onKeyDown={handleKeyDown}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 999999,
              background: 'rgba(13, 20, 36, 0.98)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(200, 102, 62, 0.45)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 20px 50px -4px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(200, 102, 62, 0.25)',
              overflow: 'hidden',
              transform: coords.placement === 'top' ? 'translateY(-100%)' : 'none',
              animation:
                coords.placement === 'top'
                  ? 'dropdownFadeInUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
                  : 'dropdownFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Search Box if enabled */}
            {searchable && (
              <div
                style={{
                  padding: '0.55rem 0.75rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(0, 0, 0, 0.35)',
                }}
              >
                <Search size={14} color="var(--accent-primary-light)" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setFocusedIndex(0);
                  }}
                  placeholder="Search..."
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-sans)',
                  }}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                    }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            )}

            {/* Options Scroll List */}
            <div
              ref={listRef}
              role="listbox"
              className="custom-dropdown-list"
              style={{
                maxHeight: '240px',
                overflowY: 'auto',
                padding: '0.35rem',
              }}
            >
              {filteredOptions.length === 0 ? (
                <div
                  style={{
                    padding: '1rem',
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  No matches found
                </div>
              ) : (
                filteredOptions.map((opt, index) => {
                  const isSelected = opt.value === value;
                  const isFocused = index === focusedIndex;

                  return (
                    <div
                      key={opt.value}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(opt.value)}
                      onMouseEnter={() => setFocusedIndex(index)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        background: isSelected
                          ? 'rgba(200, 102, 62, 0.18)'
                          : isFocused
                          ? 'rgba(255, 255, 255, 0.06)'
                          : 'transparent',
                        borderLeft: isSelected
                          ? '3px solid var(--accent-primary)'
                          : '3px solid transparent',
                        transition: 'background 0.12s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                        {opt.icon && (
                          <span
                            style={{
                              color: isSelected ? 'var(--accent-primary-light)' : 'var(--text-muted)',
                              display: 'flex',
                            }}
                          >
                            {opt.icon}
                          </span>
                        )}
                        <div>
                          <div
                            style={{
                              fontSize: '0.85rem',
                              fontWeight: isSelected ? 700 : 500,
                              color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                            }}
                          >
                            {opt.label}
                          </div>
                          {opt.subLabel && (
                            <div
                              style={{
                                fontSize: '0.725rem',
                                color: isSelected ? 'var(--accent-primary-light)' : 'var(--text-dim)',
                                marginTop: '0.1rem',
                              }}
                            >
                              {opt.subLabel}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                        {opt.badge && (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              padding: '0.1rem 0.4rem',
                              borderRadius: 'var(--radius-full)',
                              background: isSelected
                                ? 'var(--accent-primary)'
                                : 'rgba(255, 255, 255, 0.08)',
                              color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                            }}
                          >
                            {opt.badge}
                          </span>
                        )}
                        {isSelected && <Check size={15} color="var(--accent-primary-light)" strokeWidth={2.5} />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
