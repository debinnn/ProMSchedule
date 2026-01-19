const STORAGE_KEY = 'teamScheduleData';

const initialData = {
  users: [
    { id: 1, username: 'admin', password: 'Admin@123', role: 'admin', createdAt: '2026-01-19' },
    { id: 2, username: 'manager', password: 'Manager@123', role: 'editor', createdAt: '2026-01-19' }
  ],
  teamMembers: [
    { id: 1, name: 'Debin Robert', active: true },
    { id: 2, name: 'Ajin George', active: true },
    { id: 3, name: 'Nikita Nikita', active: true },
    { id: 4, name: 'Srikanth Koduru', active: true },
    { id: 5, name: 'Anurag Parashar Sarmah', active: true },
    { id: 6, name: 'Febin Bincy', active: true },
    { id: 7, name: 'Harikarthik K', active: true },
    { id: 8, name: 'Isha Arora', active: true },
    { id: 9, name: 'Lham Tsering', active: true },
    { id: 10, name: 'Melvin Joshva', active: true },
    { id: 11, name: 'Rakshita Ashwathanarayana', active: true },
    { id: 12, name: 'Shubhanshu Srivastava', active: true },
    { id: 13, name: 'Kristina Johansson', active: true },
    { id: 14, name: 'Xavier Pearl', active: true }
  ],
  schedules: {
    '2026-01-19': {
      shifts: {
        JPN: [
          { id: 1, memberId: 6, memberName: 'Febin Bincy', slot: 1, assignment: 'M1' }
        ],
        IST: [
          { id: 2, memberId: 11, memberName: 'Rakshita Ashwathanarayana', slot: 2, assignment: 'M2' },
          { id: 3, memberId: 8, memberName: 'Isha Arora', slot: 3, assignment: 'M3' }
        ],
        CET_EARLY: [],
        CET_LATE: [
          { id: 4, memberId: 5, memberName: 'Anurag Parashar Sarmah', slot: 4, assignment: 'M4' }
        ],
        US_EARLY: [],
        US_LATE: []
      },
      onLeave: [
        { id: 1, memberId: 1, memberName: 'Debin Robert', reason: 'Training' },
        { id: 2, memberId: 2, memberName: 'Ajin George', reason: 'Training' }
      ]
    }
  },
  customAssignments: ['M1', 'M2', 'M3', 'M4', 'M5'],
  customLeaveReasons: ['Training', 'Sick Leave', 'Vacation', 'Personal']
};

export const initializeData = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  }
};

export const getData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : initialData;
};

const saveData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// User Management
export const authenticateUser = (username, password) => {
  const data = getData();
  return data.users.find(u => u.username === username && u.password === password);
};

export const getAllUsers = () => {
  const data = getData();
  return data.users.filter(u => u.role === 'editor');
};

export const createUser = (username, password) => {
  const data = getData();
  const newId = Math.max(...data.users.map(u => u.id), 0) + 1;
  const newUser = {
    id: newId,
    username,
    password,
    role: 'editor',
    createdAt: new Date().toISOString().split('T')[0]
  };
  data.users.push(newUser);
  saveData(data);
  return newUser;
};

export const deleteUser = (userId) => {
  const data = getData();
  data.users = data.users.filter(u => u.id !== userId);
  saveData(data);
};

export const resetUserPassword = (userId, newPassword) => {
  const data = getData();
  const user = data.users.find(u => u.id === userId);
  if (user) {
    user.password = newPassword;
    saveData(data);
  }
};

// Team Member Management
export const getAllTeamMembers = () => {
  const data = getData();
  return data.teamMembers;
};

export const getActiveTeamMembers = () => {
  const data = getData();
  return data.teamMembers.filter(m => m.active);
};

export const createTeamMember = (name) => {
  const data = getData();
  const newId = Math.max(...data.teamMembers.map(m => m.id), 0) + 1;
  const newMember = { id: newId, name, active: true };
  data.teamMembers.push(newMember);
  saveData(data);
  return newMember;
};

export const updateTeamMember = (memberId, updates) => {
  const data = getData();
  const member = data.teamMembers.find(m => m.id === memberId);
  if (member) {
    Object.assign(member, updates);
    saveData(data);
  }
};

