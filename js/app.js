// main file: the page, navigation, cycle maths and the Dashboard / Calendar / Tasks screens
// rest of the screens are in screens.js. sizes copied from the app (1dp = 1px)

// Language + small helpers
let lang = "en";
const LOCALES = { en: "en-US", es: "es-ES", hi: "hi-IN", ko: "ko-KR", zh: "zh-CN" };
const LANGUAGE_NAMES = [["en", "English"], ["es", "Español"], ["hi", "हिन्दी"], ["ko", "한국어"], ["zh", "中文"]];

// same as tr() in the app: english in, translation out, fills in %s %d %1$s
function tr(text, ...args) {
  let out = (lang !== "en" && LANGS[lang][text]) || text;
  let i = 0;
  out = out.replace(/%(?:(\d)\$)?(0\d)?([sd])/g, (m, n, pad, type) => {
    const v = n ? args[n - 1] : args[i++];
    return pad ? String(v).padStart(Number(pad[1]), "0") : String(v);
  });
  return out.replace(/%%/g, "%");
}

function esc(text) {
  return String(text).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function shortDate(d) {
  return d.toLocaleDateString(LOCALES[lang], { month: "short", day: "numeric" });
}
function longDate(d) {
  return d.toLocaleDateString(LOCALES[lang], { month: "long", day: "numeric", year: "numeric" });
}
function dayName(offset) {
  return dateAt(offset).toLocaleDateString(LOCALES[lang], { weekday: "short" });
}
function dayLabel(offset) {
  if (offset === 0) return tr("Today");
  if (offset === 1) return tr("Tomorrow");
  return dayName(offset);
}
function dueText(offset) {
  if (offset == null) return tr("No due date");
  if (offset === 0) return tr("Due today");
  if (offset === 1) return tr("Due tomorrow");
  if (offset === -1) return tr("Due yesterday");
  return tr("Due %s", shortDate(dateAt(offset)));
}
function lowerFirst(s) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}
function offsetOf(date) {
  return Math.round((date - TODAY) / 86400000);
}
// "{date:8}" -> "Nov 4", "{day:2}" -> "Thu"
function fillDates(text) {
  return text.replace(/\{date:(-?\d+)\}/g, (m, n) => shortDate(dateAt(Number(n))))
    .replace(/\{day:(-?\d+)\}/g, (m, n) => dayName(Number(n)));
}
// "14:00" -> "2:00 PM"
function timeLabel(t) {
  const [h, m] = t.split(":").map(Number);
  return (h % 12 || 12) + ":" + String(m).padStart(2, "0") + (h < 12 ? " AM" : " PM");
}
function minutesOf(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function hoursText(minutes) {
  const h = minutes / 60;
  return tr("%s h", Number.isInteger(h) ? h : h.toFixed(1));
}
function hoursLabel(h) {
  return tr("%s h", String(h));
}
function clock(s) {
  return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
}

// line icons copied from res/drawable (24x24 viewport)
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.5 9v10a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1V9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  calendar: '<path d="M6.5,5 H17.5 A3,3 0 0 1 20.5,8 V18 A3,3 0 0 1 17.5,21 H6.5 A3,3 0 0 1 3.5,18 V8 A3,3 0 0 1 6.5,5 Z M3.5 10h17M8 3v4M16 3v4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="8" cy="14.5" r="1.1" fill="currentColor"/><circle cx="12" cy="14.5" r="1.1" fill="currentColor"/><circle cx="16" cy="14.5" r="1.1" fill="currentColor"/>',
  tasks: '<path d="M7.5,3.5 H16.5 A4,4 0 0 1 20.5,7.5 V16.5 A4,4 0 0 1 16.5,20.5 H7.5 A4,4 0 0 1 3.5,16.5 V7.5 A4,4 0 0 1 7.5,3.5 Z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M7.5 12l2.7 2.7L16.5 8.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  calm: '<path d="M20 13.5A8.5 8.5 0 1 1 10.5 4a7 7 0 0 0 9.5 9.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  profile: '<path d="M12,4.7 A3.6,3.6 0 1 1 12,11.9 A3.6,3.6 0 1 1 12,4.7 Z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4.8 20c1-3.6 4-5.6 7.2-5.6s6.2 2 7.2 5.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  plus: '<path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  play: '<path d="M8 5.2 L19 12 L8 18.8 Z" fill="currentColor"/>',
  pause: '<path d="M7.5 5.5 h3 v13 h-3 Z M13.5 5.5 h3 v13 h-3 Z" fill="currentColor"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
  back: '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  send: '<path d="M4 12 20 4l-4 16-4-6-8-2Z M12 14l8-10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  bell: '<path d="M6 10a6 6 0 1 1 12 0v4.2l1.6 2.6H4.4L6 14.2Z M10 19a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>',
  sparkles: '<path d="M12 3l1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3L12 3Z M18.5 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>',
  leaf: '<path d="M6 18C4 10 10 4 18 4c1 8-4 14-12 14Z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M6 18C9 13 12 10 17 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  strawberry: '<path d="M12 3l1.6 2.4-1.6.9-1.6-.9L12 3Z" fill="none" stroke="currentColor" stroke-width="1"/><path d="M12 6.2c4.6 0 7.6 3.7 7.6 7.4C19.6 18 15.8 21 12 21S4.4 18 4.4 13.6C4.4 9.9 7.4 6.2 12 6.2Z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="9" cy="12" r=".7" fill="currentColor"/><circle cx="12.3" cy="10.4" r=".7" fill="currentColor"/><circle cx="15" cy="12.2" r=".7" fill="currentColor"/><circle cx="10.2" cy="15" r=".7" fill="currentColor"/><circle cx="13.6" cy="15.4" r=".7" fill="currentColor"/>',
  wind: '<path d="M3 8h11a2.5 2.5 0 1 0-2.4-3.2M3 13h14a2.5 2.5 0 1 1-2.4 3.2M3 18h8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  heart: '<path d="M12 20s-7.5-4.6-9.4-9.3C1.4 7.2 3.6 4 7 4c2 0 3.7 1.1 5 3 1.3-1.9 3-3 5-3 3.4 0 5.6 3.2 4.4 6.7C19.5 15.4 12 20 12 20Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  moon: '<path d="M20 13.5A8.5 8.5 0 1 1 10.5 4a7 7 0 0 0 9.5 9.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  timetable: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.5v4.8l3.2 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  info: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 11v5.5M12 8v.1" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
  help: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M9.5 9.3a2.5 2.5 0 1 1 3.7 2.2c-.9.5-1.2 1-1.2 1.9M12 16.6v.1" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  door: '<path d="M14 17l5-5-5-5M4 12h15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 4v16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  edit: '<path d="M4 20 4.7 16.6 15.5 5.8a1.7 1.7 0 0 1 2.4 0l1.3 1.3a1.7 1.7 0 0 1 0 2.4L8.4 20.3 4 20Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  wifi: '<path d="M2 9a15 15 0 0 1 20 0M5.5 12.5a10 10 0 0 1 13 0M9 16a5 5 0 0 1 6 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="19.5" r="1.4" fill="currentColor"/>',
  battery: '<rect x="2.5" y="7" width="17" height="10" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="4.5" y="9" width="11" height="6" rx="1" fill="currentColor"/><path d="M21.5 10.5v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
};
function icon(name) {
  return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[name] + '</svg>';
}

// The app's mascots. Green by day, pink at night.
const MOODS = ["Happy", "Calm", "Okay", "Tired", "Sad", "Anxious"];
function moodMascot(mood, night, size) {
  const file = "assets/mascot/mascot_" + mood.toLowerCase() + (night ? "_night" : "") + ".webp";
  return `<img src="${file}" alt="" style="width:${size}px;height:${size}px">`;
}
function mascot(night, size) {
  return `<img src="assets/mascot/mascot_${night ? "night" : "day"}.webp" alt="" style="width:${size}px;height:${size}px">`;
}

