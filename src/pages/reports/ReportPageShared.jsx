import { useEffect, useRef, useState } from 'react';
import { ChevronDown, FileSpreadsheet, FileText } from 'lucide-react';

export function MiniFileIcon({ type, tone }) {
  const Icon = type === 'XLS' ? FileSpreadsheet : FileText;
  return <span className={`report-file-icon ${tone}`}><Icon size={20} /></span>;
}

export function ReportDropdown({ label, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`dropdown-wrap report-filter-dropdown ${isOpen ? 'open' : ''}`} ref={containerRef}>
      <label>{label}</label>
      <button onClick={() => setIsOpen((current) => !current)} type="button">{value} <ChevronDown size={15} /></button>
      {isOpen ? (
        <div className="dropdown-menu">
          {options.map((option) => (
            <button
              className={`dropdown-item ${value === option ? 'active' : ''}`}
              key={option}
              onClick={(event) => {
                event.stopPropagation();
                onChange(option);
                setIsOpen(false);
              }}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