export const toggleMemberStatus = (memberId) => {
  const data = getData();
  const member = data.teamMembers.find(m => m.id === memberId);
  if (member) {
    member.active = !member.active;
    saveData(data);
  }
};

// Schedule Management
export const getScheduleForDate = (dateStr) => {
  const data = getData();
  const schedule = data.schedules[dateStr];
  
  // Ensure all shift types exist, even for old data
  if (schedule) {
    return {
      shifts: {
        JPN: schedule.shifts.JPN || [],
        IST: schedule.shifts.IST || [],
        CET_EARLY: schedule.shifts.CET_EARLY || [],
        CET_LATE: schedule.shifts.CET_LATE || [],
        US_EARLY: schedule.shifts.US_EARLY || [],
        US_LATE: schedule.shifts.US_LATE || []
      },
      onLeave: schedule.onLeave || []
    };
  }
  
  return {
    shifts: { JPN: [], IST: [], CET_EARLY: [], CET_LATE: [], US_EARLY: [], US_LATE: [] },
    onLeave: []
  };
};

export const addShiftMember = (dateStr, shiftType, memberData) => {
  const data = getData();
  if (!data.schedules[dateStr]) {
    data.schedules[dateStr] = {
      shifts: { JPN: [], IST: [], CET_EARLY: [], CET_LATE: [], US_EARLY: [], US_LATE: [] },
      onLeave: []
    };
  }
  
  const schedule = data.schedules[dateStr];
  const newId = Math.max(
    ...Object.values(schedule.shifts).flat().map(s => s.id),
    ...schedule.onLeave.map(l => l.id),
    0
  ) + 1;
  
  const newEntry = { id: newId, ...memberData };
  schedule.shifts[shiftType].push(newEntry);
  saveData(data);
  return newEntry;
};

export const updateShiftMember = (dateStr, shiftType, entryId, updates) => {
  const data = getData();
  if (data.schedules[dateStr]) {
    const entry = data.schedules[dateStr].shifts[shiftType].find(e => e.id === entryId);
    if (entry) {
      Object.assign(entry, updates);
      saveData(data);
    }
  }
};

export const deleteShiftMember = (dateStr, shiftType, entryId) => {
  const data = getData();
  if (data.schedules[dateStr]) {
    data.schedules[dateStr].shifts[shiftType] = 
      data.schedules[dateStr].shifts[shiftType].filter(e => e.id !== entryId);
    saveData(data);
  }
};

export const addOnLeave = (dateStr, leaveData) => {
  const data = getData();
  if (!data.schedules[dateStr]) {
    data.schedules[dateStr] = {
      shifts: { JPN: [], IST: [], CET_EARLY: [], CET_LATE: [], US_EARLY: [], US_LATE: [] },
      onLeave: []
    };
  }
  
  const schedule = data.schedules[dateStr];
  const newId = Math.max(
    ...Object.values(schedule.shifts).flat().map(s => s.id),
    ...schedule.onLeave.map(l => l.id),
    0
  ) + 1;
  
  const newEntry = { id: newId, ...leaveData };
  schedule.onLeave.push(newEntry);
  saveData(data);
  return newEntry;
};

export const deleteOnLeave = (dateStr, entryId) => {
  const data = getData();
  if (data.schedules[dateStr]) {
    data.schedules[dateStr].onLeave = 
      data.schedules[dateStr].onLeave.filter(e => e.id !== entryId);
    saveData(data);
  }
};

// Custom Options
export const addCustomAssignment = (assignment) => {
  const data = getData();
  if (!data.customAssignments.includes(assignment)) {
    data.customAssignments.push(assignment);
    saveData(data);
  }
};

export const getCustomAssignments = () => {
  const data = getData();
  return data.customAssignments || [];
};

export const addCustomLeaveReason = (reason) => {
  const data = getData();
  if (!data.customLeaveReasons.includes(reason)) {
    data.customLeaveReasons.push(reason);
    saveData(data);
  }
};

export const getCustomLeaveReasons = () => {
  const data = getData();
  return data.customLeaveReasons || [];
};

