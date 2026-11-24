// AI assistant - copied from Assistant.kt in the app
// not a real AI model, just keywords:
// clean up the message, score every topic by matching patterns,
// best score wins (ties go to whichever is first), then fill in her data
// other languages use the keywords_xxx lists in the language packs

const DEFAULT_SUGGESTIONS = [
  "Suggest a focus task",
  "How can I manage my energy today?",
  "Tips to improve my sleep",
  "I'm feeling stressed",
];

// [id, patterns, replies, suggestions, weight]
const INTENTS = [
  ["safety", [/\b(suicid\w*|kill myself|end my life|self[- ]?harm|hurt myself|want to die|don'?t want to live)\b/],
    ["I'm really sorry you're feeling this way, {name}. You deserve support right now from a real person. If you might be in danger, please contact your local emergency number straight away. You can also reach a crisis line in your country, or talk to someone you trust today. You don't have to go through this alone"],
    ["I'm feeling stressed", "Open a breathing exercise"], 10],
  ["medical", [/\b(doctor|gp|heavy bleeding|very heavy|clots?|irregular|missed (my )?period|late period|pregnan\w*|contracepti\w*|the pill|birth control|medication|medicine|ibuprofen|painkillers?|endometriosis|pcos|infection|fever|dizzy|faint\w*)\b/],
    ["I can share general wellbeing tips, but I'm not a medical professional and can't give medical advice. If something feels unusual for you. Very heavy bleeding, pain that stops you doing daily things, a missed or very irregular period, fever or dizziness. Please speak to a doctor or pharmacist. In the meantime, logging your days in Log Period gives you a clear record to show them.",
      "That's a question for a doctor or pharmacist, {name}. I can't give medical advice. What I can do is help you keep a clear record: log your flow, symptoms and mood each day in Log Period, so you have the details ready for an appointment."],
    ["How do I log my period?", "Tips for cramps", "I'm feeling stressed"], 2],
  ["greeting", [/^(hi|hey|hello|hiya|yo|heyy+|good (morning|afternoon|evening))\b/],
    ["Hi {name}! {phaseLine} What would you like help with today?",
      "Hello {name} {phaseLine} I can help with tasks, energy, sleep, stress or using Lumenstru."],
    DEFAULT_SUGGESTIONS, 1],
  ["thanks", [/\b(thanks?|thank you|thx|ty|appreciate (it|you))\b/],
    ["You're welcome, {name} I'm here whenever you need me.", "Anytime! Small steps count. You are doing well."],
    DEFAULT_SUGGESTIONS, 1],
  ["focus_task", [/\bsuggest (a )?(focus )?task\b/, /\bwhat should i (do|work on|start)\b/, /\bfocus task\b/, /\bwhere (do|should) i start\b/],
    ["{focusLine}"],
    ["How can I manage my energy today?", "Help me plan my day", "How do I stay focused?"], 2],
  ["forecast", [/\b(forecast|rebalance|best day|when should i study|which day|this week)\b/],
    ["{forecastLine}"],
    ["Help me plan my day", "Suggest a focus task", "What phase am I in?"], 2],
  ["cramps", [/\b(cramps?|cramping|period pain|stomach (pain|ache)|back ?ache|pelvic pain|pain)\b/],
    ["Cramps can be really draining. Gentle things that help many people: a warm heat pack or hot water bottle on your tummy or lower back, a warm drink, light stretching or a slow walk, and resting when you can. If pain is severe or stops you doing daily things, please check in with a doctor. Want me to suggest a low-energy task instead of a hard one today?",
      "I'm sorry you're hurting, {name}. Try warmth on your lower tummy, slow breathing, staying hydrated and giving yourself permission to do less. Calm Space has a Stretch tool that is gentle enough for cramp days. Pain that is unusually strong is worth a doctor's opinion."],
    ["Suggest a focus task", "Open a breathing exercise", "How do I log symptoms?"], 1],
  ["symptoms", [/\b(symptoms?|bloat\w*|headaches?|migraines?|cravings?|nause\w*|acne|breakouts?|sore|tender)\b/],
    ["Symptoms are easier to understand once you track them. In Log Period you can record cramps, fatigue, headache, bloating, mood swings and cravings for each day, along with how severe they felt. Over time you'll see your own pattern. For bloating and headaches, water, regular meals and rest often help. And anything severe is worth a doctor's view.",
      "Tracking helps here: open Log Period and tick the symptoms you have today with a severity. General comfort tips. Drink water, eat regular balanced meals, rest your eyes from screens, and go easy on yourself. {phaseLine}"],
    ["How do I log my period?", "Tips for cramps", "How can I manage my energy today?"], 1],
  ["period_log", [/\b(log|record|track|start|end|stop|finish)\w* (my |a |the )?period\b/, /\bhow do i (log|track|record)\b/, /\bperiod (started|ended|is over|came)\b/],
    ["To log your period, tap Log today on the Dashboard. Today is selected for you. Choose your flow, severity, symptoms and mood, then tap Submit & Start Period. On later days the button becomes Save Today's Info, and on your last day switch on End Period and tap Save & End Period. To add an earlier period, use Mark previous dates on the Calendar."],
    ["What phase am I in?", "How does the Calendar work?", "Tips for cramps"], 2],
  ["period", [/\b(period|menstrua\w*|bleeding|flow|spotting|pms|tampons?|pads?)\b/],
    ["{periodLine}"],
    ["How do I log my period?", "Tips for cramps", "What phase am I in?"], 1],
  ["cycle", [/\b(cycle|phase|follicular|ovulat\w*|luteal|cycle day|what day)\b/],
    ["{cycleLine}"],
    ["How can I manage my energy today?", "How do I log my period?", "Suggest a focus task"], 1],
  ["stress", [/\b(stress\w*|overwhelm\w*|anxious|anxiety|panic\w*|worried|worry|nervous|on edge|freaking out|too much)\b/],
    ["I hear you, {name}. Let's take one slow breath together: in for 4, hold for 4, out for 6. When you're ready, pick just ONE small thing to do next. Not the whole list. Calm Space has a Breathing tool if you'd like a minute to reset.",
      "Feeling stressed is a sign you're carrying a lot. Try this: write down everything on your mind, then circle only what truly has to happen today. Everything else can wait. A short walk or a glass of water can help too. You're doing better than you think",
      "That sounds heavy. Try the 5-4-3-2-1 grounding exercise: notice 5 things you can see, 4 you can feel, 3 you can hear, 2 you can smell and 1 you can taste. Then open Calm Space for some quiet audio. If stress or anxiety keeps getting in the way of daily life, talking to someone you trust or a professional can really help."],
    ["Open a breathing exercise", "Help me plan my day", "Tips to improve my sleep"], 1],
  ["mood", [/\b(mood|moody|sad|feeling (down|low|blue)|upset|irritab\w*|irritated|angry|emotional|crying|cry|lonely|grumpy)\b/],
    ["Thank you for telling me, {name}. Moods really can shift across the cycle, and it's okay to have heavier days. Be kind to yourself: something comforting, a little rest, and one small win. You can record your mood in Log Period to spot your own patterns over time.",
      "Low days happen, and they pass. Try one tiny thing that usually lifts you. Music, fresh air, a message to a friend, a warm drink. Lavender Mode keeps the app calmer on days like this. If low moods last for weeks, please talk to someone you trust or a professional"],
    ["I'm feeling stressed", "Ideas for self-care", "Tips to improve my sleep"], 1],
  ["sleep", [/\b(sleep\w*|insomnia|can'?t sleep|bed ?time|nap\w*|wake up|waking up|night)\b/],
    ["Try a gentle wind-down routine: dim the lights an hour before bed, put your phone away, sip something warm and caffeine-free, and keep the same bedtime each night. Calm Space has a Sleep track made for drifting off",
      "For better sleep: keep your room cool and dark, avoid caffeine after early afternoon, and if your mind is busy, write tomorrow's to-do list before bed so it is out of your head. A slow breathing exercise from Calm Space can help you settle."],
    ["Open a breathing exercise", "I'm feeling stressed", "How can I manage my energy today?"], 1],
  ["energy", [/\b(energy|energi\w*|tired|exhausted|drained|fatigue\w*|sleepy|no energy|low energy|burn(ed|t)? ?out|burnout)\b/],
    ["{energyLine}"],
    ["Suggest a focus task", "Tips to improve my sleep", "Ideas for self-care"], 1],
  ["hydration", [/\b(water|hydrat\w*|thirsty|drink\w*|dehydrat\w*)\b/],
    ["Staying hydrated really helps energy, focus and headaches. Keep a bottle within reach and take a few sips each time you finish a task. Your Hydration Reminder in the Survival Suite nudges you every day.",
      "A glass of water is one of the quickest ways to feel a little better. Try pairing it with something you already do. Every break, every meal. The Survival Suite will remind you, and you can switch the reminder on or off in Notification Settings."],
    ["How do reminders work?", "Ideas for self-care", "How can I manage my energy today?"], 1],
  ["breaks", [/\b(breaks?|rest|resting|pause|time off|relax\w*)\b/],
    ["Breaks make you more productive, not less. A simple rhythm: 25 minutes of focus, then 5 minutes away from the screen. Stretch, refill your water, look out of a window. After four rounds, take a longer break. Your Rest Reminder is there to nudge you.",
      "Rest is part of the plan, {name}. Step away for a few minutes, move your body, and come back to one task at a time. Calm Space has short Breathing, Meditation and Stretch tools for quick resets."],
    ["How do I stay focused?", "Open a breathing exercise", "Help me plan my day"], 1],
  ["focus", [/\b(focus\w*|concentrat\w*|distract\w*|attention|procrastinat\w*|keep getting distracted|zone out)\b/],
    ["To focus: choose ONE task, put your phone face-down, and set a 25-minute timer. Break the task into a first step so small it feels easy. \"open the document\", \"write one sentence\". Starting is the hardest part. {focusHint}",
      "Distraction often means the task feels too big. Shrink it: what's the very next action? Clear your desk, close extra tabs, and play the Focus track in Calm Space as a signal to your brain that it's work time. {focusHint}"],
    ["Suggest a focus task", "How should I take breaks?", "Tips for studying"], 1],
  ["study", [/\b(study\w*|exams?|revis\w*|homework|assignments?|lectures?|notes|coursework|essay|test|quiz|uni|university|school|college)\b/],
    ["{studyLine}"],
    ["How do I stay focused?", "Help me plan my day", "I'm feeling stressed"], 1],
  ["motivation", [/\b(motivat\w*|unmotivated|lazy|can'?t start|cannot start|give up|no drive|stuck|don'?t feel like)\b/],
    ["Motivation usually follows action, not the other way round. Try the two-minute rule: start something for just two minutes. Often you'll keep going. And if not, two minutes still counts. {streakLine}",
      "Be gentle with yourself, {name}. Pick the smallest task on your list and do only that. Ticking it off gives you a little momentum for the next one. {streakLine}"],
    ["Suggest a focus task", "Help me plan my day", "How do I stay focused?"], 1],
  ["planning", [/\b(plan\w*|schedul\w*|organi[sz]\w*|priorit\w*|to-?do list|my day|my week|timetable)\b/],
    ["{planLine}"],
    ["Suggest a focus task", "How do I add a task?", "How can I manage my energy today?"], 1],
  ["tasks_help", [/\b(add|create|new|edit|delete|remove|complete|finish|tick)\w* (a |my )?tasks?\b/, /\bhow do (i|tasks)\b.*\btasks?\b/],
    ["To add a task, tap Add a task on the Tasks screen or Add Task on the Dashboard. Give it a name, a difficulty from 1 to 5 and an optional due date and hours. A task over 2 hours is split into parts, and each part shows on its day under Coming up. Tap a task to edit it or log progress, and tap its tick box when you finish. Completing at least one task a day builds your streak."],
    ["Suggest a focus task", "Help me plan my day", "How does the streak work?"], 2],
  ["tasks", [/\b(tasks?|to ?dos?|chores|workload|deadlines?)\b/],
    ["{tasksLine}"],
    ["Suggest a focus task", "How do I add a task?", "Help me plan my day"], 1],
  ["productivity", [/\b(productiv\w*|get things done|efficient|work harder|achieve|output)\b/],
    ["{energyLine}"],
    ["Suggest a focus task", "How do I stay focused?", "Help me plan my day"], 1],
  ["selfcare", [/\b(self[- ]?care|treat myself|pamper|comfort|look after myself|be kind to myself|me time)\b/],
    ["A few gentle self-care ideas: a warm shower or bath, a cosy drink, your favourite playlist, five minutes of stretching, an early night, or a short walk outside. Pick one and give yourself permission to enjoy it",
      "Self-care can be small: drink a glass of water, eat something nourishing, step outside for fresh air, or switch on Lavender Mode for a calmer app. Calm Space is always there for a quiet moment."],
    ["Tips to improve my sleep", "Open a breathing exercise", "I'm feeling stressed"], 1],
  ["food", [/\b(eat\w*|food|snacks?|meals?|diet|hungry|iron|chocolate|caffeine|coffee)\b/],
    ["Regular balanced meals help keep energy steady: some protein, whole grains, fruit and vegetables. During a period, iron-rich foods (leafy greens, beans, lentils) and plenty of water can help. Cravings are normal. Enjoy a treat without guilt. For specific dietary needs, a doctor or dietitian is the best guide."],
    ["How can I manage my energy today?", "Tips for cramps", "Ideas for self-care"], 1],
  ["breathing", [/\b(breath\w*|meditat\w*|calm down|calm space|music|audio|tracks?|sounds?)\b/],
    ["Open Calm Space from the bottom bar. Tap the mascot to play or pause, and choose Focus, Relaxation or Sleep. Under Tools you'll find Breathing (in for 4, hold for 4, out for 6), Meditation and Stretch. Each takes about a minute."],
    ["I'm feeling stressed", "Tips to improve my sleep", "How should I take breaks?"], 1],
  ["exercise", [/\b(exercis\w*|workout|work out|gym|walk\w*|run\w*|yoga|stretch\w*|move my body)\b/],
    ["{exerciseLine}"],
    ["Open a breathing exercise", "How can I manage my energy today?", "Ideas for self-care"], 1],
  ["reminders", [/\b(reminders?|notifications?|survival suite|nudges?|alerts?|do not disturb|dnd)\b/],
    ["The Survival Suite (the bell icon, or Reminders on the Dashboard) has three daily nudges: Hydration, Rest and Tasks. Their words change with your day. Your phase, your energy and the deadlines coming up. Tap the button on a reminder to resolve it; it moves to History and comes back tomorrow. In Notification Settings you can change each one's time, switch it off or turn on Do Not Disturb."],
    ["How can I manage my energy today?", "How does the Calendar work?", "What can you do?"], 1],
  ["calendar", [/\b(calendar|month|dates?|highlight\w*)\b/],
    ["The Calendar shows one month at a time. Use the arrows to move between months. Period days are highlighted, and expected period days are shown too. Tapping a day shows its phase, its cycle day, its expected energy and the tasks due that day. Under Add a period you can log the day you picked, or use Mark previous dates for an earlier period."],
    ["How do I log my period?", "What phase am I in?", "How do I add a task?"], 1],
  ["dashboard", [/\b(dashboard|home screen|main screen|hero)\b/],
    ["The Dashboard is your daily hub. It shows your cycle day and phase, the Study Forecast for the next 7 days, today's tasks, your focus score and your streak, plus shortcuts to Tasks, Add Task, Ask AI and Reminders. In Lavender Mode it hides the statistics and shows one gentle focus task instead."],
    ["How does the streak work?", "What is Lavender Mode?", "Suggest a focus task"], 1],
  ["streak", [/\b(streak|score|focus score|stats|statistics)\b/],
    ["Your streak counts the days in a row on which you completed at least one task. Today still counts while it is in progress, so you have until midnight. Your focus score is the share of today's tasks that are done. {streakLine}"],
    ["Suggest a focus task", "How do I add a task?", "How do I stay motivated?"], 1],
  ["theme", [/\b(lavender|matcha|theme|dark mode|light mode|colou?rs?)\b/],
    ["Lumenstru has two looks: Matcha (Strawberry × Matcha) for full-focus days, and Lavender (Lavender Night) for softer, quieter days. Lavender switches on automatically when you start a period and Matcha comes back when it ends. You can switch any time in Profile or App Settings."],
    ["How do I log my period?", "What can you do?", "Ideas for self-care"], 1],
  ["account", [/\b(account|profile|username|password|log ?out|sign ?out|log ?in|sign ?in|email|google|settings?|backup|back up|drive)\b/],
    ["Signing in is optional. Without an account your data stays on this phone, and Android backs it up to your Google account. In Profile you can sign in with Google or email to keep a copy in your account, save or restore a backup file, change your name, theme, language and notifications, or erase your data and start again."],
    ["What is Lavender Mode?", "How do reminders work?", "What can you do?"], 1],
  ["about", [/\b(who are you|what are you|what can you do|help me|how does this app|what is lumenstru|lumenstru|are you (an? )?(ai|bot|robot|human))\b/],
    ["I'm the Lumenstru Assistant. A rule-based helper, not a human and not a medical professional. I can suggest a focus task from your real list, explain your cycle phase and energy forecast, give tips for energy, sleep, stress, studying and self-care, and show you how to use the Dashboard, Calendar, Tasks, Log Period, Survival Suite and Calm Space."],
    DEFAULT_SUGGESTIONS, 1],
];

const FALLBACKS = [
  "I'm not sure I understood that, {name}. I can help with your tasks, energy, sleep, stress, studying, your cycle, or how to use Lumenstru. Try one of the suggestions below",
  "Hmm, I don't have an answer for that one yet. Try asking about your focus task, your cycle phase, sleep, stress or how a part of the app works.",
];

// context lines

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function tasksDue(n, today) {
  if (n === 1) return tr(today ? "You have 1 task due today." : "You have 1 task due.");
  return tr(today ? "You have %d tasks due today." : "You have %d tasks due.", n);
}

function phaseAdvice(phase) {
  if (phase === "Menstrual") return tr("During your period many people have lower energy, so it's a good time for lighter tasks, rest and comfort.");
  if (phase === "Follicular") return tr("After a period, energy often rises. A good time for harder tasks, new topics and planning.");
  if (phase === "Ovulatory") return tr("Around ovulation energy and confidence are often at their highest. Great for presentations, group work and your hardest study.");
  return tr("In the Luteal phase energy often dips towards the end. Steady revision, tidying notes and smaller tasks work well.");
}

function phaseLine(c) {
  if (c.cycle.inPeriod) return tr("You're on Day %d. Your period is in progress, so go gently.", c.cycle.day);
  return tr("You're on Day %1$d, in your %2$s phase.", c.cycle.day, tr(c.cycle.phase));
}

function focusLine(c) {
  const t = c.focusTask;
  if (!t) return tr("You don't have any open tasks right now. Lovely! Add one from the Dashboard when something comes up, or use the time to rest");
  const due = t.due != null ? " (" + lowerFirst(dueText(t.due)) + ")" : "";
  let why;
  if (c.energy === 1) why = "It fits a gentler day. Take it slowly and stop when you need to.";
  else if (t.diff >= 4 && c.energy === 3) why = "It needs high energy, and today is one of your high-energy days. A great time to tackle it.";
  else why = "It's a good next step to build momentum.";
  return tr("Try \"%1$s\"%2$s.", t.name, due) + " " + tr(why);
}

function periodLine(c) {
  if (c.cycle.inPeriod) {
    return tr("Your period is in progress. Today is Day %d. Keep logging each day's flow, symptoms and mood in Log Period, and switch on End Period on your last day. Be gentle with yourself: lighter tasks, warmth and rest are all good choices.", c.cycle.day);
  }
  return tr("Your last period started on %1$s. You're on Day %2$d of your cycle.", longDate(c.cycle.start), c.cycle.day) +
    " " + tr("Your next period is expected around %s.", shortDate(c.cycle.nextStart)) + " " + tr("When it starts, tap Log Period on the Dashboard.");
}

function cycleLine(c) {
  return tr("You're on Day %1$d (estimated), in your %2$s phase.", c.cycle.day, tr(c.cycle.phase)) + " " +
    phaseAdvice(c.cycle.phase) + " " +
    tr("I expect your next cycle to be about %d days, learned from your own logs.", c.cycleLength) + " " +
    tr("These are estimates, not medical predictions.");
}

function energyLine(c) {
  const due = c.dueToday > 0 ? tasksDue(c.dueToday, false) + " " + tr("Pick just the most important one.")
    : tr("Nothing is due today, so it could be a good day to get ahead.");
  const phase = tr(c.cycle.phase);
  if (c.energy === 1) {
    const calm = tr(c.night ? "Lavender Mode is keeping the app calm today." : "Switching to Lavender Mode in Profile makes the app calmer if you like.");
    return tr("Today looks like a lower-energy day (%1$s phase, Day %2$d). Put the low-energy tasks first, take more breaks, keep water nearby and don't push through pain.", phase, c.cycle.day) + " " + calm + " " + due;
  }
  if (c.energy === 3) {
    return tr("You're in your %1$s phase (Day %2$d). Energy often runs higher now. Tackle your hardest task first while you're fresh, then switch to lighter work.", phase, c.cycle.day) + " " + due;
  }
  return tr("Today is a medium-energy day (%1$s phase, Day %2$d). Mix one harder task with a few lighter ones and take regular breaks.", phase, c.cycle.day) + " " + due;
}

function forecastLine() {
  const days = forecastDays();
  const best = days.filter(d => d.energy === 3).slice(0, 3).map(d => dayName(d.offset)).join(", ");
  const bestLine = best ? " " + tr("Your best study days coming up: %s.", best) : "";
  return forecastTip(days) + bestLine + " " +
    tr("The Study Forecast on your Dashboard shows the next 7 days, and Lumenstru automatically moves hard tasks off low-energy days for you.");
}

function studyLine(c) {
  const phase = tr(c.energy === 1
    ? "Today is a lower-energy day, so use shorter sessions (around 20 minutes) and gentler revision such as re-reading notes or flashcards."
    : "This is a good time for focused, demanding study. Tackle the hardest topic first.");
  return tr("Study tips: break topics into small chunks, test yourself instead of just re-reading, and study in 25-minute blocks with 5-minute breaks.") +
    " " + phase + " " + tr("Add each assignment as a task with a due date so it shows up on your Dashboard, Calendar and Study Forecast.");
}

function planLine(c) {
  const due = c.dueToday > 0 ? tasksDue(c.dueToday, true) : tr("Nothing is due today.");
  const phase = tr(c.energy === 1 ? "Keep the plan light today: one or two essential tasks, plus rest."
    : "Put your most demanding task in the morning, when energy is usually highest.");
  return due + " " + tr("A simple plan: choose up to three priorities, give each a time, and leave space for breaks.") +
    " " + phase + " " + tr("The Today section on the Tasks screen shows exactly what's due.");
}

function tasksLine(c) {
  if (!c.focusTask) return tr("Your task list is clear right now. Add tasks from the Dashboard or the Tasks screen. Give each one a difficulty and a due date, and I'll help you choose what to do first.");
  const due = c.dueToday > 0 ? tasksDue(c.dueToday, true) : tr("You have no tasks due today.");
  return due + " " + tr("My suggestion for what to do next is \"%s\". Hard tasks are planned on your high-energy days automatically.", c.focusTask.name);
}

function exerciseLine(c) {
  return tr(c.energy === 1
    ? "On lower-energy days, gentle movement such as walking, stretching or easy yoga can ease cramps and lift your mood. Listen to your body and rest when you need to. Try the Stretch tool in Calm Space."
    : "Movement is great for energy and focus. Even a 10-minute walk or a quick stretch between study sessions helps. If you feel energetic, this can be a good time for a more active workout.");
}

function streakLine(c) {
  if (c.streak === 0) return tr("Complete one task today to start a streak");
  return tr("You're on a %d-day streak. Keep it going", c.streak);
}

function fill(template, c) {
  let text = tr(template);
  const lines = {
    "{focusLine}": focusLine, "{periodLine}": periodLine, "{cycleLine}": cycleLine, "{energyLine}": energyLine,
    "{forecastLine}": forecastLine, "{studyLine}": studyLine, "{planLine}": planLine, "{tasksLine}": tasksLine,
    "{exerciseLine}": exerciseLine,
  };
  for (const key in lines) {
    if (text.includes(key)) text = text.replace(key, lines[key](c));
  }
  text = text.replace("{phaseLine}", phaseLine(c))
    .replace("{focusHint}", c.focusTask ? tr("A good one to start with: \"%s\".", c.focusTask.name) : "")
    .replace("{streakLine}", streakLine(c))
    .split("{name}").join(c.name);
  return text.replace(/\s{2,}/g, " ").trim();
}

// the engine

function normalise(message) {
  return message.toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9' -]+/g, " ").replace(/\s+/g, " ").trim();
}

// a tapped suggestion chip shows translated text, so turn it back into English
function toEnglish(text) {
  if (lang === "en") return text;
  const pack = LANGS[lang];
  for (const key in pack) if (pack[key] === text) return key;
  return text;
}

function localKeywords(id) {
  const key = "keywords_" + id;
  const words = tr(key);
  if (words === key) return [];
  return words.split(",").map(w => w.trim().toLowerCase()).filter(w => w);
}

function detect(message) {
  const english = toEnglish(message.trim());
  const text = normalise(english);
  const raw = english.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const intent of INTENTS) {
    const [id, patterns, , , weight] = intent;
    const matches = patterns.filter(p => p.test(text)).length + localKeywords(id).filter(w => raw.includes(w)).length;
    const score = matches * weight;
    if (score > bestScore) {
      best = intent;
      bestScore = score;
    }
  }
  return best;
}

function assistantContext() {
  const today = todaysTasks();
  const focus = today.slice().sort((a, b) => b.diff - a.diff)[0] || current.tasks.filter(t => !t.done)[0] || null;
  return {
    name: current.first,
    cycle: cycleInfo(current),
    cycleLength: current.cycleLength,
    energy: energyAt(current, 0),
    focusTask: focus,
    dueToday: today.length,
    streak: current.focus.streak,
    night: current.night,
  };
}

// returns { text, suggestions }
function assistantReply(message) {
  const c = assistantContext();
  const intent = detect(message);
  if (!intent) return { text: fill(pick(FALLBACKS), c), suggestions: DEFAULT_SUGGESTIONS };
  return { text: fill(pick(intent[2]), c), suggestions: intent[3] };
}

function assistantGreeting() {
  const c = assistantContext();
  return (tr("Hi %s. I'm here to support you.", c.name) + " " + phaseLine(c) + " " +
    tr("Ask me about tasks, energy, or how you're feeling.")).replace(/\s{2,}/g, " ");
}