// Cycle maths (simpler version of CycleRules.kt)
// periods = list of { start, end } as day offsets. last one has no end if it's still going
function setupPeriods(p) {
  const starts = [p.lastStart];
  for (let i = p.gaps.length - 1; i >= 0; i--) starts.unshift(starts[0] - p.gaps[i]);
  p.periods = starts.map(s => ({ start: s, end: s + p.periodLength - 1 }));
  const last = p.periods[p.periods.length - 1];
  if (-last.start + 1 <= p.periodLength) delete last.end;   // still going
}

function latest(p) {
  return p.periods[p.periods.length - 1];
}

// the next cycle length is learned from the last 3 cycles
function learnCycle(p) {
  p.periods.sort((a, b) => a.start - b.start);
  const gaps = [];
  for (let i = 1; i < p.periods.length; i++) gaps.push(p.periods[i].start - p.periods[i - 1].start);
  p.gaps = gaps;
  const recent = gaps.slice(-3);
  if (recent.length) p.cycleLength = Math.round(recent.reduce((a, b) => a + b, 0) / recent.length);
}

function phaseByDay(p, cycleDay) {
  const ov = p.cycleLength - 14;
  if (cycleDay < ov - 1) return "Follicular";
  if (cycleDay <= ov + 1) return "Ovulatory";
  return "Luteal";
}

function cycleInfo(p) {
  const last = latest(p);
  const day = -last.start + 1;
  const inPeriod = last.end === undefined;
  const next = last.start + p.cycleLength;
  return {
    start: dateAt(last.start), day, inPeriod,
    nextOffset: next, nextStart: dateAt(next),
    phase: inPeriod ? "Menstrual" : phaseByDay(p, day),
  };
}

// cycle day for any day offset (future days wrap into the next cycle)
function cycleDayAt(p, offset) {
  let start = p.periods[0].start;
  for (const per of p.periods) if (per.start <= offset) start = per.start;
  let d = offset - start + 1;
  if (start === latest(p).start) while (d > p.cycleLength) d -= p.cycleLength;
  while (d < 1) d += p.cycleLength;
  return d;
}

// "logged", "expected" or "" for a day offset
function periodKind(p, offset) {
  for (const per of p.periods) {
    const end = per.end !== undefined ? per.end : per.start + p.periodLength - 1;
    if (offset >= per.start && offset <= end) {
      if (per.end === undefined && offset > 0) return "expected";
      return "logged";
    }
  }
  if (offset > 0 && offset >= cycleInfo(p).nextOffset && cycleDayAt(p, offset) <= p.periodLength) return "expected";
  return "";
}
function isPeriodDay(p, offset) {
  return periodKind(p, offset) !== "";
}

function phaseAt(p, offset) {
  return isPeriodDay(p, offset) ? "Menstrual" : phaseByDay(p, cycleDayAt(p, offset));
}

function classesOn(p, weekday) {
  return p.classes.filter(c => c.days.includes(weekday)).sort((a, b) => minutesOf(a.start) - minutesOf(b.start));
}
function classMinutes(p, offset) {
  return classesOn(p, dateAt(offset).getDay()).reduce((sum, c) => sum + minutesOf(c.end) - minutesOf(c.start), 0);
}
// 5 h of classes or more = a busy day (Timetable.BUSY_MINUTES)
function isBusy(p, offset) {
  return classMinutes(p, offset) >= 300 || p.busyDays.includes(offset);
}

// 1 = low, 2 = medium, 3 = high
function energyAt(p, offset) {
  const log = p.logs[offset];
  if (offset === 0 && (p.checkin.energy === 1 || (log && log.severity === "Severe"))) return 1;
  const d = cycleDayAt(p, offset);
  let e;
  if (isPeriodDay(p, offset)) e = d <= 2 ? 1 : 2;
  else if (d > p.cycleLength - 3) e = 1;
  else if (phaseByDay(p, d) === "Luteal") e = 2;
  else e = 3;
  if (isBusy(p, offset) && e > 1) e -= 1;   // long class days tire you out
  return e;
}

function ringText(p, c) {
  if (c.inPeriod) {
    if (c.day > p.periodLength + 3) return { label: tr("PERIOD DAY"), number: c.day, unit: tr("has it ended?") };
    return { label: tr("PERIOD DAY"), number: c.day, unit: tr("of about %d", p.periodLength) };
  }
  const diff = c.nextOffset;
  if (diff > 0) return { label: tr("PERIOD IN"), number: diff, unit: tr(diff === 1 ? "day" : "days") };
  if (diff === 0) return { label: tr("PERIOD DUE"), number: tr("Today"), unit: tr("expected") };
  return { label: tr("PERIOD LATE"), number: -diff, unit: tr(diff === -1 ? "day" : "days") };
}

// Tasks + auto rebalance (only the work day moves, never the due date)
function workDay(t) {
  return t.doDay !== undefined ? t.doDay : t.due;
}

function todaysTasks() {
  return current.tasks.filter(t => !t.done && (t.parts || (t.due != null && workDay(t) <= 0)));
}

function doneToday() {
  return current.tasks.filter(t => t.done && t.doneToday);
}

// hard task on a low energy / busy day -> move it to a better day before it's due
function autoPlan(t) {
  if (t.done || t.parts || t.keepPlan || t.diff < 4 || t.due == null || t.due <= 0) return;
  const p = current;
  const work = workDay(t);
  if (energyAt(p, work) >= 2 && !isBusy(p, work)) return;
  let best = null;
  let bestEnergy = energyAt(p, work);
  for (let d = t.due - 1; d >= 0; d--) {
    if (isBusy(p, d)) continue;
    const e = energyAt(p, d);
    if (e > bestEnergy) {
      best = d;
      bestEnergy = e;
    }
  }
  if (best === null) return;
  let reason;
  if (isBusy(p, work)) reason = tr("%1$s has %2$s of classes", dayName(work), hoursText(classMinutes(p, work)));
  else if (isPeriodDay(p, work)) reason = tr("Period expected on %s", shortDate(dateAt(work)));
  else reason = tr("Low energy expected on %s", dayName(work));
  p.moves = p.moves.filter(m => m.taskId !== t.id);
  p.moves.push({ taskId: t.id, name: t.name, due: t.due, from: work, to: best, reason });
  t.doDay = best;
}

function rebalanceAll() {
  for (const t of current.tasks) autoPlan(t);
}

// split a big task (over 2 h, 2+ days before it is due) into daily parts
function splitTask(t) {
  delete t.parts;
  delete t.partHours;
  if (t.hours > 2 && t.due != null && t.due >= 2) {
    t.parts = Math.min(t.due, Math.max(2, Math.ceil(t.hours / 1.5)));
    t.partHours = Math.round(t.hours / t.parts * 4) / 4;
    t.progress = t.progress || 0;
    delete t.doDay;
  }
}

// Page state
let current = null;       // the open student (a copy, so changes don't stick)
let route = "dashboard";
let params = {};
let navStack = [];
let lastRendered = "";
let selectedBar = 0;
let monthShift = 0;
let selectedDay = 0;
let editingCheckin = false;
let draft = null;
let showDone = false;
let snackTimer = null;
let dialogAction = null;

const TABS = ["dashboard", "calendar", "tasks", "calm", "profile"];
const WITH_BAR = TABS.concat(["assistant", "survival"]);

function setMode(night) {
  document.documentElement.dataset.mode = night ? "lavender" : "matcha";
}

// home
function showHome() {
  current = null;
  stopSounds();
  setMode(false);
  document.getElementById("allbtn").hidden = true;
  let cards = "";
  for (const p of PROFILES) {
    const copy = JSON.parse(JSON.stringify(p));
    setupPeriods(copy);
    const c = cycleInfo(copy);
    cards += `
      <button class="pcard" onclick="openProfile('${p.id}')">
        <div class="who">
          <span class="photo">${portrait(p.id, 72)}<span class="badge-mascot">${moodMascot(p.checkin.mood, false, 30)}</span></span>
          <div><h2>${p.first}</h2><p class="stage">${p.stage}</p></div>
        </div>
        <p class="blurb">${p.blurb}</p>
        <div class="tags">
          <span class="tag ${c.inPeriod ? "period" : ""}">${c.inPeriod ? "Period day " + c.day : c.phase + " phase"}</span>
          <span class="tag">${c.inPeriod ? "Lavender mode" : "Matcha mode"}</span>
          <span class="tag">Feels ${p.checkin.mood.toLowerCase()}</span>
        </div>
        <span class="open">Open ${p.first}'s phone &rarr;</span>
      </button>`;
  }
  document.getElementById("page").innerHTML = homeBackground() + `
    <div class="intro">
      <div class="text">
        <p class="over">Showcase</p>
        <h1>Four students, <i>four cycles</i>, one planner.</h1>
        <p>Lumenstru plans study around your energy across the month. Pick a student to see their phone, with the app running on their own week. Everything on the phone works: tap, type, scroll.</p>
      </div>
      ${mascot(false, 150)}
    </div>
    <div class="profiles">${cards}</div>
    <p class="footnote">These students are made up for the demo and drawn, not photographed. All data lives in this page and the dates move with today.</p>`;
  window.scrollTo(0, 0);
}

