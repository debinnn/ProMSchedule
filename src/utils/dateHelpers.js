import { format, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, addWeeks, subWeeks, addMonths, subMonths, isSameDay, parseISO } from 'date-fns';

export const formatDate = (date) => {
  return format(date, 'yyyy-MM-dd');
};

export const formatDisplayDate = (date) => {
  return format(date, 'MMMM d, yyyy');
};

export const formatDayOfWeek = (date) => {
  return format(date, 'EEEE');
};

export const formatShortDate = (date) => {
  return format(date, 'MMM d');
};

export const getTodayString = () => {
  return formatDate(new Date());
};

export const parseDate = (dateStr) => {
  return parseISO(dateStr);
};

export const isToday = (date) => {
  return isSameDay(date, new Date());
};

// Daily navigation
export const getNextDay = (dateStr) => {
  const date = parseDate(dateStr);
  return formatDate(addDays(date, 1));
};

export const getPreviousDay = (dateStr) => {
  const date = parseDate(dateStr);
  return formatDate(subDays(date, 1));
};

// Weekly navigation
export const getWeekDays = (dateStr) => {
  const date = parseDate(dateStr);
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 });
  
  return eachDayOfInterval({ start, end });
};

export const getNextWeek = (dateStr) => {
  const date = parseDate(dateStr);
  return formatDate(addWeeks(date, 1));
};

export const getPreviousWeek = (dateStr) => {
  const date = parseDate(dateStr);
  return formatDate(subWeeks(date, 1));
};

export const getWeekLabel = (dateStr) => {
  const days = getWeekDays(dateStr);
  const start = formatShortDate(days[0]);
  const end = formatShortDate(days[days.length - 1]);
  return `${start} - ${end}`;
};

// Monthly navigation
export const getMonthDays = (dateStr) => {
  const date = parseDate(dateStr);
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  
  return eachDayOfInterval({ start, end });
};

export const getNextMonth = (dateStr) => {
  const date = parseDate(dateStr);
  return formatDate(addMonths(date, 1));
};

export const getPreviousMonth = (dateStr) => {
  const date = parseDate(dateStr);
  return formatDate(subMonths(date, 1));
};

export const getMonthLabel = (dateStr) => {
  const date = parseDate(dateStr);
  return format(date, 'MMMM yyyy');
};

export const getMonthStartDay = (dateStr) => {
  const date = parseDate(dateStr);
  const start = startOfMonth(date);
  return start.getDay(); // 0 = Sunday, 1 = Monday, etc.
};

// Shift and slot information
export const SHIFTS = {
  JPN: { label: 'JPN Shift', time: '05:30-14:30 IST', slots: [1, 2] },
  IST: { label: 'IST Shift', time: '09:30-18:30 IST', slots: [2, 3] },
  CET_EARLY: { label: 'CET Early Shift', time: '12:30-21:00 IST', slots: [3] },
  CET_LATE: { label: 'CET Late Shift', time: '14:30-23:30 IST', slots: [4] },
  US_EARLY: { label: 'US Early Shift', time: '18:30-03:30 IST', slots: [5] },
  US_LATE: { label: 'US Late Shift', time: '20:30-05:30 IST', slots: [5, 6] }
};

export const SLOTS = {
  1: { time: '05:30-09:30 IST', cetTime: '01:00-05:00 CET' },
  2: { time: '09:30-13:30 IST', cetTime: '05:00-09:00 CET' },
  3: { time: '13:30-17:30 IST', cetTime: '09:00-13:00 CET' },
  4: { time: '17:30-21:30 IST', cetTime: '13:00-17:00 CET' },
  5: { time: '21:30-01:30 IST', cetTime: '17:00-21:00 CET' },
  6: { time: '01:30-05:30 IST', cetTime: '21:00-01:00 CET' }
};

export const getAvailableSlots = (shiftType) => {
  return SHIFTS[shiftType]?.slots || [];
};

export const getSlotLabel = (slotNumber) => {
  return `Slot ${slotNumber} (${SLOTS[slotNumber]?.time})`;
};

export const getShiftLabel = (shiftType) => {
  return SHIFTS[shiftType]?.label || shiftType;
};

export const getShiftTime = (shiftType) => {
  return SHIFTS[shiftType]?.time || '';
};