// Helper to check if member is on leave
export const isMemberOnLeave = (dateStr, memberId) => {
  const schedule = getScheduleForDate(dateStr);
  return schedule.onLeave.some(l => l.memberId === memberId);
};

// Helper to check if slot is taken (checks across all shifts for that day)
export const isSlotTaken = (dateStr, shiftType, slotNumber) => {
  const schedule = getScheduleForDate(dateStr);
  // Check all shifts for this slot number
  for (const shift of Object.values(schedule.shifts)) {
    if (shift.some(s => s.slot === slotNumber)) {
      return true;
    }
  }
  return false;
};

// Helper to check if assignment is taken (checks across all shifts for that day)
export const isAssignmentTaken = (dateStr, assignmentName) => {
  const schedule = getScheduleForDate(dateStr);
  // Check all shifts for this assignment
  for (const shift of Object.values(schedule.shifts)) {
    if (shift.some(s => s.assignment === assignmentName)) {
      return true;
    }
  }
  return false;
};

// Get all assigned members for a date
export const getAssignedMemberIds = (dateStr) => {
  const schedule = getScheduleForDate(dateStr);
  const assigned = new Set();
  
  Object.values(schedule.shifts).forEach(shift => {
    shift.forEach(entry => assigned.add(entry.memberId));
  });
  
  schedule.onLeave.forEach(entry => assigned.add(entry.memberId));
  
  return Array.from(assigned);
};

// Get list of empty shifts for a date
export const getEmptyShifts = (dateStr) => {
  const schedule = getScheduleForDate(dateStr);
  const emptyShifts = [];
  
  Object.entries(schedule.shifts).forEach(([shiftType, members]) => {
    if (members.length === 0) {
      emptyShifts.push(shiftType);
    }
  });
  
  return emptyShifts;
};

// Get list of unassigned slots for a date (slots 1-6 that aren't assigned)
export const getUnassignedSlots = (dateStr) => {
  const schedule = getScheduleForDate(dateStr);
  const assignedSlots = new Set();
  
  // Collect all assigned slots
  Object.values(schedule.shifts).forEach(shift => {
    shift.forEach(member => {
      if (member.slot) {
        assignedSlots.add(member.slot);
      }
    });
  });
  
  // Return slots 1-6 that aren't assigned
  const unassigned = [];
  for (let i = 1; i <= 6; i++) {
    if (!assignedSlots.has(i)) {
      unassigned.push(i);
    }
  }
  
  return unassigned;
};

// Copy a schedule from one date and paste to multiple dates
export const pasteScheduleToDateRange = (sourceSchedule, targetDateStrings) => {
  const data = getData();
  
  targetDateStrings.forEach(dateStr => {
    // Initialize schedule for the date if it doesn't exist
    if (!data.schedules[dateStr]) {
      data.schedules[dateStr] = {
        shifts: { JPN: [], IST: [], CET_EARLY: [], CET_LATE: [], US_EARLY: [], US_LATE: [] },
        onLeave: []
      };
    }
    
    // Get the highest ID across all existing schedules to avoid conflicts
    let maxId = 0;
    Object.values(data.schedules).forEach(schedule => {
      Object.values(schedule.shifts).forEach(shift => {
        shift.forEach(entry => {
          if (entry.id > maxId) maxId = entry.id;
        });
      });
      schedule.onLeave.forEach(entry => {
        if (entry.id > maxId) maxId = entry.id;
      });
    });
    
    // Copy shifts
    Object.keys(sourceSchedule.shifts).forEach(shiftType => {
      const newShiftMembers = sourceSchedule.shifts[shiftType].map(member => {
        maxId++;
        return {
          ...member,
          id: maxId
        };
      });
      data.schedules[dateStr].shifts[shiftType] = newShiftMembers;
    });
    
    // Copy on-leave entries
    const newOnLeave = sourceSchedule.onLeave.map(leave => {
      maxId++;
      return {
        ...leave,
        id: maxId
      };
    });
    data.schedules[dateStr].onLeave = newOnLeave;
  });
  
  saveData(data);
};