// the home page's moving background: big soft blobs, like the app
function homeBackground() {
  const blobs = [
    // [left %, top %, orbit radius, size, colour, reverse]
    [12, 18, 120, 900, "rgba(229, 169, 158, 0.40)", false],
    [88, 12, 140, 820, "rgba(90, 113, 86, 0.26)", true],
    [70, 90, 120, 950, "rgba(229, 169, 158, 0.30)", true],
    [20, 95, 100, 760, "rgba(90, 113, 86, 0.20)", false],
  ];
  let html = '<div class="page-ambient">';
  for (const b of blobs) {
    html += `<div class="orbit ${b[5] ? "rev" : ""}" style="left:${b[0]}%;top:${b[1]}%">
      <i style="left:${b[2]}px;width:${b[3]}px;height:${b[3]}px;background:radial-gradient(circle, ${b[4]}, transparent 68%)"></i></div>`;
  }
  return html + "</div>";
}

// profile
function openProfile(id) {
  current = JSON.parse(JSON.stringify(PROFILES.find(p => p.id === id)));
  setupPeriods(current);
  current.tasks.forEach((t, i) => { t.id = i + 1; if (t.done && t.due === 0) t.doneToday = true; });
  current.nextId = current.tasks.length + 1;
  current.moves.forEach(m => {
    m.reason = fillDates(m.reason);
    const t = current.tasks.find(x => x.name === m.name);
    if (t) m.taskId = t.id;
  });
  current.night = cycleInfo(current).inPeriod;   // Lavender turns on by itself during a period
  current.reminders = { hydration: false, rest: false, task: false };
  current.reminderHistory = [];
  current.notif = { dnd: false, hydration: { on: true, time: "10:00" }, rest: { on: true, time: "13:00" }, task: { on: true, time: "15:30" }, period: true, classMinutes: 20 };
  current.account = null;
  current.chat = [];
  current.suggestions = DEFAULT_SUGGESTIONS;

  route = "dashboard";
  params = {};
  navStack = [];
  lastRendered = "";
  selectedBar = 0;
  monthShift = 0;
  selectedDay = 0;
  editingCheckin = false;
  showDone = false;
  resetTimer(true);
  stopSounds();
  calm.track = cycleInfo(current).inPeriod ? 1 : 0;
  setMode(current.night);
  document.getElementById("allbtn").hidden = false;
  drawPage();
}

function drawPage() {
  const id = current.id;
  let helps = "";
  current.helps.forEach((h, i) => {
    helps += `<li><b>${i + 1}</b><div><strong>${h[0]}</strong><span>${fillDates(h[1])}</span></div></li>`;
  });
  let switcher = "";
  for (const p of PROFILES) {
    switcher += `<button class="${p.id === id ? "on" : ""}" onclick="openProfile('${p.id}')">${portrait(p.id, 28)}${p.first}</button>`;
  }
  document.getElementById("page").innerHTML = `
    <div class="view">
      <section class="story">
        <div class="who">
          <span class="photo">${portrait(id, 92)}<span class="badge-mascot" id="story-mood">${moodMascot(current.checkin.mood, current.night, 36)}</span></span>
          <div><h1>${current.name}</h1><p class="stage">${current.stage}</p></div>
        </div>
        <p class="quote">"${current.quote}"</p>
        <h3>How Lumenstru is helping ${current.first}</h3>
        <ol class="helps">${helps}</ol>
        <p class="try">${current.tryText}</p>
        <div class="switcher">${switcher}</div>
      </section>
      <div class="phone-wrap">
        <div class="phone" id="phone" aria-label="${current.first}'s phone">
          <div class="ambient" id="ambient"></div>
          <span class="camera"></span>
          <div class="statusbar"><span>9:41</span><span>${icon("wifi")} ${icon("battery")}</span></div>
          <div class="screen scroller" id="screen"></div>
          <nav class="tabbar" id="tabbar"></nav>
          <div class="gesture"><span></span></div>
          <div id="overlay"></div>
          <div id="snackbar"></div>
        </div>
        <p class="phone-hint">Scroll with the mouse wheel, or drag like a finger.</p>
      </div>
    </div>`;
  drawAmbient();
  fitPhone();
  render();
  window.scrollTo(0, 0);
}

function updateStoryMood() {
  const el = document.getElementById("story-mood");
  if (el) el.innerHTML = moodMascot(current.checkin.mood, current.night, 36);
}

// moving background like AmbientBackground.kt (4 blobs going round in circles)
function drawAmbient() {
  const night = current.night;
  const blobs = [
    [90, 140, 70, 900, "var(--blob-paper)", false],
    [300, 640, 70, 760, "var(--blob-paper)", true],
    [night ? 260 : 280, night ? 260 : 130, 90, 600, "var(--blob-a)", !night],
    [night ? 90 : 75, 560, 80, 640, "var(--blob-b)", true],
  ];
  let html = "";
  for (const b of blobs) {
    html += `<div class="orbit ${b[5] ? "rev" : ""}" style="left:${b[0]}px;top:${b[1]}px">
      <i style="left:${b[2]}px;width:${b[3]}px;height:${b[3]}px;background:radial-gradient(circle, ${b[4]}, transparent 70%)"></i></div>`;
  }
  document.getElementById("ambient").innerHTML = html;
}

// the phone shrinks a little on short screens so all of it fits
function fitPhone() {
  const phone = document.getElementById("phone");
  if (!phone) return;
  const room = window.innerHeight - 130;   // leave room for the top bar and the hint
  phone.style.zoom = window.innerWidth > 440 ? Math.min(1, room / 852) : 1;
}
window.addEventListener("resize", fitPhone);

function setNight(night) {
  current.night = night;
  setMode(night);
  drawAmbient();
  updateStoryMood();
}

// navigation
function go(name, p) {
  navStack.push({ route, params });
  clearForms();
  route = name;
  params = p || {};
  editingCheckin = false;
  render();
}
function back() {
  const prev = navStack.pop() || { route: "dashboard", params: {} };
  clearForms();
  route = prev.route;
  params = prev.params;
  render();
}
function goTab(name) {
  navStack = [];
  clearForms();
  route = name;
  params = {};
  editingCheckin = false;
  render();
}

// forms start fresh each time their screen is opened
function clearForms() {
  taskForm = null;
  logForm = null;
  markRange = null;
  examForm = null;
  classForm = null;
}

function render() {
  closeOverlay();
  const screens = {
    dashboard: dashboardScreen, calendar: calendarScreen, tasks: tasksScreen, calm: calmScreen, profile: profileScreen,
    assistant: assistantScreen, survival: survivalScreen, timetable: timetableScreen, insights: insightsScreen,
    log: logScreen, task: taskEditorScreen, exam: examScreen, notifications: notificationScreen, settings: appSettingsScreen,
  };
  const el = document.getElementById("screen");
  if (!el) return;
  // same screen redrawing? keep the scroll where it was
  const key = route + JSON.stringify(params);
  const scroll = key === lastRendered ? el.scrollTop : 0;
  lastRendered = key;
  el.className = "screen scroller" + (route === "dashboard" ? " dash" : "") + (route === "assistant" ? " chat" : "");
  el.innerHTML = screens[route]();
  el.scrollTop = scroll;
  renderTabs();
  if (route === "assistant") scrollChat();
}

