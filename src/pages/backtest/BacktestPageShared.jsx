import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const dateRangeOptions = ['1Y', '3Y', '5Y', 'Jan 2020 - May 2025', 'Custom Range'];
export const cadenceOptions = ['None', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];
export const strategyOptions = ['Momentum Rotation', 'Mean Reversion', 'Value Investing'];
export const weightModeOptions = ['Equal weight', 'Risk parity', 'Market cap', 'Momentum score'];

export function BacktestKpi({ item }) {
  return (
    <article className="card backtest-kpi">
      <span>{item.label}</span>
      <strong className={item.tone}>{item.value}</strong>
      {/* <Sparkline data={item.series} danger={item.tone === 'red'} /> */}
    </article>
  );
}

export function DropdownField({ label, options, selection }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`dropdown-wrap backtest-field ${isOpen ? 'open' : ''}`} ref={containerRef}>
      <label>{label}</label>
      <button type="button" onClick={() => setIsOpen(!isOpen)}>
        {selection.value} <ChevronDown size={15} />
      </button>
      {isOpen && (
        <div className="dropdown-menu">
          {options.map(opt => (
            <button 
              key={opt} 
              className={`dropdown-item ${selection.isSelected(opt) ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                selection.select(opt);
                setIsOpen(false);
              }}
              type="button"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
