import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw, X } from "lucide-react";

interface CalendarPickerCardProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  todayDate: Date;
  onSelectDate: (dateStr: string) => void;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_SHORT = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function formatYYYYMMDD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function CalendarPickerCard({
  isOpen,
  onClose,
  selectedDate,
  todayDate,
  onSelectDate,
}: CalendarPickerCardProps) {
  // By default, when opened, the live month and highlight day must be visible
  const [viewYear, setViewYear] = useState(() => todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => todayDate.getMonth());

  // Reset to live month when opened
  useEffect(() => {
    if (isOpen) {
      setViewYear(todayDate.getFullYear());
      setViewMonth(todayDate.getMonth());
    }
  }, [isOpen, todayDate]);

  const cardRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const todayStr = useMemo(() => formatYYYYMMDD(todayDate), [todayDate]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    setViewYear(todayDate.getFullYear());
    setViewMonth(todayDate.getMonth());
    onSelectDate(todayStr);
    onClose();
  };

  // Generate grid cells for viewMonth & viewYear
  const gridCells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);

    // Monday as index 0: (day + 6) % 7
    const firstDayIndex = (firstDay.getDay() + 6) % 7;
    const daysInMonth = lastDay.getDate();

    const prevMonthLastDate = new Date(viewYear, viewMonth, 0).getDate();
    const cells: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
    }[] = [];

    // Trailing days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthLastDate - i;
      const prevDate = new Date(viewYear, viewMonth - 1, d);
      const str = formatYYYYMMDD(prevDate);
      cells.push({
        dateStr: str,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: str === todayStr,
        isSelected: str === selectedDate,
      });
    }

    // Days in current viewing month
    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = new Date(viewYear, viewMonth, d);
      const str = formatYYYYMMDD(curDate);
      cells.push({
        dateStr: str,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: str === todayStr,
        isSelected: str === selectedDate,
      });
    }

    // Leading days from next month
    const totalCells = cells.length > 35 ? 42 : 35;
    const nextDaysCount = totalCells - cells.length;
    for (let d = 1; d <= nextDaysCount; d++) {
      const nextDate = new Date(viewYear, viewMonth + 1, d);
      const str = formatYYYYMMDD(nextDate);
      cells.push({
        dateStr: str,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: str === todayStr,
        isSelected: str === selectedDate,
      });
    }

    return cells;
  }, [viewYear, viewMonth, todayStr, selectedDate]);

  // Years for quick dropdown (2024 to 2030)
  const yearOptions = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="absolute left-0 top-full mt-2 w-80 sm:w-88 bg-white dark:bg-[#1E1E22] border border-[#E7E7EC] dark:border-[#323238] rounded-2xl p-4 shadow-2xl z-50 select-none"
        >
          {/* Header: Month/Year navigation and controls */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E7EC] dark:border-[#323238]">
            {/* Month & Year Selection */}
            <div className="flex items-center gap-1.5">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="text-xs font-bold text-foreground bg-transparent hover:bg-[#F4F4F7] dark:hover:bg-[#28282D] rounded-lg px-2 py-1 cursor-pointer focus:outline-none"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx} className="bg-white dark:bg-[#1E1E22]">
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="text-xs font-bold text-foreground bg-transparent hover:bg-[#F4F4F7] dark:hover:bg-[#28282D] rounded-lg px-1.5 py-1 cursor-pointer focus:outline-none"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y} className="bg-white dark:bg-[#1E1E22]">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Navigation buttons: Prev, Next, Close */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-7 h-7 rounded-lg grid place-items-center text-muted-foreground hover:text-foreground hover:bg-[#F4F4F7] dark:hover:bg-[#28282D] transition-colors cursor-pointer"
                title="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-7 h-7 rounded-lg grid place-items-center text-muted-foreground hover:text-foreground hover:bg-[#F4F4F7] dark:hover:bg-[#28282D] transition-colors cursor-pointer"
                title="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-lg grid place-items-center text-muted-foreground hover:text-foreground hover:bg-[#F4F4F7] dark:hover:bg-[#28282D] transition-colors cursor-pointer ml-0.5"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 pt-2.5 pb-1">
            {DAYS_SHORT.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] font-bold text-muted-foreground/80 py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-7 gap-1">
            {gridCells.map((cell) => {
              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => {
                    onSelectDate(cell.dateStr);
                    onClose();
                  }}
                  className={`h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all cursor-pointer relative ${
                    cell.isSelected
                      ? "bg-foreground text-background font-bold shadow-xs scale-105 z-10"
                      : cell.isToday
                        ? "border border-foreground/50 font-bold text-foreground bg-[#F4F4F7] dark:bg-[#2A2A30]"
                        : cell.isCurrentMonth
                          ? "text-foreground hover:bg-[#F4F4F7] dark:hover:bg-[#28282D]"
                          : "text-muted-foreground/35 hover:bg-[#F4F4F7]/50 dark:hover:bg-[#28282D]/50"
                  }`}
                  title={`${cell.dateStr}${cell.isToday ? " (Today)" : ""}`}
                >
                  <span>{cell.dayNumber}</span>
                  {/* Highlight dot for today if not actively selected */}
                  {cell.isToday && !cell.isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-foreground" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer: Today quick jump and Live info */}
          <div className="mt-3 pt-2.5 border-t border-[#E7E7EC] dark:border-[#323238] flex items-center justify-between">
            <button
              type="button"
              onClick={handleJumpToToday}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-muted-foreground" />
              <span>
                Jump to Today ({todayDate.getDate()} {MONTH_NAMES[todayDate.getMonth()].slice(0, 3)}
                )
              </span>
            </button>
            <span className="text-[10px] text-muted-foreground font-mono">{todayStr}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