function renderTabs() {
  const bar = document.getElementById("tabbar");
  bar.style.display = WITH_BAR.includes(route) ? "flex" : "none";
  const selected = route === "assistant" || route === "survival" ? "profile" : route;
  const tabs = [["dashboard", "Dashboard", "home"], ["calendar", "Calendar", "calendar"], ["tasks", "Tasks", "tasks"], ["calm", "Calm", "calm"], ["profile", "Profile", "profile"]];
  let html = "";
  for (const t of tabs) {
    const on = selected === t[0];
    html += `<button class="${on ? "on" : ""}" onclick="goTab('${t[0]}')"><span class="tdot">${on ? "<span></span>" : ""}</span>${icon(t[2])}<span class="tlabel">${tr(t[1])}</span></button>`;
  }
  bar.innerHTML = html;
}

// snackbar, sheets, dialogs
function snack(text) {
  const root = document.getElementById("snackbar");
  if (!root) return;
  root.innerHTML = `<div class="snack">${text}</div>`;
  clearTimeout(snackTimer);
  snackTimer = setTimeout(() => { root.innerHTML = ""; }, 2800);
}

function openSheet(title, body) {
  document.getElementById("overlay").innerHTML = `
    <div class="scrim" onclick="if (event.target === this) closeOverlay()">
      <div class="sheet scroller"><span class="handle"></span><div class="title" style="font-size:21px;line-height:26px">${title}</div>${body}</div>
    </div>`;
}

function confirmDialog(title, text, okLabel, action) {
  dialogAction = action;
  document.getElementById("overlay").innerHTML = `
    <div class="scrim center" onclick="if (event.target === this) closeOverlay()">
      <div class="dialog">
        <div class="title" style="font-size:21px;line-height:26px">${title}</div>
        <p class="b-med ink2">${text}</p>
        <div class="row" style="justify-content:flex-end;gap:4px">
          <button class="textbtn" onclick="closeOverlay()">${tr("Cancel")}</button>
          <button class="textbtn" style="color:var(--error)" onclick="const a = dialogAction; closeOverlay(); a();">${okLabel}</button>
        </div>
      </div>
    </div>`;
}

function closeOverlay() {
  const o = document.getElementById("overlay");
  if (o) o.innerHTML = "";
}

// drag to scroll with the mouse, like a finger
let drag = null;
let dragged = false;
document.addEventListener("pointerdown", e => {
  dragged = false;
  if (e.pointerType !== "mouse" || e.button !== 0) return;
  if (!e.target.closest(".phone") || e.target.closest("input, textarea, select, .seek")) return;
  const box = e.target.closest(".scroller");
  if (box) drag = { box, y: e.clientY, top: box.scrollTop };
});
document.addEventListener("pointermove", e => {
  if (!drag) return;
  const dy = e.clientY - drag.y;
  if (Math.abs(dy) > 6) dragged = true;
  if (dragged) drag.box.scrollTop = drag.top - dy;
});
document.addEventListener("pointerup", () => { drag = null; });
// a drag should not also count as a tap
document.addEventListener("click", e => {
  if (dragged && e.target.closest(".phone")) {
    e.stopPropagation();
    e.preventDefault();
    dragged = false;
  }
}, true);

// Shared app components
function anyReminderOpen() {
  return !current.notif.dnd && Object.keys(current.reminders).some(k => current.notif[k].on && !current.reminders[k]);
}

// ScreenHeader: serif title, subtitle, optional back arrow and bell
function header(title, subtitle, withBack) {
  const backBtn = withBack ? `<button class="iconbtn" onclick="back()" aria-label="${tr("Back")}"><span class="circle">${icon("back")}</span></button>` : "";
  const bell = withBack ? "" : `<button class="iconbtn" onclick="go('survival')" aria-label="${tr("Reminders")}"><span class="circle">${icon("bell")}</span>${anyReminderOpen() ? '<span class="dot"></span>' : ""}</button>`;
  return `
    <div class="header">
      ${backBtn}
      <div class="grow" style="${withBack ? "padding-left:12px" : ""}"><div class="title">${title}</div>${subtitle ? `<div class="b-small muted">${subtitle}</div>` : ""}</div>
      ${bell}
    </div>`;
}

function sectionLabel(text, faded) {
  if (faded) return `<div class="section faded">${text}</div>`;
  return `<div class="section">${icon("leaf")}<span>${text}</span><span class="rule"></span></div>`;
}

function badge(diff) {
  const word = diff >= 4 ? "HARD" : diff === 3 ? "MEDIUM" : "EASY";
  return `<span class="badge ${word}">${tr(word)}</span>`;
}

// TaskRow.kt whenText()
function whenText(t) {
  const parts = [];
  if (!t.done && t.parts) {
    parts.push(t.todayPartDone ? tr("Today's part done") : tr("Part 1 of %1$d · %2$s today", t.parts, hoursLabel(t.partHours)));
    parts.push(lowerFirst(dueText(t.due)));
  } else if (!t.done && t.doDay !== undefined && t.doDay !== t.due) {
    parts.push(tr("Work on it %s", dayLabel(t.doDay)) + " · " + lowerFirst(dueText(t.due)));
  } else if (!t.done && t.due != null && t.due < 0) {
    parts.push(tr("Overdue · %s", lowerFirst(dueText(t.due))));
  } else {
    parts.push(dueText(t.due));
  }
  if (t.repeat === "daily") parts.push(tr("repeats daily"));
  if (t.repeat === "weekly") parts.push(tr("repeats weekly"));
  return parts.join(" · ");
}

// openable = tap opens the editor, otherwise tap just ticks it
function taskRow(t, openable) {
  const progress = !t.done && t.parts
    ? `<div class="tprog"><span class="track"><span style="width:${t.progress}%"></span></span><small>${tr("%d%% done", t.progress)}</small></div>` : "";
  const rowClick = openable ? `go('task', {id: ${t.id}})` : `tickTask(${t.id})`;
  return `
    <div class="task ${t.done ? "done" : ""}" onclick="${rowClick}">
      <button class="check" onclick="event.stopPropagation(); tickTask(${t.id})" aria-label="${esc(t.name)}"><span>${icon("check")}</span></button>
      <div class="grow"><div class="tname">${esc(t.name)}</div><div class="twhen" style="${t.due < 0 && !t.done ? "color:var(--error)" : ""}">${whenText(t)}</div>${progress}</div>
      ${badge(t.diff)}
    </div>`;
}

function taskGroup(list, openable) {
  return `<div class="group">${list.map(t => taskRow(t, openable)).join('<div class="sep"></div>')}</div>`;
}

function findTask(id) {
  return current.tasks.find(t => t.id === id);
}

function tickTask(id) {
  const t = findTask(id);
  if (t.parts && !t.done) {
    // FinishDialog: a big task asks which one is finished
    document.getElementById("overlay").innerHTML = `
      <div class="scrim center" onclick="if (event.target === this) closeOverlay()">
        <div class="dialog">
          <div class="title" style="font-size:21px;line-height:26px">${tr(t.todayPartDone ? "Today's part is done" : "What did you finish?")}</div>
          <p class="b-med ink2">${t.todayPartDone ? tr("\"%1$s\" is %2$d%% done. The rest is planned for the next days.", esc(t.name), t.progress)
            : tr("\"%s\" is split over a few days so it never piles up. Tick today's part, or the whole task if it's all finished.", esc(t.name))}</p>
          <button class="btn block" onclick="finishPart(${id})">${t.todayPartDone ? tr("Undo today's part") : tr("Today's %s", hoursLabel(t.partHours))}</button>
          <button class="btn ghost block" onclick="finishWhole(${id})">${tr("The whole task is finished")}</button>
          <button class="textbtn" onclick="closeOverlay()">${tr("Cancel")}</button>
        </div>
      </div>`;
    return;
  }
  t.done = !t.done;
  t.doneToday = t.done;
  if (t.done) {
    snack(tr("Nice work! Task done."));
    if (t.repeat) {
      const next = JSON.parse(JSON.stringify(t));
      next.id = current.nextId++;
      next.done = false;
      next.doneToday = false;
      next.due = (t.due || 0) + (t.repeat === "daily" ? 1 : 7);
      delete next.doDay;
      current.tasks.push(next);
    }
  }
  render();
}

