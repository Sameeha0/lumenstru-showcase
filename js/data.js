// the 4 made up students
// all days are offsets from today (0 = today, 1 = tomorrow, -3 = 3 days ago)
// so the demo never looks out of date
// class days are weekdays (0 = Sun). week(0, 1) = today's and tomorrow's weekday,
// so there's always a class today

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function dateAt(offset) {
  return addDays(TODAY, offset);
}
function week(...offsets) {
  return offsets.map(o => dateAt(o).getDay());
}

const PROFILES = [
  {
    id: "aisha",
    name: "Aisha Khan",
    first: "Aisha",
    stage: "16 · O Level candidate, Karachi",
    blurb: "Chemistry Paper 2 is in ten days, and it lands on day 3 of her period.",
    quote: "I used to cram the night before and feel awful. Now my hard past papers are done before my period even starts.",
    cycleLength: 30,
    periodLength: 5,
    lastStart: -22,
    gaps: [29, 31, 30, 30],
    checkin: { mood: "Okay", energy: 2 },
    focus: { score: 78, streak: 6 },
    classes: [
      { name: "Chemistry", place: "Lab 2", note: "Bring practical notebook", start: "08:00", end: "09:20", days: week(0, 1, 2, 3, 4) },
      { name: "Mathematics", place: "Room 11", start: "09:30", end: "10:50", days: week(0, 1, 2, 3, 4) },
      { name: "English", place: "Room 7", start: "11:10", end: "12:30", days: week(1, 3) },
      { name: "Physics tuition", place: "Academy, Block 6", start: "17:00", end: "18:30", days: week(0, 3) },
    ],
    busyDays: [],
    tasks: [
      { name: "Chemistry revision", diff: 4, due: 10, hours: 9, parts: 6, partHours: 1.5, progress: 20 },
      { name: "Maths: quadratics worksheet", diff: 3, due: 0, hours: 1 },
      { name: "Physics: forces formula sheet", diff: 2, due: 0, hours: 0.5, done: true },
      { name: "English: read Of Mice and Men ch. 4", diff: 2, due: 1, hours: 1 },
      { name: "Chemistry past paper 2021 (P2)", diff: 5, due: 9, hours: 2, doDay: 2 },
      { name: "Urdu essay draft", diff: 3, due: 6, hours: 1.5 },
    ],
    moves: [
      { name: "Chemistry past paper 2021 (P2)", due: 9, from: 8, to: 2, reason: "Period expected on {date:8}" },
    ],
    logs: {
      "-22": { flow: "Medium", severity: "Moderate", symptoms: ["Cramps", "Fatigue"], mood: "Tired" },
      "-21": { flow: "Heavy", severity: "Moderate", symptoms: ["Cramps", "Headache"], mood: "Sensitive" },
      "-20": { flow: "Medium", severity: "Mild", symptoms: ["Fatigue"], mood: "Calm" },
    },
    exam: { name: "O Level Chemistry Paper 2", due: 10 },
    helps: [
      ["Sees the clash", "Her period is due in 8 days, so Chemistry Paper 2 falls on period day 3. Lumenstru knows those days will be harder."],
      ["Front-loads the hard papers", "The hardest past paper moved off her first period day to {day:2}, while her energy is still good."],
      ["Splits revision into parts", "9 hours of Chemistry revision is spread over the days left, lighter on period days."],
      ["School-day reminders", "Class alarms for school and evening tuition, and a \"skip white clothes\" note on expected period days."],
    ],
    tryText: "Try: Log today and start her period, and watch the app switch to Lavender by itself.",
  },
  {
    id: "zara",
    name: "Zara Ahmed",
    first: "Zara",
    stage: "20 · BSc Computer Science, Year 2",
    blurb: "Day two of her period with bad cramps, and a Data Structures assignment due in five days.",
    quote: "I logged my period and the whole app went dark and calm. It quietly moved my assignment to a day I would feel better.",
    cycleLength: 28,
    periodLength: 5,
    lastStart: -1,
    gaps: [27, 28, 29, 28],
    checkin: { mood: "Tired", energy: 1 },
    focus: { score: 64, streak: 3 },
    classes: [
      { name: "Algorithms lecture", place: "Hall B", start: "10:00", end: "12:00", days: week(0, 2) },
      { name: "Databases lab", place: "Lab 3.04", note: "Recorded, can watch later", start: "14:00", end: "16:00", days: week(0) },
      { name: "Web Development", place: "Lab 1.10", start: "09:00", end: "15:00", days: week(2) },
      { name: "Maths for CS", place: "Room 2.01", start: "11:00", end: "12:00", days: week(1, 3) },
    ],
    busyDays: [],
    tasks: [
      { name: "Watch recorded lecture: graphs", diff: 2, due: 0, hours: 1 },
      { name: "Reply to sprint group about tickets", diff: 1, due: 0, hours: 0.25, done: true },
      { name: "Web Dev coursework", diff: 4, due: 9, hours: 2, parts: 4, partHours: 0.5, progress: 10 },
      { name: "Data Structures assignment", diff: 5, due: 5, hours: 2, doDay: 4 },
      { name: "Maths for CS problem set", diff: 3, due: 3, hours: 1 },
    ],
    moves: [
      { name: "Data Structures assignment", due: 5, from: 0, to: 4, reason: "Period day 2 today" },
    ],
    logs: {
      "-1": { flow: "Heavy", severity: "Severe", symptoms: ["Cramps", "Fatigue", "Headache"], mood: "Tired" },
      "0": { flow: "Medium", severity: "Moderate", symptoms: ["Cramps", "Fatigue"], mood: "Low Energy" },
      "-29": { flow: "Heavy", severity: "Severe", symptoms: ["Cramps", "Bloating"], mood: "Irritated" },
      "-28": { flow: "Medium", severity: "Moderate", symptoms: ["Cramps"], mood: "Tired" },
    },
    helps: [
      ["Lavender switched on by itself", "When she logged her period the app moved to its dark Lavender mode. Stats and the long task list step back, leaving one focus task and a sleep track."],
      ["Moved the hardest task", "The Data Structures assignment went from today to {day:4}. She can Undo it with one tap."],
      ["Gentler focus timer", "The timer starts in Cramp-safe mode: 15 minutes of focus, 10 minutes of break."],
      ["Ready for the GP", "Her doctor summary PDF (Profile, My Cycle & Insights) lists pain by period day, for her appointment about painful periods."],
    ],
    tryText: "Try: ask the AI Assistant about cramps, or end her period in Log today.",
  },
  {
    id: "mei",
    name: "Mei Lin",
    first: "Mei",
    stage: "23 · MSc Data Science, part-time café job",
    blurb: "Her cycles swing from 26 to 34 days, and café shifts eat into three evenings a week.",
    quote: "Every app told me my period would come on day 28. Lumenstru learned my own pattern instead.",
    cycleLength: 31,
    periodLength: 6,
    lastStart: -8,
    gaps: [26, 34, 29, 33],
    checkin: { mood: "Happy", energy: 3 },
    focus: { score: 86, streak: 11 },
    classes: [
      { name: "Deep Learning seminar", place: "Room 4.12", start: "11:00", end: "13:00", days: week(0, 2) },
      { name: "Supervisor meeting", place: "Online", note: "Bring proposal outline", start: "15:00", end: "15:30", days: week(0) },
      { name: "Café shift", place: "Bean & Leaf", note: "Closing shift", start: "16:00", end: "21:00", days: week(2, 5) },
    ],
    busyDays: [],
    tasks: [
      { name: "Dissertation proposal", diff: 5, due: 8, hours: 10, parts: 5, partHours: 2, progress: 25 },
      { name: "Email supervisor the outline", diff: 1, due: 0, hours: 0.25, done: true },
      { name: "Kaggle notebook: clean dataset", diff: 3, due: 1, hours: 1.5 },
      { name: "Statistics quiz prep", diff: 4, due: 4, hours: 2, doDay: 1 },
      { name: "Read 2 papers on transformers", diff: 3, due: 6, hours: 2 },
    ],
    moves: [
      { name: "Statistics quiz prep", due: 4, from: 2, to: 1, reason: "{day:2} has 7 h of classes" },
    ],
    logs: {
      "-8": { flow: "Medium", severity: "Mild", symptoms: ["Bloating"], mood: "Calm" },
      "-7": { flow: "Medium", severity: "Moderate", symptoms: ["Cramps", "Cravings"], mood: "Sensitive" },
    },
    helps: [
      ["Learns her own cycle", "Her cycles vary from 26 to 34 days. The prediction uses her own last cycles, not a textbook 28."],
      ["Uses her best week", "She is in her high-energy days, so the dissertation proposal gets its biggest parts now."],
      ["Shifts count as busy days", "Café shifts are in her timetable. Hard tasks stay off days with 5+ hours booked."],
      ["Keeps her going", "Focus timer and an 11-day streak. Her check-ins feed back into her own forecast."],
    ],
    tryText: "Try: add a hard task due in 3 days and see where Lumenstru plans it.",
  },
  {
    id: "sofia",
    name: "Sofia Martínez",
    first: "Sofia",
    stage: "19 · Nursing, Year 1, on hospital placement",
    blurb: "Eight-hour placement shifts, and her anatomy exam falls on her next period.",
    quote: "On placement days I only get light tasks. And I knew two weeks early that my exam lands on my period.",
    cycleLength: 29,
    periodLength: 5,
    lastStart: -14,
    gaps: [28, 30, 29, 29],
    checkin: { mood: "Tired", energy: 2 },
    focus: { score: 71, streak: 4 },
    classes: [
      { name: "Placement: Ward 7", place: "St Mary's Hospital", note: "Uniform + ID badge", start: "07:30", end: "15:30", days: week(0, 1, 4, 5) },
      { name: "Anatomy lecture", place: "Lecture hall 2", start: "10:00", end: "12:00", days: week(2, 3) },
    ],
    busyDays: [],
    tasks: [
      { name: "Placement reflective log", diff: 2, due: 0, hours: 0.5 },
      { name: "Pharmacology flashcards (20)", diff: 2, due: 0, hours: 0.5 },
      { name: "Anatomy exam revision", diff: 4, due: 15, hours: 5, parts: 10, partHours: 0.5, progress: 5 },
      { name: "Book GP appointment", diff: 1, due: 2, hours: 0.25 },
      { name: "Essay: patient dignity", diff: 4, due: 7, hours: 2, doDay: 3 },
    ],
    moves: [
      { name: "Essay: patient dignity", due: 7, from: 1, to: 3, reason: "{day:1} has 8 h of classes" },
    ],
    logs: {
      "-14": { flow: "Medium", severity: "Mild", symptoms: ["Fatigue"], mood: "Tired" },
      "-13": { flow: "Light", severity: "Mild", symptoms: ["Headache"], mood: "Neutral" },
    },
    exam: { name: "Anatomy & Physiology exam", due: 15 },
    helps: [
      ["Placement-aware", "8-hour shifts make a busy day. Only light tasks like flashcards are planned for them."],
      ["Listens to check-ins", "She said she feels tired today, so the plan stays small."],
      ["Warns about the exam early", "Her exam is expected on period day 1. Revision starts now in small parts so she is ready early."],
      ["In her language", "Lumenstru works in English, Spanish, Hindi, Korean and Chinese. Try Profile > Language."],
    ],
    tryText: "Try: Profile > Language > Español, or open Tasks to see revision split into parts.",
  },
];
