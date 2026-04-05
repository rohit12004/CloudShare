import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Globe, Lock, Eye } from 'lucide-react';

const CustomSelect = ({ value, onChange, options, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-xs font-bold text-slate-300 min-w-[160px] h-10 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30"
      >
        <div className="flex items-center gap-2">
           {selectedOption?.icon && <selectedOption.icon className="w-3.5 h-3.5 opacity-60" />}
           <span>{selectedOption?.label || label}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-[180px] bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 origin-top-right"
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-all text-xs ${
                  value === option.value 
                    ? 'bg-[#0ea5e9]/10 text-white' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {option.icon && <option.icon className="w-3.5 h-3.5" />}
                  {option.label}
                </div>
                {value === option.value && <Check className="w-3.5 h-3.5 text-[#0ea5e9]" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