function finishPart(id) {
  const t = findTask(id);
  const step = Math.round(100 / (t.parts + (t.todayPartDone ? 0 : 1)));
  if (t.todayPartDone) {
    t.todayPartDone = false;
    t.progress = Math.max(0, t.progress - step);
  } else {
    t.todayPartDone = true;
    t.progress = Math.min(100, t.progress + step);
    t.doneToday = true;
    snack(tr("Today's part is done. The rest is planned for the next days."));
  }
  if (t.progress >= 100) { t.done = true; t.doneToday = true; }
  render();
}

function finishWhole(id) {
  const t = findTask(id);
  t.done = true;
  t.doneToday = true;
  t.progress = 100;
  snack(tr("Nice work! Task done."));
  render();
}

function playCircle(size) {
  return `<span class="playcircle" style="width:${size}px;height:${size}px"><svg viewBox="0 0 24 24" style="width:${size * 0.38}px;height:${size * 0.38}px">${ICONS.play}</svg></span>`;
}

function chips(options, selected, onPick, multi) {
  return `<div class="chiprow">${options.map(o => {
    const on = multi ? selected.includes(o) : selected === o;
    return `<button class="chip ${on ? "on" : ""}" onclick="${onPick}'${o}')">${tr(o)}</button>`;
  }).join("")}</div>`;
}

// Dashboard (DashboardScreen.kt)
function dashboardScreen() {
  const p = current;
  const c = cycleInfo(p);
  let html = header(tr("Hi, %s", esc(p.first)), tr("Current phase: %s", tr(c.phase)));
  html += cycleRing(p, c);
  html += `<button class="btn ghost small center-self" onclick="goTab('calendar')">${icon("calendar")}${tr("View Calendar")}</button>`;
  if (c.inPeriod && c.day > p.periodLength + 3) {
    html += `<div class="card"><div class="t-small">${tr("Has your period ended?")}</div>
      <p class="b-small ink2" style="margin:4px 0 10px">${tr("It has been open for %d days, longer than usual. If it already stopped, mark its real first and last day so your predictions stay right.", c.day)}</p>
      <button class="btn block" onclick="go('log', {mode: 'mark'})">${icon("calendar")}${tr("Fix my period dates")}</button></div>`;
  }
  html += `
    <button class="quicklog" onclick="go('log', {date: 0})">
      <span class="plus">${icon("plus")}</span>
      <span class="grow"><span class="t-med" style="display:block">${tr("Log today")}</span><span class="b-small sub">${tr("Flow, symptoms & mood")}</span></span>
    </button>`;
  html += checkInCard();
  if (p.moves.length > 0) html += planChangedCard();
  html += `
    <div class="tiles">
      <button class="tile" onclick="goTab('tasks')"><span class="circle">${icon("tasks")}</span><span>${tr("Tasks")}</span></button>
      <button class="tile" onclick="go('task', {})"><span class="circle">${icon("plus")}</span><span>${tr("Add Task")}</span></button>
      <button class="tile" onclick="go('assistant')"><span class="circle">${icon("sparkles")}</span><span>${tr("Ask AI")}</span></button>
      <button class="tile" onclick="go('survival')"><span class="circle">${icon("bell")}</span><span>${tr("Reminders")}</span></button>
    </div>`;
  html += classesCard();
  // Lavender is the low-energy mode: forecast, stats and the task list step back
  if (!p.night) {
    html += forecastCard();
    html += statsLedger();
    html += todaysTasksCard();
  }
  html += focusTimerCard();
  if (p.night) {
    const today = todaysTasks();
    const focus = today.slice().sort((a, b) => b.diff - a.diff)[0];
    html += sectionLabel(tr("Today's Focus"));
    html += `<div class="card" style="padding:5px">${focus ? taskRow(focus) : `<span class="caption-serif" style="font-size:16px;padding:12px">${tr("All caught up")}</span>`}</div>`;
    html += sectionLabel(tr("Stats hidden in Lavender Mode"), true);
    html += sleepTrackCard();
  } else {
    html += `<div class="calmstrip" onclick="pickTrack(0); goTab('calm')">${playCircle(44)}<div><div class="t-small">${tr("Focus Track")} · 02:00</div><div class="b-small muted">${tr("Alpha-wave study music for deep focus")}</div></div></div>`;
  }
  return html;
}

// a thin ring with one dot per day of her own cycle
function cycleRing(p, c) {
  const size = 236, mid = size / 2, arcWidth = 5;
  const r = mid - arcWidth;
  const dotR = r - 12;
  const progress = Math.min(c.day, p.cycleLength) / p.cycleLength;
  const arc = c.inPeriod ? "var(--accent)" : "var(--primary)";
  let svg = `<circle cx="${mid}" cy="${mid}" r="${r}" fill="none" stroke="var(--inactive)" stroke-width="1"/>`;
  for (let i = 0; i < p.cycleLength; i++) {
    const a = (-90 + i * 360 / p.cycleLength) * Math.PI / 180;
    const passed = i < c.day;
    svg += `<circle cx="${mid + dotR * Math.cos(a)}" cy="${mid + dotR * Math.sin(a)}" r="${passed ? 1.8 : 1.3}" fill="${passed ? arc : "var(--inactive)"}"/>`;
  }
  const len = 2 * Math.PI * r;
  svg += `<circle cx="${mid}" cy="${mid}" r="${r}" fill="none" stroke="${arc}" stroke-width="${arcWidth}" stroke-linecap="round" stroke-dasharray="${len * progress} ${len}" transform="rotate(-90 ${mid} ${mid})"/>`;
  const end = (-90 + 360 * progress) * Math.PI / 180;
  const mx = mid + r * Math.cos(end), my = mid + r * Math.sin(end);
  svg += `<circle cx="${mx}" cy="${my}" r="7" fill="var(--bg)"/><circle cx="${mx}" cy="${my}" r="4" fill="var(--ink)"/>`;
  const ring = ringText(p, c);
  return `
    <div class="ring">
      <svg viewBox="0 0 ${size} ${size}">${svg}</svg>
      <div class="inside">
        <span class="overline">${ring.label}</span>
        <span class="big">${ring.number}</span>
        <span class="b-small muted">${ring.unit}</span>
        <span class="caption-serif phase">${tr(c.phase)}</span>
        <span class="muted" style="font-size:11px;line-height:17px;margin-top:4px">${tr("Next period ~ %s", shortDate(c.nextStart))}</span>
        <span class="overline" style="font-size:9px;margin-top:6px">${tr("ESTIMATED")}</span>
      </div>
    </div>`;
}

// daily check-in
const ENERGY = { 1: "Low", 2: "Okay", 3: "Great" };

function checkInCard() {
  const p = current;
  if (!editingCheckin) {
    return `
      <div class="card click" onclick="startCheckin()">
        <div class="row">
          ${moodMascot(p.checkin.mood, p.night, 56)}
          <div class="grow" style="padding-left:12px">
            <div class="t-small">${tr("Today you feel %s", tr(p.checkin.mood).toLowerCase())}</div>
            <div class="b-small ink2">${tr("Energy: %s", tr(ENERGY[p.checkin.energy]))}</div>
          </div>
          <span class="l-large deep" style="padding:8px">${tr("Change")}</span>
        </div>
      </div>`;
  }
  let moods = "";
  for (const m of MOODS) {
    moods += `<button class="pick ${m === draft.mood ? "on" : ""}" onclick="draft.mood = '${m}'; render()">${moodMascot(m, p.night, 40)}${tr(m)}</button>`;
  }
  let energy = "";
  for (const v of [1, 2, 3]) {
    let bars = "";
    for (let i = 0; i < 3; i++) bars += `<span class="${i < v ? "on" : ""}"></span>`;
    energy += `<button class="pick ${v === draft.energy ? "on" : ""}" onclick="draft.energy = ${v}; render()"><span class="battery">${bars}</span>${tr(ENERGY[v])}</button>`;
  }
  return `
    <div class="card">
      <div class="row">
        <div class="grow"><div class="t-med">${tr("How are you today?")}</div><div class="b-small ink2">${tr("Two taps. It helps Lumenstru plan your day.")}</div></div>
        ${moodMascot(draft.mood, p.night, 56)}
      </div>
      <div class="mood-grid">${moods}</div>
      <div class="t-small" style="margin:12px 0 6px">${tr("Energy")}</div>
      <div class="energy">${energy}</div>
      <div class="row" style="gap:10px;margin-top:12px">
        <button class="btn ghost" style="flex:1" onclick="editingCheckin = false; render()">${tr("Cancel")}</button>
        <button class="btn" style="flex:1" onclick="saveCheckin()">${tr("Save")}</button>
      </div>
    </div>`;
}

