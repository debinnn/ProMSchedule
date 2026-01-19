import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';

const initialData = {
  users: [
    { id: 'admin', username: 'admin', password: 'Admin@123', role: 'admin', createdAt: '2026-01-19' },
    { id: 'manager', username: 'manager', password: 'Manager@123', role: 'editor', createdAt: '2026-01-19' }
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

// Initialize Firestore with default data
export const initializeData = async () => {
  try {
    // Check if data already exists
    const teamMembersSnapshot = await getDocs(collection(db, 'teamMembers'));
    
    if (teamMembersSnapshot.empty) {
      console.log('Initializing Firestore with default data...');
      const batch = writeBatch(db);
      
      // Initialize team members
      initialData.teamMembers.forEach(member => {
        const memberRef = doc(db, 'teamMembers', member.id.toString());
        batch.set(memberRef, member);
      });
      
      // Initialize users
      initialData.users.forEach(user => {
        const userRef = doc(db, 'users', user.id);
        batch.set(userRef, user);
      });
      
      // Initialize custom assignments
      const assignmentsRef = doc(db, 'config', 'customAssignments');
      batch.set(assignmentsRef, { assignments: initialData.customAssignments });
      
      // Initialize custom leave reasons
      const reasonsRef = doc(db, 'config', 'customLeaveReasons');
      batch.set(reasonsRef, { reasons: initialData.customLeaveReasons });
      
      // Initialize sample schedule
      Object.entries(initialData.schedules).forEach(([dateStr, schedule]) => {
        const scheduleRef = doc(db, 'schedules', dateStr);
        batch.set(scheduleRef, schedule);
      });
      
      await batch.commit();
      console.log('Firestore initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing Firestore:', error);
  }
};

// Authentication
export const loginUser = async (username, password) => {
  try {
    // Get user from Firestore
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const userDoc = usersSnapshot.docs.find(doc => {
      const data = doc.data();
      return data.username === username && data.password === password;
    });
    
    if (userDoc) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

// Users
export const getAllUsers = async () => {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addUser = async (userData) => {
  const userRef = doc(collection(db, 'users'));
  await setDoc(userRef, { ...userData, id: userRef.id });
  return { id: userRef.id, ...userData };
};

export const updateUser = async (userId, updates) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, updates);
};

export const deleteUser = async (userId) => {
  await deleteDoc(doc(db, 'users', userId));
};

// Team Members
export const getAllTeamMembers = async () => {
  const snapshot = await getDocs(collection(db, 'teamMembers'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addTeamMember = async (memberData) => {
  const snapshot = await getDocs(collection(db, 'teamMembers'));
  const maxId = Math.max(...snapshot.docs.map(doc => parseInt(doc.id) || 0), 0);
  const newId = (maxId + 1).toString();
  const memberRef = doc(db, 'teamMembers', newId);
  await setDoc(memberRef, { ...memberData, id: parseInt(newId) });
  return { id: parseInt(newId), ...memberData };
};

export const updateTeamMember = async (memberId, updates) => {
  const memberRef = doc(db, 'teamMembers', memberId.toString());
  await updateDoc(memberRef, updates);
};

export const deleteTeamMember = async (memberId) => {
  await deleteDoc(doc(db, 'teamMembers', memberId.toString()));
};

// Schedules
export const getScheduleForDate = async (dateStr) => {
  const scheduleRef = doc(db, 'schedules', dateStr);
  const scheduleDoc = await getDoc(scheduleRef);
  
  if (scheduleDoc.exists()) {
    const schedule = scheduleDoc.data();
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

export const addShiftMember = async (dateStr, shiftType, memberData) => {
  const scheduleRef = doc(db, 'schedules', dateStr);
  const scheduleDoc = await getDoc(scheduleRef);
  
  let schedule;
  if (scheduleDoc.exists()) {
    schedule = scheduleDoc.data();
  } else {
    schedule = {
      shifts: { JPN: [], IST: [], CET_EARLY: [], CET_LATE: [], US_EARLY: [], US_LATE: [] },
      onLeave: []
    };
  }
  
  const newId = Math.max(
    ...Object.values(schedule.shifts).flat().map(s => s.id),
    ...schedule.onLeave.map(l => l.id),
    0
  ) + 1;
  
  const newEntry = { id: newId, ...memberData };
  schedule.shifts[shiftType].push(newEntry);
  
  await setDoc(scheduleRef, schedule);
  return newEntry;
};

export const updateShiftMember = async (dateStr, shiftType, entryId, updates) => {
  const scheduleRef = doc(db, 'schedules', dateStr);
  const scheduleDoc = await getDoc(scheduleRef);
  
  if (scheduleDoc.exists()) {
    const schedule = scheduleDoc.data();
    const entry = schedule.shifts[shiftType].find(e => e.id === entryId);
    if (entry) {
      Object.assign(entry, updates);
      await setDoc(scheduleRef, schedule);
    }
  }
};

export const deleteShiftMember = async (dateStr, shiftType, entryId) => {
  const scheduleRef = doc(db, 'schedules', dateStr);
  const scheduleDoc = await getDoc(scheduleRef);
  
  if (scheduleDoc.exists()) {
    const schedule = scheduleDoc.data();
    schedule.shifts[shiftType] = schedule.shifts[shiftType].filter(e => e.id !== entryId);
    await setDoc(scheduleRef, schedule);
  }
};

export const addOnLeave = async (dateStr, leaveData) => {
  const scheduleRef = doc(db, 'schedules', dateStr);
  const scheduleDoc = await getDoc(scheduleRef);
  
  let schedule;
  if (scheduleDoc.exists()) {
    schedule = scheduleDoc.data();
  } else {
    schedule = {
      shifts: { JPN: [], IST: [], CET_EARLY: [], CET_LATE: [], US_EARLY: [], US_LATE: [] },
      onLeave: []
    };
  }
  
  const newId = Math.max(
    ...Object.values(schedule.shifts).flat().map(s => s.id),
    ...schedule.onLeave.map(l => l.id),
    0
  ) + 1;
  
  const newLeave = { id: newId, ...leaveData };
  schedule.onLeave.push(newLeave);
  
  await setDoc(scheduleRef, schedule);
  return newLeave;
};

export const deleteOnLeave = async (dateStr, leaveId) => {
  const scheduleRef = doc(db, 'schedules', dateStr);
  const scheduleDoc = await getDoc(scheduleRef);
  
  if (scheduleDoc.exists()) {
    const schedule = scheduleDoc.data();
    schedule.onLeave = schedule.onLeave.filter(l => l.id !== leaveId);
    await setDoc(scheduleRef, schedule);
  }
};

// Validation helpers
export const isSlotTaken = async (dateStr, shiftType, slotNumber) => {
  const schedule = await getScheduleForDate(dateStr);
  for (const shift of Object.values(schedule.shifts)) {
    if (shift.some(member => member.slot === slotNumber)) {
      return true;
    }
  }
  return false;
};

export const isAssignmentTaken = async (dateStr, assignmentName) => {
  const schedule = await getScheduleForDate(dateStr);
  for (const shift of Object.values(schedule.shifts)) {
    if (shift.some(member => member.assignment === assignmentName)) {
      return true;
    }
  }
  return false;
};

export const getEmptyShifts = async (dateStr) => {
  const schedule = await getScheduleForDate(dateStr);
  const emptyShifts = [];
  
  Object.entries(schedule.shifts).forEach(([shiftType, members]) => {
    if (members.length === 0) {
      emptyShifts.push(shiftType);
    }
  });
  
  return emptyShifts;
};

export const getUnassignedSlots = async (dateStr) => {
  const schedule = await getScheduleForDate(dateStr);
  const assignedSlots = new Set();
  
  Object.values(schedule.shifts).forEach(shift => {
    shift.forEach(member => {
      if (member.slot) {
        assignedSlots.add(member.slot);
      }
    });
  });
  
  const unassigned = [];
  for (let i = 1; i <= 6; i++) {
    if (!assignedSlots.has(i)) {
      unassigned.push(i);
    }
  }
  
  return unassigned;
};

// Custom assignments
export const getCustomAssignments = async () => {
  const configRef = doc(db, 'config', 'customAssignments');
  const configDoc = await getDoc(configRef);
  return configDoc.exists() ? configDoc.data().assignments : [];
};

export const addCustomAssignment = async (assignment) => {
  const configRef = doc(db, 'config', 'customAssignments');
  const configDoc = await getDoc(configRef);
  
  let assignments = configDoc.exists() ? configDoc.data().assignments : [];
  if (!assignments.includes(assignment)) {
    assignments.push(assignment);
    await setDoc(configRef, { assignments });
  }
};

// Custom leave reasons
export const getCustomLeaveReasons = async () => {
  const configRef = doc(db, 'config', 'customLeaveReasons');
  const configDoc = await getDoc(configRef);
  return configDoc.exists() ? configDoc.data().reasons : [];
};

export const addCustomLeaveReason = async (reason) => {
  const configRef = doc(db, 'config', 'customLeaveReasons');
  const configDoc = await getDoc(configRef);
  
  let reasons = configDoc.exists() ? configDoc.data().reasons : [];
  if (!reasons.includes(reason)) {
    reasons.push(reason);
    await setDoc(configRef, { reasons });
  }
};

// Paste schedule to date range
export const pasteScheduleToDateRange = async (sourceSchedule, targetDateStrings) => {
  const batch = writeBatch(db);
  
  for (const dateStr of targetDateStrings) {
    const scheduleRef = doc(db, 'schedules', dateStr);
    
    // Get all existing IDs to calculate new ones
    const allSchedules = await getDocs(collection(db, 'schedules'));
    let maxId = 0;
    allSchedules.docs.forEach(doc => {
      const schedule = doc.data();
      Object.values(schedule.shifts || {}).forEach(shift => {
        shift.forEach(entry => {
          if (entry.id > maxId) maxId = entry.id;
        });
      });
      (schedule.onLeave || []).forEach(entry => {
        if (entry.id > maxId) maxId = entry.id;
      });
    });
    
    // Copy shifts with new IDs
    const newSchedule = {
      shifts: {},
      onLeave: []
    };
    
    Object.keys(sourceSchedule.shifts).forEach(shiftType => {
      newSchedule.shifts[shiftType] = sourceSchedule.shifts[shiftType].map(member => {
        maxId++;
        return { ...member, id: maxId };
      });
    });
    
    // Copy on-leave entries
    newSchedule.onLeave = sourceSchedule.onLeave.map(leave => {
      maxId++;
      return { ...leave, id: maxId };
    });
    
    batch.set(scheduleRef, newSchedule);
  }
  
  await batch.commit();
};

// Additional helper functions needed by components
export const getActiveTeamMembers = async () => {
  const members = await getAllTeamMembers();
  return members.filter(m => m.active);
};

export const getAssignedMemberIds = async (dateStr) => {
  const schedule = await getScheduleForDate(dateStr);
  const assignedIds = new Set();
  
  Object.values(schedule.shifts).forEach(shift => {
    shift.forEach(member => assignedIds.add(member.memberId));
  });
  
  schedule.onLeave.forEach(leave => assignedIds.add(leave.memberId));
  
  return Array.from(assignedIds);
};

export const createUser = async (username, password) => {
  const usersSnapshot = await getDocs(collection(db, 'users'));
  const maxId = Math.max(...usersSnapshot.docs.map(doc => parseInt(doc.id) || 0), 0);
  const newId = (maxId + 1).toString();
  
  const userData = {
    id: newId,
    username,
    password,
    role: 'public',
    createdAt: new Date().toISOString().split('T')[0]
  };
  
  const userRef = doc(db, 'users', newId);
  await setDoc(userRef, userData);
  return userData;
};

export const resetUserPassword = async (userId, newPassword) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { password: newPassword });
};

export const createTeamMember = async (name) => {
  return await addTeamMember({ name, active: true });
};

export const toggleMemberStatus = async (memberId) => {
  const memberRef = doc(db, 'teamMembers', memberId.toString());
  const memberDoc = await getDoc(memberRef);
  
  if (memberDoc.exists()) {
    const currentStatus = memberDoc.data().active;
    await updateDoc(memberRef, { active: !currentStatus });
  }
};

