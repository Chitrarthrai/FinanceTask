import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";

interface CustomDatePickerProps {
  value: Date | string;
  onChange: (date: Date) => void;
  label?: string;
  includeTime?: boolean;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  label,
  includeTime = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // Parse value to Date object safely
  const initialDate = value ? new Date(value) : new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(
    isNaN(initialDate.getTime()) ? new Date() : initialDate
  );
  const [viewDate, setViewDate] = useState<Date>(
    isNaN(initialDate.getTime()) ? new Date() : initialDate
  );

  // Time State
  const [hours, setHours] = useState(
    initialDate.getHours() > 12
      ? initialDate.getHours() - 12
      : initialDate.getHours() === 0
      ? 12
      : initialDate.getHours()
  );
  const [minutes, setMinutes] = useState(initialDate.getMinutes());
  const [ampm, setAmpm] = useState<"AM" | "PM">(
    initialDate.getHours() >= 12 ? "PM" : "AM"
  );
  const [dropdownPosition, setDropdownPosition] = useState<"bottom" | "top">(
    "bottom"
  );

  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 350; // Approx height

      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        setDropdownPosition("top");
      } else {
        setDropdownPosition("bottom");
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const d = value ? new Date(value) : new Date();
    if (!isNaN(d.getTime())) {
      setSelectedDate(d);
      setViewDate(d);
      // Sync time state
      setHours(
        d.getHours() > 12
          ? d.getHours() - 12
          : d.getHours() === 0
          ? 12
          : d.getHours()
      );
      setMinutes(d.getMinutes());
      setAmpm(d.getHours() >= 12 ? "PM" : "AM");
    }
  }, [value]);

  const updateTime = (h: number, m: number, ap: "AM" | "PM") => {
    const newDate = new Date(selectedDate);
    let hour24 = h;
    if (ap === "PM" && h !== 12) hour24 = h + 12;
    if (ap === "AM" && h === 12) hour24 = 0;

    newDate.setHours(hour24);
    newDate.setMinutes(m);
    setSelectedDate(newDate);
    onChange(newDate);
  };

  const monthNames = [
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

  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    // Preserve time
    newDate.setHours(selectedDate.getHours());
    newDate.setMinutes(selectedDate.getMinutes());

    setSelectedDate(newDate);
    onChange(newDate);
    if (!includeTime) {
      setIsOpen(false);
    }
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
          {label}
        </label>
      )}

      {/* Input Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl glass-input font-medium cursor-pointer hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all border border-white/50 dark:border-slate-700/50">
        <span className="text-slate-700 dark:text-slate-200">
          {selectedDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: includeTime ? "numeric" : undefined,
            minute: includeTime ? "2-digit" : undefined,
          })}
        </span>
        <div className="flex items-center gap-2">
          {includeTime && <Clock className="w-4 h-4 text-brand-500" />}
          <CalendarIcon className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div
          className={`absolute left-0 w-[320px] bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-4 z-50 animate-fade-in flex flex-col gap-4 ${
            dropdownPosition === "top" ? "bottom-full mb-2" : "top-full mt-2"
          }`}>
          <div className="flex gap-4">
            {/* Calendar Section */}
            <div className="flex-1">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white">
                  {monthNames[month]} {year}
                </h3>
                <div className="flex gap-1">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <ChevronLeft className="w-5 h-5 text-slate-500" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 mb-2 text-center">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div
                    key={d}
                    className="text-xs font-bold text-slate-400 uppercase">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {blanks.map((_, i) => (
                  <div key={`blank-${i}`} />
                ))}
                {days.map((day) => {
                  const isSelected =
                    selectedDate.getDate() === day &&
                    selectedDate.getMonth() === month &&
                    selectedDate.getFullYear() === year;
                  const isToday =
                    new Date().getDate() === day &&
                    new Date().getMonth() === month &&
                    new Date().getFullYear() === year;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDateClick(day);
                      }}
                      className={`
                            w-8 h-8 rounded-lg text-sm font-semibold flex items-center justify-center transition-all
                            ${
                              isSelected
                                ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30"
                                : isToday
                                ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                            }
                        `}>
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Time Picker Section */}
          {includeTime && (
            <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Time
                </span>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  <select
                    value={hours}
                    onChange={(e) => {
                      const newH = parseInt(e.target.value);
                      setHours(newH);
                      updateTime(newH, minutes, ampm);
                    }}
                    className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-200 outline-none appearance-none p-1 cursor-pointer">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                  <span className="text-slate-400 font-bold">:</span>
                  <select
                    value={minutes}
                    onChange={(e) => {
                      const newM = parseInt(e.target.value);
                      setMinutes(newM);
                      updateTime(hours, newM, ampm);
                    }}
                    className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-200 outline-none appearance-none p-1 cursor-pointer">
                    {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                      <option key={m} value={m}>
                        {m.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      const newAp = ampm === "AM" ? "PM" : "AM";
                      setAmpm(newAp);
                      updateTime(hours, minutes, newAp);
                    }}
                    className="text-xs font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-600 text-brand-600 dark:text-brand-400">
                    {ampm}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