function startCheckin() {
  editingCheckin = true;
  draft = { mood: current.checkin.mood, energy: current.checkin.energy };
  render();
}

function saveCheckin() {
  current.checkin = draft;
  editingCheckin = false;
  updateStoryMood();
  rebalanceAll();   // a low-energy answer can move today's hard work
  snack(tr("Check-in saved."));
  render();
}

// plan changed card
function planChangedCard() {
  let rows = "";
  for (const m of current.moves) {
    rows += `
      <div class="move">
        <div class="grow">
          <div class="t-small name">${esc(m.name)}</div>
          <div class="b-small ink2">${tr("Due %s", shortDate(dateAt(m.due)))}</div>
          <div class="b-small muted">${m.reason}</div>
        </div>
        <span class="l-large dopill">${tr("Do %s", dayLabel(m.to))}</span>
      </div>`;
  }
  return `
    <div class="plan">
      <div class="t-small deep">${tr("Today's plan changed")}</div>
      <div class="b-small ink2" style="margin-top:2px">${tr("Lumenstru moved hard work to days with more energy and fewer classes.")}</div>
      ${rows}
      <div class="row" style="margin-top:8px">
        <span class="b-small deep grow">${tr("Don’t like a change? Undo it.")}</span>
        <button class="textbtn" onclick="undoMoves()">${tr("Undo")}</button>
      </div>
    </div>`;
}

function undoMoves() {
  for (const m of current.moves) {
    const t = findTask(m.taskId);
    if (t) {
      t.doDay = m.from;
      t.keepPlan = true;   // the rebalance leaves it alone from now on
    }
  }
  current.moves = [];
  snack(tr("Plan change undone."));
  render();
}

// today's classes
function classRows(list) {
  return list.map(k => `
    <div class="class-row">
      <div class="time"><b>${timeLabel(k.start)}</b><span class="b-small muted">${tr("to %s", timeLabel(k.end))}</span></div>
      <div class="grow">
        <div class="b-med" style="font-weight:600">${esc(k.name)}</div>
        ${k.place ? `<div class="b-small muted">${esc(k.place)}</div>` : ""}
        ${k.note ? `<div class="b-small deep">${tr("Note: %s", esc(k.note))}</div>` : ""}
      </div>
    </div>`).join('<div class="hairline"></div>');
}

function classesCard() {
  const today = classesOn(current, TODAY.getDay());
  return `
    <div class="card">
      <div class="row">
        <span class="overline grow" style="color:var(--ink2)">${tr("TODAY'S CLASSES")}</span>
        <button class="btn ghost small" onclick="go('timetable')">${icon("timetable")}${tr("Open timetable")}</button>
      </div>
      <div style="padding-top:6px">${today.length ? classRows(today)
        : `<p class="b-small ink2">${tr("No classes today. Add your weekly classes once and get an alarm before each one.")}</p>`}</div>
    </div>`;
}

// study forecast
function forecastDays() {
  const p = current;
  const days = [];
  for (let i = 0; i < 7; i++) {
    const due = p.tasks.filter(t => !t.done && t.due === i);
    const energy = energyAt(p, i);
    days.push({ offset: i, energy, period: isPeriodDay(p, i), due, clash: energy === 1 && due.some(t => t.diff >= 4) });
  }
  return days;
}

const BAR_COLOURS = { 3: "var(--primary)", 2: "color-mix(in srgb, var(--primary) 55%, transparent)", 1: "color-mix(in srgb, var(--primary) 28%, transparent)" };

function forecastCard() {
  const days = forecastDays();
  const letters = tr("M T W T F S S").split(" ");
  let bars = "";
  for (const d of days) {
    const colour = d.period ? "var(--accent)" : BAR_COLOURS[d.energy];
    const letter = letters[(dateAt(d.offset).getDay() + 6) % 7];
    let dot = "";
    if (d.clash) dot = '<span class="clash"></span>';
    else if (d.due.length) dot = "<span></span>";
    bars += `
      <button class="fbar ${d.offset === selectedBar ? "sel" : ""} ${d.offset === 0 ? "today" : ""}" onclick="selectedBar = ${d.offset}; render()" aria-label="${dayName(d.offset)}">
        <span class="slot"><span class="pill" style="height:${[0, 22, 46, 72][d.energy]}px;background:${colour}"></span></span>
        <span class="letter">${letter}</span><span class="under"></span><span class="dl">${dot}</span>
      </button>`;
  }
  const d = days[selectedBar];
  const words = { 1: "Low", 2: "Medium", 3: "High" };
  const which = d.offset === 0 ? tr("Today") : dateAt(d.offset).toLocaleDateString(LOCALES[lang], { weekday: "long" });
  let say = tr("%1$s: %2$s energy.", which, tr(words[d.energy]).toLowerCase());
  if (d.period) say += tr(" It is a period day.");
  const mins = classMinutes(current, d.offset);
  if (mins >= 300) say += tr(" Busy day: %s of classes.", hoursText(mins));
  else if (mins > 0) say += tr(" %s of classes.", hoursText(mins));
  if (d.due.length) say += tr(" Due: %s.", d.due.map(t => esc(t.name)).join(", "));
  return `
    <div class="card">
      <div class="row"><span class="t-med grow">${tr("Study Forecast")}</span><span class="b-small muted">${tr("next 7 days")}</span></div>
      <div class="bars">${bars}</div>
      <p class="b-med" style="margin-top:10px;color:${d.clash ? "var(--accent-deep)" : "var(--ink2)"}">${say}</p>
      <div class="legend">
        <span><i style="background:${BAR_COLOURS[3]}"></i>${tr("High")}</span>
        <span><i style="background:${BAR_COLOURS[2]}"></i>${tr("Medium")}</span>
        <span><i style="background:${BAR_COLOURS[1]}"></i>${tr("Low")}</span>
        <span><i style="background:var(--accent)"></i>${tr("Period")}</span>
        <span><i class="dot" style="background:var(--ink)"></i>${tr("Deadline")}</span>
      </div>
      <div class="tip">${forecastTip(days)}</div>
      <p class="muted" style="font-size:11px;line-height:17px;margin-top:6px">${tr("Based on your own check-ins and finished tasks.")}</p>
    </div>`;
}

// the advice line, same rules as the app
function forecastTip(days) {
  const clash = days.find(d => d.clash);
  if (clash) {
    const name = esc(clash.due.find(t => t.diff >= 4).name);
    const before = days.filter(d => d.offset < clash.offset);
    const good = before.filter(d => d.energy === 3).pop() || before.filter(d => d.energy === 2).pop();
    if (good) return tr("\"%1$s\" is due %2$s, which is a low energy day. Try to finish it by %3$s, when your energy is better. Lumenstru plans it for that day for you.", name, dayLabel(clash.offset), dayLabel(good.offset));
    return tr("\"%1$s\" is due %2$s, which is a low energy day. Start early and keep each session short.", name, dayLabel(clash.offset));
  }
  const c = cycleInfo(current);
  if (days[0].energy === 3) return tr("Today is a high energy day. It is a good time for your hardest task.");
  if (c.nextOffset >= 1 && c.nextOffset <= 5) return tr("Your period is expected around %s. Try to get bigger tasks done before then.", shortDate(c.nextStart));
  if (days[0].energy === 1) return tr("Today looks like a low energy day. Stick to lighter tasks and rest when you need to.");
  return tr("Today is a steady day. Try one harder task and a few lighter ones.");
}

// stats + tasks
function statsLedger() {
  const p = current;
  const due = todaysTasks().length;
  const done = doneToday().length;
  const score = due + done ? Math.round(done / (due + done) * 100) : p.focus.score;
  return `
    <div>
      <div class="ledger">
        <div class="stat"><b>${due}</b><span>${tr("Tasks due").toUpperCase()}</span></div><div class="vline"></div>
        <div class="stat"><b>${done}</b><span>${tr("Done today").toUpperCase()}</span></div><div class="vline"></div>
        <div class="stat"><b>${p.tasks.filter(t => !t.done).length}</b><span>${tr("Open tasks").toUpperCase()}</span></div>
      </div>
      <div class="row b-small ink2" style="justify-content:space-between;padding-top:10px">
        <span>${tr("Focus score  %s", score + "%")}</span><span>${tr("%d-day streak", p.focus.streak)}</span>
      </div>
    </div>`;
}

function todaysTasksCard() {
  const list = todaysTasks().concat(doneToday());
  const shown = list.slice(0, 3);
  const more = list.length - shown.length;
  return `
    <div>
      <div class="title" style="font-size:22px;line-height:26px;margin-bottom:10px">${tr("Today's tasks")}</div>
      ${shown.length ? taskGroup(shown) : `<p class="b-med muted">${tr("Nothing due today")}</p>`}
      ${more > 0 ? `<button class="textbtn" onclick="goTab('tasks')">${tr("+%d more in Tasks", more)}</button>` : ""}
    </div>`;
}

// focus timer
const TIMER_MODES = { "Classic": [25, 5], "Cramp-safe": [15, 10] };
let timer = { mode: "Classic", phase: "focus", left: 25 * 60, running: false, sessions: 0, id: null };

function resetTimer(fresh) {
  clearInterval(timer.id);
  timer.running = false;
  timer.phase = "focus";
  if (fresh) {
    timer.mode = current && cycleInfo(current).inPeriod ? "Cramp-safe" : "Classic";
    timer.sessions = 0;
  }
  timer.left = TIMER_MODES[timer.mode][0] * 60;
}

function focusTimerCard() {
  const [focusMin, breakMin] = TIMER_MODES[timer.mode];
  const total = (timer.phase === "focus" ? focusMin : breakMin) * 60;
  const passed = 1 - timer.left / total;
  const onBreak = timer.phase === "break";
  const arc = onBreak ? "color-mix(in srgb, var(--primary) 45%, transparent)" : "var(--primary)";
  const mid = 104;
  let ticks = "";
  for (let i = 0; i < 60; i++) {
    const a = (-90 + i * 6) * Math.PI / 180;
    const lit = i < Math.floor(passed * 60);
    const inner = i % 5 === 0 ? 90 : 94;   // every 5th tick is longer, like a watch
    ticks += `<line x1="${mid + inner * Math.cos(a)}" y1="${mid + inner * Math.sin(a)}" x2="${mid + 102 * Math.cos(a)}" y2="${mid + 102 * Math.sin(a)}" stroke="${lit ? arc : "var(--inactive)"}" stroke-width="${lit ? 2 : 1}" stroke-linecap="round"/>`;
  }
  const h = (-90 + 360 * passed) * Math.PI / 180;
  ticks += `<circle cx="${mid + 80 * Math.cos(h)}" cy="${mid + 80 * Math.sin(h)}" r="3" fill="${arc}"/>`;
  let modes = "";
  for (const m of Object.keys(TIMER_MODES)) {
    modes += `<button class="${m === timer.mode ? "on" : ""}" onclick="chooseMode('${m}')">${tr(m)}</button>`;
  }
  let sets = "";
  for (let i = 0; i < 4; i++) sets += `<span class="${i < timer.sessions % 4 ? "on" : ""}"></span>`;
  let line = "";
  if (timer.mode === "Cramp-safe") line = `<p class="script">${tr(onBreak ? "Break idea: %s" : "Shorter focus, longer breaks. Easier on period days.", tr("Lie down with a warm pack for a few minutes."))}</p>`;
  return `
    <div class="card" style="padding:20px">
      <div class="row"><span class="overline grow">${tr("FOCUS TIMER")}</span><div class="modeswitch">${modes}</div></div>
      <div class="fring">
        <svg viewBox="0 0 208 208">${ticks}</svg>
        <div class="inside">
          <span class="overline deep">${tr(onBreak ? "BREAK" : "FOCUS")}</span>
          <span class="clock" id="clock">${clock(timer.left)}</span>
          <span class="l-small muted">${tr("%1$d / %2$d min", focusMin, breakMin)}</span>
        </div>
      </div>
      <div class="sets">${sets}</div>
      <div class="controls">
        <button class="textbtn" onclick="resetTimer(); render()">${tr("Reset")}</button>
        <button class="bigplay" onclick="toggleTimer()" aria-label="${tr(timer.running ? "Pause timer" : "Start timer")}">${icon(timer.running ? "pause" : "play")}</button>
        <button class="textbtn" onclick="skipPhase()">${tr(onBreak ? "Skip break" : "Skip")}</button>
      </div>
      ${line}
    </div>`;
}

function chooseMode(m) {
  timer.mode = m;
  resetTimer();
  render();
}

function skipPhase() {
  if (timer.phase === "focus") {
    timer.sessions++;
    timer.phase = "break";
    timer.left = TIMER_MODES[timer.mode][1] * 60;
  } else {
    timer.phase = "focus";
    timer.left = TIMER_MODES[timer.mode][0] * 60;
  }
  render();
}

function toggleTimer() {
  if (timer.running) {
    clearInterval(timer.id);
    timer.running = false;
  } else {
    timer.running = true;
    timer.id = setInterval(() => {
      timer.left--;
      if (timer.left <= 0) {
        snack(tr(timer.phase === "focus" ? "Focus session done. Time for a break." : "Break over. Ready for the next focus session?"));
        skipPhase();
        return;
      }
      // only redraw when nothing is open on top (a dialog or sheet)
      if (route === "dashboard" && !editingCheckin && !document.getElementById("overlay").innerHTML) render();
    }, 1000);
  }
  render();
}

// lavender sleep card
function sleepTrackCard() {
  const r = 87;
  const len = 2 * Math.PI * r;
  return `
    <div class="card click" style="padding:22px" onclick="pickTrack(2); goTab('calm')">
      <div class="sleepring">
        <svg class="rings" viewBox="0 0 180 180">
          <circle cx="90" cy="90" r="${r}" fill="none" stroke="var(--inactive)" stroke-width="1"/>
          <circle cx="90" cy="90" r="${r * 0.78}" fill="none" stroke="var(--inactive)" stroke-width="1"/>
          <circle cx="90" cy="90" r="${r}" fill="none" stroke="var(--primary)" stroke-width="3" stroke-linecap="round" stroke-dasharray="${len * 250 / 360} ${len}" transform="rotate(-90 90 90)"/>
        </svg>
        ${playCircle(56)}
      </div>
      <p class="b-small muted" style="text-align:center;margin-top:14px">${tr("Sleep Track")} · 02:00 · ${tr("Soft music for sleep")}</p>
    </div>`;
}

// Calendar (CalendarScreen.kt)
function monthGrid(first, cellFor) {
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  let grid = tr("M T W T F S S").split(" ").map(d => `<span class="dow">${d}</span>`).join("");
  const blanks = (first.getDay() + 6) % 7;   // Monday first
  for (let i = 0; i < blanks; i++) grid += "<span></span>";
  for (let n = 1; n <= days; n++) grid += cellFor(n, offsetOf(new Date(first.getFullYear(), first.getMonth(), n)));
  return `<div class="month">${grid}</div>`;
}

function monthTitle(first) {
  return first.toLocaleDateString(LOCALES[lang], { month: "long", year: "numeric" });
}

function calendarScreen() {
  const p = current;
  const first = new Date(TODAY.getFullYear(), TODAY.getMonth() + monthShift, 1);
  const grid = monthGrid(first, (n, offset) => {
    const kind = periodKind(p, offset);
    let cls = "cell";
    if (kind === "logged") cls += " period";
    else if (kind === "expected") cls += " predicted";
    if (offset === 0) cls += " today";
    if (offset === selectedDay) cls += " sel";
    const dot = p.logs[offset] || p.tasks.some(t => t.due === offset);
    return `<button class="${cls}" onclick="selectedDay = ${offset}; render()">${n}${dot ? '<span class="tdot"></span>' : ""}</button>`;
  });
  const future = selectedDay > 0;
  return header(tr("Calendar"), tr("Plan around your energy")) + `
    <div class="card">
      <div class="monthnav">
        <button class="navarrow" onclick="monthShift--; render()" aria-label="${tr("Previous month")}">‹</button>
        <h4>${monthTitle(first)}</h4>
        <button class="navarrow" onclick="monthShift++; render()" aria-label="${tr("Next month")}">›</button>
      </div>
      ${grid}
      <div class="clegend">
        <span><i style="background:var(--accent)"></i>${tr("Period day")}</span>
        <span><i style="background:var(--accent-light)"></i>${tr("Expected")}</span>
        <span><i class="dot" style="background:var(--primary-deep)"></i>${tr("Logged / tasks")}</span>
      </div>
      ${monthShift !== 0 ? `<button class="btn ghost small" style="margin-top:8px;align-self:flex-start" onclick="monthShift = 0; selectedDay = 0; render()">${tr("Back to today")}</button>` : ""}
    </div>
    ${sectionLabel(tr("Add a period"))}
    <p class="b-small muted">${tr("Pick a day on the calendar and log it, or mark the dates of an earlier period.")}</p>
    <button class="btn block" ${future ? "disabled" : ""} onclick="go('log', {date: ${selectedDay}})">${icon("strawberry")}${future ? tr("Can't log a future day") : tr("Log period for %s", shortDate(dateAt(selectedDay)))}</button>
    <button class="btn ghost block" onclick="go('log', {mode: 'mark'})">${icon("calendar")}${tr("Mark previous dates")}</button>
    ${dayDetails()}`;
}

function dayDetails() {
  const p = current;
  const off = selectedDay;
  const cd = cycleDayAt(p, off);
  const words = { 1: " · Low energy day", 2: " · Medium energy day", 3: " · High energy day" };
  const title = dateAt(off).toLocaleDateString(LOCALES[lang], { month: "long", day: "numeric" }) + tr(words[energyAt(p, off)]);
  const kind = periodKind(p, off);
  let notice;
  if (off > 0) {
    const period = kind !== "";
    notice = noticeCard(period ? tr("Period expected") : tr("%s phase (expected)", tr(phaseAt(p, off))),
      tr("Cycle day %d. A prediction from your own cycle, so it may move a little.", cd) + (period ? tr(" Maybe skip white clothes today, just in case.") : ""),
      !period, "calendar");
  } else if (kind === "logged") {
    notice = noticeCard(tr("Period day"), tr(off === 0 ? "Your period is in progress today." : "You were on your period on this date."), false, "strawberry");
  } else {
    notice = noticeCard(tr("%s phase", tr(phaseAt(p, off))), tr("Cycle day %d (estimated).", cd), true, "leaf");
  }
  const log = p.logs[off];
  const logLine = log ? `<div class="notice positive"><span class="ico">${icon("edit")}</span><div class="grow"><div class="t-small">${tr("Logged")}</div>
    <div class="b-small muted">${[log.flow && tr(log.flow), log.severity && tr(log.severity), ...log.symptoms.map(tr), log.mood && tr(log.mood)].filter(Boolean).join(" · ")}</div></div></div>` : "";
  const exam = p.exam && p.exam.due === off ? noticeCard(esc(p.exam.name), tr("Revision is already split into parts before this day."), true, "sparkles") : "";
  const tasks = p.tasks.filter(t => t.due === off);
  return `
    ${sectionLabel(title)}
    ${notice}${logLine}${exam}
    <div class="t-small" style="padding-top:4px">${tr("Tasks due")}</div>
    ${tasks.length ? taskGroup(tasks, true) : `<p class="b-med muted" style="padding:6px 0">${tr("Nothing planned")}</p>`}`;
}

function noticeCard(title, text, positive, ico) {
  return `
    <div class="notice ${positive ? "positive" : ""}">
      <span class="ico">${icon(ico)}</span>
      <div class="grow"><div class="t-small">${title}</div><div class="b-small muted">${text}</div></div>
    </div>`;
}

// Tasks (TasksScreen.kt)
function tasksScreen() {
  const p = current;
  const open = p.tasks.filter(t => !t.done);
  const done = p.tasks.filter(t => t.done);

  // coming up: tasks on their work day, plus the later parts of big tasks
  // (one row per day for a week, then one "+N more parts" row)
  const items = [];
  for (const t of open) {
    if (t.parts) {
      const last = Math.min(t.parts - 1, t.due - 1);
      for (let k = 1; k <= Math.min(last, 7); k++) {
        items.push({ day: k, order: 1, row: partRow(t, hoursLabel(t.partHours), tr("Part %1$d of %2$d", k + 1, t.parts) + " · " + lowerFirst(dueText(t.due))) });
      }
      if (last > 7) {
        const more = last - 7;
        const text = more === 1 ? tr("1 more part (%1$s) until %2$s", hoursLabel(t.partHours), shortDate(dateAt(last)))
          : tr("%1$d more parts (%2$s) until %3$s", more, hoursLabel(t.partHours), shortDate(dateAt(last)));
        items.push({ day: 7, order: 2, row: partRow(t, "+" + more, text + " · " + lowerFirst(dueText(t.due))) });
      }
    } else if (t.due == null) {
      items.push({ day: 999, order: 0, row: taskRow(t, true) });
    } else if (workDay(t) > 0) {
      items.push({ day: workDay(t), order: 0, row: taskRow(t, true) });
    }
  }
  items.sort((a, b) => a.day - b.day || a.order - b.order);

  let coming = "";
  for (let i = 0; i < items.length; i++) {
    if (i === 0 || items[i].day !== items[i - 1].day) {
      if (i > 0) coming += "</div>";
      coming += `<div class="dayhead">${dayHeading(items[i].day)}</div><div class="group">`;
    } else {
      coming += '<div class="sep"></div>';
    }
    coming += items[i].row;
  }
  if (items.length) coming += "</div>";
  else coming = `<p class="b-med muted">${tr("Nothing coming up")}</p>`;

  const today = todaysTasks();
  return header(tr("Tasks"), tr("Tap a task to change it or log progress")) + `
    <button class="btn block" onclick="go('task', {})">${icon("plus")}${tr("Add a task")}</button>
    ${sectionLabel(tr("Today"))}
    ${today.length ? taskGroup(today, true) : `<p class="b-med muted">${tr("Nothing due today")}</p>`}
    ${sectionLabel(tr("Coming up"))}
    ${coming}
    ${done.length ? `<button class="textbtn" style="align-self:flex-start" onclick="showDone = !showDone; render()">${showDone ? tr("Hide done tasks") : tr("Show done tasks (%d)", done.length)}</button>` : ""}
    ${showDone && done.length ? taskGroup(done, true) : ""}
    <button class="btn ghost block" onclick="go('exam')">${icon("sparkles")}${tr("Got an exam? Plan your revision")}</button>`;
}

function dayHeading(offset) {
  if (offset === 999) return tr("No due date");
  if (offset === 1) return tr("Tomorrow");
  return dateAt(offset).toLocaleDateString(LOCALES[lang], { weekday: "short", month: "short", day: "numeric" }).replace(",", "");
}

function partRow(t, left, line) {
  return `<div class="partrow" onclick="go('task', {id: ${t.id}})"><span class="hrs">${left}</span><div class="grow"><div class="tname">${esc(t.name)}</div><div class="twhen">${line}</div></div></div>`;
}

// Start
window.addEventListener("load", () => {
  // index.html#zara opens Zara's phone straight away
  const first = PROFILES.find(p => "#" + p.id === location.hash);
  if (first) openProfile(first.id);
  else showHome();
});
