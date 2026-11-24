// all the other screens: calm, profile, assistant, reminders, timetable,
// insights, log period, task editor, exam mode, settings + the little sheets

// Calm Space (CalmScreen.kt)
// music is made in the browser with web audio: a slightly different tone in each ear
// (needs headphones), similar to the app's tracks
const CALM_TRACKS = [
  { title: "Focus Track", text: "Alpha-wave study music for deep focus", left: 200, right: 210, pad: [261.6, 329.6, 392] },
  { title: "Relaxation Track", text: "174 Hz relaxing tones for cramp comfort", left: 174, right: 178, pad: [174, 261.6] },
  { title: "Sleep Track", text: "Soft music for sleep", left: 100, right: 102, pad: [130.8, 196] },
];
let calm = { track: 0, playing: false, pos: 0, id: null, audio: null, nodes: [] };

function startSound() {
  const t = CALM_TRACKS[calm.track];
  if (!calm.audio) calm.audio = new (window.AudioContext || window.webkitAudioContext)();
  const ctx = calm.audio;
  ctx.resume();
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 2);   // 2 s fade in
  master.connect(ctx.destination);
  const tone = (freq, pan, level) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = level;
    panner.pan.value = pan;
    osc.connect(gain).connect(panner).connect(master);
    osc.start();
    calm.nodes.push(osc);
  };
  tone(t.left, -1, 0.5);
  tone(t.right, 1, 0.5);
  t.pad.forEach(f => tone(f, 0, 0.12));
  calm.nodes.push(master);
}

function stopSound() {
  if (!calm.audio) return;
  const ctx = calm.audio;
  const nodes = calm.nodes;
  calm.nodes = [];
  const master = nodes[nodes.length - 1];
  if (master) master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
  setTimeout(() => nodes.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch (e) { /* already stopped */ } }), 700);
}

function stopSounds() {
  clearInterval(timer.id);
  timer.running = false;
  clearInterval(calm.id);
  if (calm.playing) stopSound();
  calm.playing = false;
}

function toggleCalm() {
  calm.playing = !calm.playing;
  clearInterval(calm.id);
  if (calm.playing) {
    startSound();
    calm.id = setInterval(() => {
      calm.pos = (calm.pos + 1) % 120;
      const pos = document.getElementById("calm-pos");
      if (pos) {
        const f = calm.pos / 120 * 100;
        pos.textContent = clock(calm.pos);
        document.getElementById("calm-bar").style.width = f + "%";
        document.getElementById("calm-handle").style.left = f + "%";
      }
    }, 1000);
  } else {
    stopSound();
  }
  render();
}

function pickTrack(i) {
  const wasPlaying = calm.playing;
  if (wasPlaying) toggleCalm();
  calm.track = i;
  calm.pos = 0;
}

function selectTrack(i) {
  pickTrack(i);
  toggleCalm();
}

function seekCalm(e) {
  const box = e.currentTarget.getBoundingClientRect();
  calm.pos = Math.max(0, Math.min(119, Math.round((e.clientX - box.left) / box.width * 120)));
  render();
}

function calmScreen() {
  const t = CALM_TRACKS[calm.track];
  const f = calm.pos / 120 * 100;
  let tracks = "";
  CALM_TRACKS.forEach((tr2, i) => {
    if (i > 0) tracks += '<div class="hairline" style="margin-left:52px"></div>';
    const on = calm.playing && calm.track === i;
    tracks += `
      <div class="trackrow" onclick="${on ? "toggleCalm()" : `selectTrack(${i})`}">
        <span class="sym">${on ? "❚❚" : "▶"}</span>
        <div class="grow"><div class="t-small" style="color:${i === calm.track ? "var(--primary-deep)" : "var(--ink)"}">${tr(tr2.title)}</div><div class="b-small muted">02:00</div></div>
      </div>`;
  });
  return header(tr("Calm Space"), tr("A tiny pause for you")) + `
    <div class="card" style="padding:20px;align-items:center;text-align:center">
      <button class="spin ${calm.playing ? "playing" : ""}" onclick="toggleCalm()" aria-label="${tr(calm.playing ? "Pause %s" : "Play %s", tr(t.title))}">${mascot(current.night, 120)}</button>
      <span class="l-med deep" style="font-weight:700;margin-top:14px">${tr(calm.playing ? "Now Playing" : "Paused")}</span>
      <span class="title" style="font-size:22px;line-height:28px;margin-top:2px">${tr(t.title)}</span>
      <span class="b-small muted">${tr(t.text)}</span>
      <span class="l-small deep" style="margin-top:4px">${tr("Use headphones for a better experience")}</span>
      <div class="row l-small" style="width:100%;justify-content:space-between;margin-top:14px">
        <span class="muted" id="calm-pos">${clock(calm.pos)}</span><span class="deep" style="font-weight:700">${tr("Calm session")}</span><span class="muted">02:00</span>
      </div>
      <div class="seek" style="width:100%" onclick="seekCalm(event)">
        <span class="track"><span id="calm-bar" style="width:${f}%"></span></span>
        <span class="handle" id="calm-handle" style="left:${f}%"></span>
      </div>
      <span class="b-small muted" style="margin-top:10px">${tr(calm.playing ? "Tap the mascot to pause" : "Tap the mascot to begin")}</span>
    </div>
    ${sectionLabel(tr("Quick Relax"))}
    <div class="group">${tracks}</div>
    ${sectionLabel(tr("Tools"))}
    <div class="tiles" style="gap:9px">
      <button class="tile" onclick="openTool('Breathing')"><span class="circle">${icon("wind")}</span><span>${tr("Breathing")}</span></button>
      <button class="tile" onclick="openTool('Meditation')"><span class="circle">${icon("moon")}</span><span>${tr("Meditation")}</span></button>
      <button class="tile" onclick="openTool('Stretch')"><span class="circle">${icon("heart")}</span><span>${tr("Stretch")}</span></button>
    </div>`;
}

// the 3 calm tools, same as CalmTools.kt in the app
// breathing = 5 rounds of in 4 / hold 4 / out 6
// meditation = pick 1-10 min, prompt changes every 30 s
// stretch = 5 moves with a little stick figure
const BREATH = [["Breathe in", 4], ["Hold", 4], ["Breathe out", 6]];
const ROUNDS = 5;

const PROMPTS = [
  "Close your eyes. Let your shoulders drop.",
  "Notice five things you can hear.",
  "Feel where your body touches the chair or floor.",
  "Breathe in slowly… and let it go.",
  "Notice three things you can smell or taste.",
  "If a thought comes, let it float past like a cloud.",
  "Soften your jaw and the space between your eyes.",
  "Feel the warmth of your hands.",
  "Think of one small thing you're grateful for.",
  "Come back gently. Wiggle your fingers and toes.",
];

// arm angles in degrees (90 = down, 0 = right, 180 = left, -90 = up)
const MOVES = [
  { name: "Neck tilt", how: "Slowly tilt your ear towards one shoulder, then the other.", seconds: 30,
    from: { left: 120, right: 60, lean: 0, head: -16 }, to: { left: 120, right: 60, lean: 0, head: 16 } },
  { name: "Shoulder rolls", how: "Roll your shoulders up, back and down. Slow circles.", seconds: 30,
    from: { left: 120, right: 60, lean: 0, head: 0 }, to: { left: 135, right: 45, lean: 0, head: 0 } },
  { name: "Reach up", how: "Reach both arms up high. Breathe in and grow tall.", seconds: 30,
    from: { left: 120, right: 60, lean: 0, head: 0 }, to: { left: -105, right: -75, lean: 0, head: 0 } },
  { name: "Side bend", how: "Arms up, then lean gently to one side, then the other.", seconds: 40,
    from: { left: -90, right: -50, lean: -12, head: 0 }, to: { left: -130, right: -90, lean: 12, head: 0 } },
  { name: "Gentle twist", how: "Hands on hips, turn your upper body slowly side to side.", seconds: 40,
    from: { left: 160, right: 20, lean: 0, head: 0 }, to: { left: 200, right: 60, lean: 0, head: 0 } },
];

let tool = null;       // the tool that's open
let toolClock = null;  // 1 s tick
let poseFrame = null;  // stick figure animation

function openTool(name) {
  stopTool();
  tool = { name, running: false, started: false, finished: false };
  if (name === "Breathing") Object.assign(tool, { round: 0, step: 0, left: BREATH[0][1] });
  if (name === "Meditation") Object.assign(tool, { minutes: "3", total: 0, left: 0 });
  if (name === "Stretch") Object.assign(tool, { index: 0, left: MOVES[0].seconds });
  openSheet(tr(name), '<div id="tool-body" class="toolbody"></div>');
  drawTool();
}

function stopTool() {
  clearInterval(toolClock);
  cancelAnimationFrame(poseFrame);
  toolClock = null;
}

function closeTool() {
  stopTool();
  tool = null;
  closeOverlay();
}

function toggleTool() {
  tool.started = true;
  tool.running = !tool.running;
  stopTool();
  if (tool.running) toolClock = setInterval(tickTool, 1000);
  drawTool();
}

function tickTool() {
  // sheet got closed some other way
  if (!document.getElementById("tool-body")) { stopTool(); return; }
  const t = tool;
  if (t.name === "Breathing") {
    if (t.left > 1) t.left--;
    else if (t.step < BREATH.length - 1) { t.step++; t.left = BREATH[t.step][1]; }
    else if (t.round < ROUNDS - 1) { t.round++; t.step = 0; t.left = BREATH[0][1]; }
    else finishTool("breathing", 1);
  } else if (t.name === "Meditation") {
    t.left--;
    if (t.left <= 0) finishTool("meditation", t.total / 60);
  } else {
    if (t.left > 1) t.left--;
    else nextMove();
  }
  drawTool();
}

function finishTool(type, minutes) {
  stopTool();
  tool.running = false;
  tool.finished = true;
  // saved like the app's CalmLog, shows up in Insights
  current.calmLog = current.calmLog || [];
  current.calmLog.push({ type, minutes: Math.max(1, Math.round(minutes)) });
}

function nextMove() {
  if (tool.index < MOVES.length - 1) {
    tool.index++;
    tool.left = MOVES[tool.index].seconds;
  } else {
    finishTool("stretch", MOVES.reduce((s, m) => s + m.seconds, 0) / 60);
  }
  drawTool();
}

function stepDots(total, now) {
  let html = "";
  for (let i = 0; i < total; i++) html += `<span class="${i < now ? "on" : i === now ? "now" : ""}"></span>`;
  return `<div class="stepdots">${html}</div>`;
}

function mmss(s) {
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

function drawTool() {
  const box = document.getElementById("tool-body");
  if (!box || !tool) return;
  const t = tool;
  if (t.finished) {
    const text = t.name === "Breathing" ? tr("Five slow rounds. Your body has had a real pause")
      : t.name === "Stretch" ? tr("Five gentle moves done. Your body says thank you")
      : t.minutes === "1" ? tr("1 minute of quiet, just for you") : tr("%s minutes of quiet, just for you", t.minutes);
    box.innerHTML = `<div style="align-self:center">${moodMascot("Happy", current.night, 90)}</div>
      <div class="title" style="font-size:24px;text-align:center">${tr("Well done")}</div>
      <p class="b-med ink2" style="text-align:center">${text}</p>
      <button class="btn block" onclick="closeTool()">${tr("Done")}</button>`;
    return;
  }
  if (t.name === "Breathing") drawBreathing(box);
  else if (t.name === "Meditation") drawMeditation(box);
  else drawStretch(box);
}

// circle size for a step, 0.45 small to 1 full
function breathSize(step, sec) {
  if (step === 0) return 0.45 + 0.55 * sec / 4;
  if (step === 1) return 1;
  return 1 - 0.55 * sec / 6;
}

function drawBreathing(box) {
  const t = tool;
  const [label, seconds] = BREATH[t.step];
  const done = seconds - t.left;   // seconds gone in this step
  const now = t.started ? breathSize(t.step, done) : 0.45;
  const next = t.running ? breathSize(t.step, done + 1) : now;
  box.innerHTML = `
    <div class="breathe">
      <span class="halo" style="transform:scale(${now})"></span>
      <span class="core" style="transform:scale(${now})"></span>
      <div class="breathe-text"><div class="title" style="font-size:22px">${tr(t.running ? label : "Ready?")}</div>${t.running ? `<b>${t.left}</b>` : ""}</div>
    </div>
    <p class="b-small ink2" style="text-align:center">${tr("Round %1$d of %2$d · in 4, hold 4, out 6", t.round + 1, ROUNDS)}</p>
    ${stepDots(ROUNDS, t.round)}
    <div class="row" style="gap:10px">
      <button class="btn" style="flex:1" onclick="toggleTool()">${tr(t.running ? "Pause" : t.started ? "Resume" : "Start")}</button>
      <button class="btn ghost" style="flex:1" onclick="closeTool()">${tr("Close")}</button>
    </div>`;
  // grow / shrink smoothly over the next second
  requestAnimationFrame(() => requestAnimationFrame(() => {
    box.querySelectorAll(".breathe .halo, .breathe .core").forEach(c => c.style.transform = `scale(${next})`);
  }));
}

function drawMeditation(box) {
  const t = tool;
  if (t.total === 0) {
    // pick how long first
    box.innerHTML = `
      <div style="align-self:center">${moodMascot("Calm", current.night, 90)}</div>
      <p class="t-med" style="text-align:center">${tr("How long would you like?")}</p>
      <div class="chiprow" style="justify-content:center">${["1", "3", "5", "10"].map(m =>
        `<button class="chip ${m === t.minutes ? "on" : ""}" onclick="tool.minutes = '${m}'; drawTool()">${m}</button>`).join("")}</div>
      <p class="b-small ink2" style="text-align:center">${tr("minutes")}</p>
      <button class="btn block" onclick="tool.total = tool.left = Number(tool.minutes) * 60; toggleTool()">${tr("Begin")}</button>`;
    return;
  }
  const r = 95;
  const len = 2 * Math.PI * r;
  const passed = 1 - t.left / t.total;
  const prompt = PROMPTS[Math.min(PROMPTS.length - 1, Math.floor((t.total - t.left) / 30))];
  box.innerHTML = `
    <div class="medring">
      <svg viewBox="0 0 210 210">
        <circle cx="105" cy="105" r="${r}" fill="none" stroke="var(--inactive)" stroke-width="10"/>
        <circle cx="105" cy="105" r="${r}" fill="none" stroke="var(--primary)" stroke-width="10" stroke-linecap="round"
          stroke-dasharray="${len * passed} ${len}" transform="rotate(-90 105 105)" style="transition:stroke-dasharray 1s linear"/>
      </svg>
      <span class="glow"></span>
      <b>${mmss(t.left)}</b>
    </div>
    <p class="b-med" style="text-align:center;font-size:15px;line-height:22px">${tr(prompt)}</p>
    <div class="row" style="gap:10px">
      <button class="btn" style="flex:1" onclick="toggleTool()">${tr(t.running ? "Pause" : "Resume")}</button>
      <button class="btn ghost" style="flex:1" onclick="closeTool()">${tr("Close")}</button>
    </div>`;
}

function drawStretch(box) {
  const t = tool;
  const move = MOVES[t.index];
  const r = 89;
  const len = 2 * Math.PI * r;
  const progress = 1 - t.left / move.seconds;
  box.innerHTML = `
    ${stepDots(MOVES.length, t.index)}
    <div class="title" style="font-size:22px;text-align:center">${tr(move.name)}</div>
    <svg class="figure" viewBox="0 0 190 190" aria-label="${tr(move.name)}">
      <circle cx="95" cy="95" r="${r}" fill="none" stroke="var(--inactive)" stroke-width="6"/>
      <circle cx="95" cy="95" r="${r}" fill="none" stroke="var(--primary)" stroke-width="6" stroke-linecap="round"
        stroke-dasharray="${len * progress} ${len}" transform="rotate(-90 95 95)"/>
      <g id="stick">${stickFigure(move.from)}</g>
    </svg>
    <b class="title" style="font-size:26px;text-align:center;font-family:var(--sans);font-weight:700">${mmss(t.left)}</b>
    <p class="b-med ink2" style="text-align:center;font-size:15px;line-height:22px">${tr(move.how)}</p>
    <div class="row" style="gap:10px">
      <button class="btn" style="flex:1" onclick="toggleTool()">${tr(t.running ? "Pause" : t.started ? "Resume" : "Start")}</button>
      <button class="btn ghost" style="flex:1" onclick="nextMove()">${tr(t.index < MOVES.length - 1 ? "Next move" : "Finish")}</button>
    </div>
    <button class="btn ghost block" onclick="closeTool()">${tr("Close")}</button>`;
  if (t.running) animateFigure();
}

// figure goes back and forth between the 2 poses (2.5 s each way)
function animateFigure() {
  cancelAnimationFrame(poseFrame);
  const loop = time => {
    const g = document.getElementById("stick");
    if (!g || !tool || !tool.running) return;
    const move = MOVES[tool.index];
    const k = (1 - Math.cos(time / 2500 * Math.PI)) / 2;
    const pose = {};
    for (const key in move.from) pose[key] = move.from[key] + (move.to[key] - move.from[key]) * k;
    g.innerHTML = stickFigure(pose);
    poseFrame = requestAnimationFrame(loop);
  };
  poseFrame = requestAnimationFrame(loop);
}

function stickFigure(pose) {
  const rad = d => d * Math.PI / 180;
  const hips = [95, 118];
  const shoulders = [95 + 52 * Math.sin(rad(pose.lean)), 118 - 52 * Math.cos(rad(pose.lean))];
  const tilt = rad(pose.lean + pose.head);
  const head = [shoulders[0] + 20 * Math.sin(tilt), shoulders[1] - 20 * Math.cos(tilt)];
  const arm = a => [shoulders[0] + 38 * Math.cos(rad(a)), shoulders[1] + 38 * Math.sin(rad(a))];
  const line = (a, b, colour) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${colour}" stroke-width="6" stroke-linecap="round"/>`;
  return line(hips, shoulders, "var(--ink)") + line(hips, [77, 160], "var(--ink)") + line(hips, [113, 160], "var(--ink)") +
    line(shoulders, arm(pose.left), "var(--primary)") + line(shoulders, arm(pose.right), "var(--primary)") +
    `<circle cx="${head[0]}" cy="${head[1]}" r="13" fill="var(--ink)"/>`;
}

// Profile (ProfileScreen.kt)
function settingRow(label, ico, trailing, onclick) {
  return `<button class="srow" onclick="${onclick}">${icon(ico)}<span class="grow">${label}</span>${trailing}</button>`;
}
const CHEV = '<span class="chev">›</span>';

function profileScreen() {
  const p = current;
  const langName = LANGUAGE_NAMES.find(l => l[0] === lang)[1];
  const account = p.account
    ? `<div class="b-med ink2">${tr("Signed in as %s", esc(p.account))}</div>
       <div class="b-small muted">${tr("Every change is saved to your account.")}</div>
       <button class="btn ghost block" style="margin-top:14px" onclick="current.account = null; snack(tr('Signed out')); render()">${tr("Sign out")}</button>`
    : `<div class="b-med ink2">${tr("Not signed in. Your data is saved on this phone only.")}</div>
       <div class="b-small muted">${tr("Sign in to save it to your account and get it back on a new phone.")}</div>
       <button class="btn block" style="margin-top:14px" onclick="signInSheet()">${tr("Sign in")}</button>`;
  return header(tr("Profile"), tr("Make Lumenstru feel like yours")) + `
    <div class="row" style="gap:16px;padding:6px 0">
      ${mascot(p.night, 72)}
      <div class="grow"><div class="title">${esc(p.first)}</div><div class="b-small ink2">${tr(p.account ? "Saved to your account" : "Saved on this phone")}</div></div>
      <button class="iconbtn" onclick="editNameSheet()" aria-label="${tr("Edit name")}"><span class="circle">${icon("edit")}</span></button>
    </div>
    <div class="sgroup">
      ${settingRow(tr("My Cycle & Insights"), "heart", CHEV, "go('insights')")}<div class="sep"></div>
      ${settingRow(tr("Class Timetable"), "timetable", CHEV, "go('timetable')")}<div class="sep"></div>
      ${settingRow(tr("Reminders"), "tasks", CHEV, "go('survival')")}<div class="sep"></div>
      ${settingRow(tr("Notification Settings"), "bell", CHEV, "go('notifications')")}<div class="sep"></div>
      ${settingRow(tr("App Settings"), "wind", CHEV, "go('settings')")}
    </div>
    <div class="sgroup">
      ${settingRow(tr("Lavender (dark) mode"), "moon", `<span class="switch ${p.night ? "on" : ""}"></span>`, "setNight(!current.night); render()")}<div class="sep"></div>
      ${settingRow(tr("Language"), "sparkles", `<span class="b-small ink2">${langName}</span>&nbsp;&nbsp;${CHEV}`, "languageSheet()")}<div class="sep"></div>
      ${settingRow(tr("Help & Support"), "help", CHEV, "helpSheet()")}<div class="sep"></div>
      ${settingRow(tr("About"), "info", CHEV, "aboutSheet()")}
    </div>
    ${sectionLabel(tr("Account"))}
    <div class="card">${account}</div>
    ${sectionLabel(tr("Backup"))}
    <div class="card" style="gap:10px">
      <p class="b-small ink2">${tr("Android backs up your Lumenstru data to your Google account automatically, and brings it back when you install the app again.")}</p>
      <p class="b-small ink2">${tr("You can also keep your own copy as a file, e.g. in Downloads or Google Drive.")}</p>
      <button class="btn block" onclick="saveBackup()">${icon("download")}${tr("Save a backup file")}</button>
      <button class="btn ghost block" onclick="document.getElementById('restore-file').click()">${tr("Restore from a backup file")}</button>
      <input type="file" id="restore-file" accept=".json,application/json" hidden onchange="restoreBackup(this.files[0])">
    </div>
    <button class="btn ghost block" onclick="eraseData()">${icon("door")}${tr("Erase my data")}</button>`;
}

function languageSheet() {
  let rows = "";
  for (const [code, name] of LANGUAGE_NAMES) {
    rows += settingRow(name, "sparkles", code === lang ? '<span class="deep" style="font-weight:700">✓</span>' : "", `setLanguage('${code}')`);
  }
  openSheet(tr("Language"), `<p class="b-small muted">${tr("The doctor summary PDF always stays in English, so any doctor can read it.")}</p>
    <div class="sgroup">${rows}</div>`);
}

function setLanguage(code) {
  lang = code;
  document.documentElement.lang = code;
  closeOverlay();
  render();
}

function editNameSheet() {
  openSheet(tr("Edit Profile"), `
    <label class="field">${tr("Display name")}<input id="name-input" value="${esc(current.first)}" maxlength="30"></label>
    <button class="btn block" onclick="saveName()">${tr("Save changes")}</button>`);
  document.getElementById("name-input").focus();
}

function saveName() {
  const name = document.getElementById("name-input").value.trim();
  if (!name) return;
  current.first = name;
  snack(tr("Saved"));
  render();
}

function helpSheet() {
  openSheet(tr("Help & Support"), `
    <p class="b-med ink2">${tr("Need a hand? Ask the AI Assistant anything about using Lumenstru. Tasks, logging your period, the Study Forecast, reminders or Calm Space.")}</p>
    <p class="b-med ink2">${tr("Still stuck, or found a problem? Email us:")}</p>
    <a class="btn ghost block" href="mailto:lumenstruai@gmail.com" style="text-decoration:none">${icon("send")}lumenstruai@gmail.com</a>
    <button class="btn block" onclick="closeOverlay(); go('assistant')">${icon("sparkles")}${tr("Ask AI")}</button>
    <button class="btn ghost block" onclick="tourSheet(0)">${tr("Take the tour again")}</button>`);
}

function aboutSheet() {
  openSheet(tr("About"), `
    <div style="align-self:center">${mascot(current.night, 90)}</div>
    <p class="b-med ink2">${tr("Lumenstru AI blends cycle-aware planning with a soft, encouraging assistant. Matcha-fresh and focused by day, lavender-calm by night.")}</p>
    <p class="b-med ink2">${tr("Cycle days and phases are estimates, not medical advice. The assistant is rule-based. Everything works on this phone, with an optional account (Firebase) that keeps a private copy of your data.")}</p>
    <p class="b-small muted">${tr("Calm Space music from Pixabay (Pixabay Content License): NaturesEye, leberch.")}</p>
    <p class="b-small muted">${tr("Version %s", "1.0.0")}</p>
    <button class="btn ghost block" onclick="closeOverlay()">${tr("Close")}</button>`);
}

const TOUR = [
  ["Welcome to Lumenstru", "A study planner that follows your cycle. Here is a quick look around.", "Happy"],
  ["Your cycle ring", "The Dashboard shows your cycle day, your phase and when your next period is expected.", "Calm"],
  ["Log today", "Tap Log today for flow, symptoms and mood. Starting a period switches the app to calm Lavender mode by itself.", "Okay"],
  ["Tasks that plan themselves", "Give each task a difficulty. Hard work moves to your high-energy days, and big tasks are split into parts.", "Happy"],
  ["Calm Space", "Music, breathing, meditation and stretches for busy or painful days.", "Calm"],
  ["Ask me anything", "The AI Assistant knows your plan and your cycle. Find it under Ask AI on the Dashboard.", "Happy"],
];

function tourSheet(step) {
  const [title, text, mood] = TOUR[step];
  let dots = "";
  for (let i = 0; i < TOUR.length; i++) dots += `<span class="${i <= step ? "on" : ""}"></span>`;
  const last = step === TOUR.length - 1;
  openSheet(tr(title), `
    <div style="align-self:center">${moodMascot(mood, current.night, 110)}</div>
    <p class="b-med ink2" style="text-align:center">${tr(text)}</p>
    <div class="sets">${dots}</div>
    <div class="row" style="gap:10px">
      <button class="btn ghost" style="flex:1" onclick="closeOverlay()">${tr("Skip")}</button>
      <button class="btn" style="flex:1" onclick="${last ? "closeOverlay()" : `tourSheet(${step + 1})`}">${tr(last ? "Done" : "Next")}</button>
    </div>`);
}

function signInSheet(create) {
  openSheet(tr(create ? "Create account" : "Your account"), `
    <label class="field">${tr("Email")}<input id="email" type="email" placeholder="you@example.com"></label>
    <label class="field">${tr("Password")}<input id="password" type="password"></label>
    ${create ? `<label class="field">${tr("Confirm password")}<input id="password2" type="password"></label>` : ""}
    <p class="b-small" id="sign-error" style="color:var(--error)"></p>
    <button class="btn block" onclick="signIn(${!!create})">${tr(create ? "Create account" : "Sign in")}</button>
    <div class="row" style="justify-content:space-between">
      <button class="textbtn" onclick="snack(tr('We sent a reset link to your email.'))">${tr("Forgot password?")}</button>
      <button class="textbtn" onclick="signInSheet(${!create})">${tr(create ? "Sign in" : "Create account")}</button>
    </div>
    <p class="b-small muted" style="text-align:center">${tr("or")}</p>
    <button class="btn ghost block" onclick="current.account = '${current.first.toLowerCase()}.demo@gmail.com'; closeOverlay(); snack(tr('Signed in')); render()">${tr("Continue with Google")}</button>`);
}

function signIn(create) {
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("password").value;
  const error = document.getElementById("sign-error");
  if (!/^\S+@\S+\.\S+$/.test(email)) { error.textContent = tr("Enter a valid email address."); return; }
  if (pass.length < 6) { error.textContent = tr("Password must be at least 6 characters."); return; }
  if (create && pass !== document.getElementById("password2").value) { error.textContent = tr("Passwords don't match."); return; }
  current.account = email;
  closeOverlay();
  snack(tr(create ? "Account created. Check your inbox to verify your email." : "Signed in"));
  render();
}

const SAVED_FIELDS = ["first", "periods", "cycleLength", "tasks", "classes", "logs", "checkin", "moves", "nextId", "calmLog"];

function saveBackup() {
  const data = {};
  for (const f of SAVED_FIELDS) data[f] = current[f];
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "lumenstru-backup-" + current.id + ".json";
  a.click();
  URL.revokeObjectURL(a.href);
  snack(tr("Backup saved"));
}

function restoreBackup(file) {
  if (!file) return;
  file.text().then(text => {
    try {
      const data = JSON.parse(text);
      if (!Array.isArray(data.periods) || !Array.isArray(data.tasks)) throw new Error("bad file");
      for (const f of SAVED_FIELDS) if (data[f] !== undefined) current[f] = data[f];
      setNight(cycleInfo(current).inPeriod);
      snack(tr("Backup restored"));
      render();
    } catch (e) {
      snack(tr("That file is not a Lumenstru backup."));
    }
  });
}

function eraseData() {
  confirmDialog(tr("Erase my data"), tr("This can't be undone.") + " " + tr("Tasks, classes, logs and check-ins are removed. (Demo: open the student again to get the data back.)"), tr("Erase"), () => {
    current.tasks = [];
    current.classes = [];
    current.logs = {};
    current.moves = [];
    current.chat = [];
    snack(tr("Your data was erased."));
    goTab("dashboard");
  });
}

// AI Assistant (AssistantScreen.kt)
function assistantScreen() {
  if (current.chat.length === 0) current.chat.push({ me: false, text: assistantGreeting() });
  const chips = current.suggestions.map(s => `<button class="suggest" onclick="sendChat(this.textContent)">${esc(tr(s))}</button>`).join("");
  const bubbles = current.chat.map(m => m.me
    ? `<div class="bubble-row me"><div class="bubble me">${esc(m.text)}</div></div>`
    : `<div class="bubble-row">${mascot(current.night, 30)}<div class="bubble ${m.thinking ? "thinking" : ""}">${esc(m.text)}</div></div>`).join("");
  return `
    <div style="padding:0 18px">${header(tr("AI Assistant"), tr("Your soft little study + wellness bestie"))}</div>
    <div class="suggestions scroller-x">${chips}</div>
    <div class="messages scroller" id="messages">${bubbles}</div>
    <form class="chatbar" onsubmit="event.preventDefault(); sendChat(document.getElementById('chat-input').value)">
      <input id="chat-input" placeholder="${tr("Type your message…")}" autocomplete="off">
      <button class="sendbtn" aria-label="${tr("Send")}">${icon("send")}</button>
    </form>`;
}

function scrollChat() {
  const box = document.getElementById("messages");
  if (box) box.scrollTop = box.scrollHeight;
}

function sendChat(text) {
  text = text.trim();
  if (!text) return;
  current.chat.push({ me: true, text });
  current.chat.push({ me: false, text: tr("Thinking…"), thinking: true });
  render();
  // a short pause, like the app, so the reply doesn't feel instant
  setTimeout(() => {
    if (!current) return;
    const reply = assistantReply(text);
    current.chat.pop();
    current.chat.push({ me: false, text: reply.text });
    current.suggestions = reply.suggestions;
    if (route === "assistant") {
      render();
      document.getElementById("chat-input").focus();
    }
  }, 650);
}

// Survival Suite: the three daily reminders (SurvivalScreen.kt)
let survivalTab = 0;

function reminderText(key) {
  const p = current;
  const c = cycleInfo(p);
  const energy = energyAt(p, 0);
  if (key === "hydration") {
    if (c.inPeriod) return tr("Your period is on. Water and a warm drink can ease cramps and headaches.");
    if (c.nextOffset <= 3) return tr("Your period may start soon. Staying hydrated now can help with bloating.");
    if (c.phase === "Luteal") return tr("In your Luteal phase, water helps with bloating, headaches and cravings.");
    return tr("Long study sessions use more water than you think. Keep a bottle on your desk.");
  }
  if (key === "rest") {
    if (energy === 1) return tr("Today is a lower-energy day. Take a proper 15-minute break. Rest is part of the plan.");
    if (energy === 3) return tr("You're in a high-energy phase. A 5-minute break now keeps your focus sharp for the afternoon.");
    return tr("A steady day. A 10-minute break after each hour of study keeps you going.");
  }
  const n = todaysTasks().length;
  if (n === 0) return tr("No tasks due today.");
  return n === 1 ? tr("You have 1 pending task for today.") : tr("You have %d pending tasks for today.", n);
}

const REMINDERS = [["hydration", "Hydration Reminder", "Got it"], ["rest", "Rest Reminder", "Rest Now"], ["task", "Task Reminder", "View Task"]];

function survivalScreen() {
  const p = current;
  let body = "";
  if (survivalTab === 0) {
    if (p.notif.dnd) body = `<p class="b-med muted">${tr("Do Not Disturb is on. Reminders are paused.")}</p>`;
    for (const [key, title, action] of REMINDERS) {
      if (p.notif.dnd || !p.notif[key].on) continue;
      const done = p.reminders[key];
      body += `
        <div class="card" style="gap:6px;${done ? "opacity:.55" : ""}">
          <div class="row"><span class="t-med grow">${tr(title)}</span><span class="b-small muted">${timeLabel(p.notif[key].time)}</span></div>
          <p class="b-med ink2">${reminderText(key)}</p>
          ${done ? `<span class="b-small deep">${tr("Resolved")} ✓</span>` : `<button class="btn" style="align-self:flex-start;margin-top:6px" onclick="resolveReminder('${key}')">${tr(action)}</button>`}
        </div>`;
    }
  } else {
    body = p.reminderHistory.length
      ? p.reminderHistory.map(h => `<div class="card" style="gap:2px"><span class="t-small">${tr(h)}</span><span class="b-small muted">${tr("Resolved · %s", tr("Today"))}</span></div>`).join("")
      : `<p class="b-med muted">${tr("Nothing resolved yet today.")}</p>`;
  }
  return header(tr("Survival Suite"), tr("Gentle nudges, right on time"), true) + `
    <div class="tabs"><button class="${survivalTab === 0 ? "on" : ""}" onclick="survivalTab = 0; render()">${tr("Reminders")}</button><button class="${survivalTab === 1 ? "on" : ""}" onclick="survivalTab = 1; render()">${tr("History")}</button></div>
    ${body}
    <button class="btn ghost block" onclick="go('notifications')">${icon("bell")}${tr("Notification Settings")}</button>`;
}

function resolveReminder(key) {
  current.reminders[key] = true;
  current.reminderHistory.push(REMINDERS.find(r => r[0] === key)[1]);
  if (key === "task") { goTab("tasks"); return; }
  if (key === "rest") { snack(tr("Enjoy your break.")); }
  render();
}

// Timetable (TimetableScreen.kt)
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let classForm = null;

function newClassForm(c) {
  classForm = c ? { ...c, days: c.days.slice(), index: current.classes.indexOf(c) }
    : { name: "", place: "", note: "", start: "09:00", end: "10:00", days: [TODAY.getDay()], index: -1 };
}

function timetableScreen() {
  const p = current;
  if (!classForm) newClassForm();
  let week = "";
  for (const d of [1, 2, 3, 4, 5, 6, 0]) {
    const list = classesOn(p, d);
    if (!list.length) continue;
    const mins = list.reduce((s, c) => s + minutesOf(c.end) - minutesOf(c.start), 0);
    week += sectionLabel(tr(DAY_NAMES[d]) + " · " + hoursText(mins) + (mins >= 300 ? " · " + tr("busy") : ""));
    week += `<div class="group">${list.map(c => `
      <div class="partrow" onclick="newClassForm(current.classes[${p.classes.indexOf(c)}]); render()">
        <div class="time" style="width:76px"><b class="t-small">${timeLabel(c.start)}</b><div class="b-small muted">${tr("to %s", timeLabel(c.end))}</div></div>
        <div class="grow"><div class="t-small">${esc(c.name)}</div><div class="b-small muted">${esc(c.place || "")}${c.note ? " · " + esc(c.note) : ""}</div>
          <div class="b-small muted">${tr("Alarm at %s", timeLabel(alarmTime(c.start)))}</div></div>
        <button class="textbtn" onclick="event.stopPropagation(); removeClass(${p.classes.indexOf(c)})">${tr("Remove")}</button>
      </div>`).join('<div class="sep"></div>')}</div>`;
  }
  const f = classForm;
  const dayChips = [1, 2, 3, 4, 5, 6, 0].map(d =>
    `<button class="chip ${f.days.includes(d) ? "on" : ""}" onclick="toggleClassDay(${d})">${tr(DAY_NAMES[d]).slice(0, 3)}</button>`).join("");
  return header(tr("Timetable"), tr("Your classes, every week"), true) + `
    <p class="b-small muted">${tr("Tap a class to edit it or add a note")}</p>
    ${week || `<p class="b-med muted">${tr("No classes yet.")}</p>`}
    <div class="card" style="gap:10px">
      <span class="t-med">${tr(f.index >= 0 ? "Edit class" : "Add a class")}</span>
      <label class="field">${tr("Class name")}<input value="${esc(f.name)}" oninput="classForm.name = this.value"></label>
      <label class="field">${tr("Room")}<input value="${esc(f.place || "")}" oninput="classForm.place = this.value"></label>
      <span class="t-small">${tr("Days (tap all that apply)")}</span>
      <div class="chiprow">${dayChips}</div>
      <div class="row" style="gap:10px">
        <label class="field" style="flex:1">${tr("Starts")}<input type="time" value="${f.start}" onchange="classForm.start = this.value"></label>
        <label class="field" style="flex:1">${tr("Ends")}<input type="time" value="${f.end}" onchange="classForm.end = this.value"></label>
      </div>
      <label class="field">${tr("Note")}<input value="${esc(f.note || "")}" oninput="classForm.note = this.value"></label>
      <p class="b-small" id="class-error" style="color:var(--error)"></p>
      <button class="btn block" onclick="saveClass()">${tr(f.index >= 0 ? "Save changes" : "Add class")}</button>
      ${f.index >= 0 ? `<button class="btn ghost block" onclick="newClassForm(); render()">${tr("Cancel")}</button>` : ""}
      <p class="b-small muted">${tr("An alarm rings %d minutes before each class, with your note. You can snooze or dismiss it.", p.notif.classMinutes)}</p>
    </div>`;
}

function alarmTime(start) {
  const m = minutesOf(start) - current.notif.classMinutes;
  return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
}

function toggleClassDay(d) {
  const days = classForm.days;
  if (days.includes(d)) days.splice(days.indexOf(d), 1);
  else days.push(d);
  render();
}

function saveClass() {
  const f = classForm;
  const error = document.getElementById("class-error");
  if (!f.name.trim()) { error.textContent = tr("Give the class a name."); return; }
  if (!f.days.length) { error.textContent = tr("Pick at least one day."); return; }
  if (minutesOf(f.end) <= minutesOf(f.start)) { error.textContent = tr("The class must end after it starts (%1$s to %2$s).", timeLabel(f.start), timeLabel(f.end)); return; }
  const c = { name: f.name.trim(), place: f.place.trim(), note: (f.note || "").trim(), start: f.start, end: f.end, days: f.days };
  if (f.index >= 0) current.classes[f.index] = c;
  else current.classes.push(c);
  snack(tr(f.index >= 0 ? "Class saved" : "Class added"));
  newClassForm();
  rebalanceAll();
  render();
}

function removeClass(i) {
  current.classes.splice(i, 1);
  newClassForm();
  snack(tr("Class removed"));
  render();
}

// My Cycle & Insights + doctor summary PDF (InsightsScreen.kt)
let insightsTab = 0;

function insightsScreen() {
  const p = current;
  const tabs = `<div class="tabs"><button class="${insightsTab === 0 ? "on" : ""}" onclick="insightsTab = 0; render()">${tr("My cycle")}</button><button class="${insightsTab === 1 ? "on" : ""}" onclick="insightsTab = 1; render()">${tr("Exam prep")}</button></div>`;
  let body;
  if (insightsTab === 0) {
    const gaps = p.gaps.length ? p.gaps : [p.cycleLength];
    const max = Math.max(...gaps, 35);
    const bars = gaps.map((g, i) => `
      <div class="cbar"><span class="b-small">${g}</span><span class="fill" style="height:${g / max * 100}px;${g < 21 || g > 35 ? "background:var(--accent)" : ""}"></span><span class="l-small muted">${i + 1}</span></div>`).join("");
    const counts = {};
    Object.values(p.logs).forEach(l => l.symptoms.forEach(s => counts[s] = (counts[s] || 0) + 1));
    const symptoms = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).map(s =>
      `<div class="row" style="gap:10px"><span class="b-med grow">${tr(s)}</span><span class="meter"><span style="width:${counts[s] / Math.max(...Object.values(counts)) * 100}%"></span></span><span class="b-small muted">${counts[s]}</span></div>`).join("");
    body = `
      <div class="stat-grid">
        <div class="card"><b>${p.cycleLength}</b><span>${tr("Avg cycle")}</span></div>
        <div class="card"><b>${Math.min(...gaps)}–${Math.max(...gaps)}</b><span>${tr("Range")}</span></div>
        <div class="card"><b>${p.periodLength}</b><span>${tr("Period days")}</span></div>
      </div>
      <div class="card"><span class="t-med">${tr("Cycle lengths")}</span><p class="b-small muted">${tr("Your last cycles, in days. 21 to 35 days is the usual range.")}</p>
        <div class="cbars">${bars}</div></div>
      <div class="card" style="gap:8px"><span class="t-med">${tr("Symptoms you logged")}</span>${symptoms || `<p class="b-small muted">${tr("No symptoms logged yet.")}</p>`}</div>
      ${calmCard()}
      <div class="card" style="gap:10px">
        <span class="t-med">${tr("Doctor summary")}</span>
        <p class="b-small ink2">${tr("A period diary to show your GP: dates, cycle lengths, bleeding and pain by day, symptoms and space for your questions. Self-reported, not a diagnosis.")}</p>
        <div class="row" style="gap:10px">
          <button class="btn" style="flex:1" onclick="doctorPdf()">${icon("download")}${tr("Save PDF")}</button>
          <button class="btn ghost" style="flex:1" onclick="shareSummary()">${icon("send")}${tr("Share")}</button>
        </div>
      </div>`;
  } else {
    const hard = p.tasks.filter(t => !t.done && t.diff >= 4 && t.due != null);
    body = hard.length ? hard.map(t => {
      const ph = phaseAt(p, t.due);
      return `<div class="card" style="gap:4px"><div class="row"><span class="t-small grow">${esc(t.name)}</span>${badge(t.diff)}</div>
        <span class="b-small ink2">${dueText(t.due)} · ${tr("%s phase", tr(ph))}${isPeriodDay(p, t.due) ? " · " + tr("period day") : ""}</span>
        <span class="b-small muted">${tr(ph === "Menstrual" || ph === "Luteal" ? "Start early: this falls on a lower-energy time." : "Good timing: this falls on a higher-energy time.")}</span></div>`;
    }).join("") : `<p class="b-med muted">${tr("No hard tasks or exams coming up.")}</p>`;
    body += `<button class="btn block" onclick="go('exam')">${icon("sparkles")}${tr("Got an exam? Plan your revision")}</button>`;
  }
  return header(tr("My Cycle & Insights"), tr("Your patterns, in one place"), true) + tabs + body;
}

// finished calm sessions (breathing / meditation / stretch)
function calmCard() {
  const log = current.calmLog || [];
  if (!log.length) {
    return `<div class="card" style="gap:6px"><span class="t-med">${tr("Calm Space")}</span>
      <p class="b-small muted">${tr("Finish a Breathing, Meditation or Stretch session and it shows here.")}</p></div>`;
  }
  const total = log.reduce((s, x) => s + x.minutes, 0);
  const names = { breathing: "Breathing", meditation: "Meditation", stretch: "Stretch" };
  const rows = log.map(x => `<div class="row b-small"><span class="grow">${tr(names[x.type])}</span><span class="deep" style="font-weight:700">${x.minutes} min</span></div>`).join("");
  return `<div class="card" style="gap:6px"><span class="t-med">${tr("Calm Space")}</span>
    <p class="b-small ink2">${tr("%d calm minutes so far", total)}</p>${rows}</div>`;
}

function summaryText() {
  const p = current;
  const c = cycleInfo(p);
  const lines = [
    "Lumenstru AI - period diary for " + p.name,
    "Last period started: " + c.start.toDateString(),
    "Usual cycle: " + p.cycleLength + " days (range " + Math.min(...p.gaps) + "-" + Math.max(...p.gaps) + ")",
    "Period length: about " + p.periodLength + " days",
  ];
  Object.keys(p.logs).map(Number).sort((a, b) => a - b).forEach(o => {
    const l = p.logs[o];
    lines.push(dateAt(o).toDateString() + ": flow " + l.flow + ", pain " + l.severity + ", " + l.symptoms.join(", ") + ", mood " + l.mood);
  });
  lines.push("Self-reported in Lumenstru. Not a diagnosis.");
  return lines;
}

// opens a printable A4 page; the browser's print dialog has "Save as PDF"
function doctorPdf() {
  const p = current;
  const lines = summaryText();
  const rows = Object.keys(p.logs).map(Number).sort((a, b) => a - b).map(o => {
    const l = p.logs[o];
    return `<tr><td>${dateAt(o).toDateString()}</td><td>${cycleDayAt(p, o)}</td><td>${l.flow}</td><td>${l.severity}</td><td>${l.symptoms.join(", ")}</td><td>${l.mood}</td></tr>`;
  }).join("");
  const periods = p.periods.map(x => `<li>${dateAt(x.start).toDateString()}${x.end !== undefined ? " to " + dateAt(x.end).toDateString() : " (ongoing)"}</li>`).join("");
  const win = window.open("", "_blank");
  if (!win) { snack(tr("Allow pop-ups to save the PDF.")); return; }
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Doctor summary - ${esc(p.name)}</title>
    <style>body{font-family:Georgia,serif;color:#1C221B;max-width:720px;margin:32px auto;padding:0 20px}h1{font-weight:500;margin:0}
    p.sub{color:#575F56;margin:4px 0 20px}table{width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px}
    th,td{border:1px solid #D5D8CF;padding:6px;text-align:left}th{background:#E5EAE1}.notes div{border-bottom:1px solid #999;height:28px}
    li,p{font-family:Arial,sans-serif;font-size:14px}</style></head><body>
    <h1>Period diary</h1><p class="sub">${esc(p.name)} · made with Lumenstru AI on ${TODAY.toDateString()}</p>
    <p><b>Key facts</b><br>${lines.slice(1, 4).join("<br>")}</p>
    <p><b>Recent periods</b></p><ul>${periods}</ul>
    <p><b>Day-by-day log</b></p><table><tr><th>Date</th><th>Cycle day</th><th>Flow</th><th>Pain</th><th>Symptoms</th><th>Mood</th></tr>${rows}</table>
    <p><b>Questions for my doctor</b></p><div class="notes"><div></div><div></div><div></div></div>
    <p style="color:#575F56">Self-reported in Lumenstru. Not a diagnosis.</p>
    <script>window.onload = () => window.print();<\/script></body></html>`);
  win.document.close();
}

function shareSummary() {
  const text = summaryText().join("\n");
  if (navigator.share) {
    navigator.share({ title: "Doctor summary", text }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => snack(tr("Summary copied. Paste it into an email or message.")));
  }
}

// Log Period (LogPeriodScreen.kt): "Mark dates" and "Log a day"
const FLOWS = ["Light", "Medium", "Heavy"];
const SEVERITIES = ["Mild", "Moderate", "Severe"];
const SYMPTOMS = ["Cramps", "Fatigue", "Headache", "Bloating", "Mood swings", "Cravings"];
const LOG_MOODS = ["Happy", "Calm", "Energetic", "Good", "Neutral", "Tired", "Sad", "Irritated", "Anxious", "Low Energy", "Sensitive"];
let logForm = null;
let markRange = null;

function openLogForm(date) {
  const old = current.logs[date];
  logForm = old ? JSON.parse(JSON.stringify(old)) : { flow: "Medium", severity: "Mild", symptoms: [], mood: "" };
  logForm.date = date;
  logForm.end = false;
  logForm.monthShift = 0;
}

function logScreen() {
  const mode = params.mode === "mark" ? "mark" : "log";
  if (mode === "log" && !logForm) openLogForm(params.date || 0);
  if (mode === "mark" && !markRange) markRange = { first: null, last: null, shift: 0 };
  const tabs = `<div class="tabs"><button class="${mode === "mark" ? "on" : ""}" onclick="params = {mode: 'mark'}; clearForms(); render()">${tr("Mark dates")}</button><button class="${mode === "log" ? "on" : ""}" onclick="params = {date: 0}; clearForms(); render()">${tr("Log a day")}</button></div>`;
  return header(tr("Log Period"), tr("Logging helps me plan gently with you"), true) + tabs + (mode === "mark" ? markDates() : logDay());
}

function logDay() {
  const p = current;
  const f = logForm;
  const c = cycleInfo(p);
  const first = new Date(TODAY.getFullYear(), TODAY.getMonth() + f.monthShift, 1);
  const grid = monthGrid(first, (n, offset) => {
    let cls = "cell";
    if (periodKind(p, offset) === "logged") cls += " period";
    if (offset === 0) cls += " today";
    if (offset === f.date) cls += " sel";
    const disabled = offset > 0;
    return `<button class="${cls}" ${disabled ? "disabled" : ""} onclick="pickLogDay(${offset})">${n}${p.logs[offset] ? '<span class="tdot"></span>' : ""}</button>`;
  });
  const inThisPeriod = c.inPeriod && f.date >= latest(p).start;
  let button;
  if (!c.inPeriod) button = tr("Submit & Start Period");
  else if (f.end) button = tr("Save & End Period");
  else button = tr("Save Today's Info");
  return `
    <div class="card">
      <div class="monthnav">
        <button class="navarrow" onclick="logForm.monthShift--; render()">‹</button><h4>${monthTitle(first)}</h4>
        <button class="navarrow" onclick="logForm.monthShift++; render()">›</button>
      </div>${grid}
      <p class="b-small muted" style="margin-top:8px">${tr("Tap any past day to fill in what you missed. Future days aren't available.")}</p>
    </div>
    <div class="l-med ink2" style="font-weight:700">${tr("Selected day")}: ${longDate(dateAt(f.date))}</div>
    ${sectionLabel(tr("Flow"))}${chips(FLOWS, f.flow, "logPick('flow',")}
    ${sectionLabel(tr("Severity"))}${chips(SEVERITIES, f.severity, "logPick('severity',")}
    ${sectionLabel(tr("Symptoms"))}${chips(SYMPTOMS, f.symptoms, "logSymptom(", true)}
    ${sectionLabel(tr("How was your day?"))}${chips(LOG_MOODS, f.mood, "logPick('mood',")}
    <p class="b-small muted">${tr("Tracking your mood each day helps you notice your own patterns.")}</p>
    ${inThisPeriod ? `<div class="card"><div class="row"><div class="grow"><div class="t-small">${tr("End Period")}</div><div class="b-small muted">${tr("Switch on for the last day of your period.")}</div></div>
      <button class="switch-btn" onclick="logForm.end = !logForm.end; render()"><span class="switch ${f.end ? "on" : ""}"></span></button></div></div>` : ""}
    <button class="btn block" onclick="saveLog()">${button}</button>
    ${p.logs[f.date] ? `<button class="textbtn" style="color:var(--error)" onclick="deleteLog()">${tr("Delete this day's log")}</button>` : ""}`;
}

function pickLogDay(offset) {
  const shift = logForm.monthShift;
  openLogForm(offset);
  logForm.monthShift = shift;
  render();
}

// chips() calls these with the option name
function logPick(field, value) {
  logForm[field] = value;
  render();
}
function logSymptom(value) {
  const list = logForm.symptoms;
  if (list.includes(value)) list.splice(list.indexOf(value), 1);
  else list.push(value);
  render();
}

function saveLog() {
  const p = current;
  const f = logForm;
  const c = cycleInfo(p);
  p.logs[f.date] = { flow: f.flow, severity: f.severity, symptoms: f.symptoms.slice(), mood: f.mood };
  if (!c.inPeriod && f.date > latest(p).start) {
    // starting a period: Lavender switches on by itself
    p.periods.push({ start: f.date });
    learnCycle(p);
    setNight(true);
    resetTimer(true);
    rebalanceAll();
    snack(tr("Period started. Lavender mode is on to keep things calm."));
  } else if (f.end) {
    latest(p).end = f.date;
    setNight(false);
    resetTimer(true);
    snack(tr("Period ended. Matcha is back."));
  } else {
    if (f.date === 0 && f.severity === "Severe") rebalanceAll();
    snack(tr("Saved"));
  }
  logForm = null;
  back();
}

function deleteLog() {
  confirmDialog(tr("Delete this day's log?"), tr("Flow, symptoms and mood for this day will be removed."), tr("Delete"), () => {
    delete current.logs[logForm.date];
    snack(tr("Deleted"));
    render();
  });
}

function markDates() {
  const p = current;
  const m = markRange;
  const first = new Date(TODAY.getFullYear(), TODAY.getMonth() + m.shift, 1);
  const grid = monthGrid(first, (n, offset) => {
    let cls = "cell";
    const chosen = m.first !== null && offset >= m.first && offset <= (m.last !== null ? m.last : m.first);
    if (chosen) cls += " period";
    else if (periodKind(p, offset) === "logged") cls += " predicted";
    if (offset === 0) cls += " today";
    return `<button class="${cls}" ${offset > 0 ? "disabled" : ""} onclick="markDay(${offset})">${n}</button>`;
  });
  const status = m.first === null ? tr("Tap the first day of the period.")
    : m.last === null ? tr("Now tap the last day.")
    : tr("%1$s to %2$s", shortDate(dateAt(m.first)), shortDate(dateAt(m.last)));
  return `
    <p class="b-small muted">${tr("Marking dates that overlap a saved period replaces it. To add flow, symptoms or mood, use \"%s\".", tr("Log a day"))}</p>
    <div class="card">
      <div class="monthnav">
        <button class="navarrow" onclick="markRange.shift--; render()">‹</button><h4>${monthTitle(first)}</h4>
        <button class="navarrow" onclick="markRange.shift++; render()">›</button>
      </div>${grid}
      <div class="clegend"><span><i style="background:var(--accent)"></i>${tr("Chosen")}</span><span><i style="background:var(--accent-light)"></i>${tr("Saved period")}</span></div>
    </div>
    <p class="t-small">${status}</p>
    <button class="btn block" ${m.last === null ? "disabled" : ""} onclick="saveMarked()">${tr("Save period")}</button>
    ${m.first !== null ? `<button class="btn ghost block" onclick="markRange = {first: null, last: null, shift: markRange.shift}; render()">${tr("Clear")}</button>` : ""}`;
}

function markDay(offset) {
  const m = markRange;
  if (m.first === null || m.last !== null) { m.first = offset; m.last = null; }
  else if (offset < m.first) { m.last = m.first; m.first = offset; }
  else m.last = offset;
  render();
}

function saveMarked() {
  const p = current;
  const { first, last } = markRange;
  // overlapping saved periods are replaced
  const wasActive = cycleInfo(p).inPeriod;
  p.periods = p.periods.filter(x => {
    const end = x.end !== undefined ? x.end : 0;
    return end < first || x.start > last;
  });
  p.periods.push({ start: first, end: last });
  learnCycle(p);
  if (wasActive && cycleInfo(p).inPeriod === false) setNight(false);
  markRange = null;
  rebalanceAll();
  snack(tr("Period saved. Your predictions are updated."));
  back();
}

// Add / Edit task (TaskEditorScreen.kt)
let taskForm = null;

function taskEditorScreen() {
  const editing = params.id !== undefined;
  const key = "task" + (editing ? params.id : "new");
  if (!taskForm || taskForm.key !== key) {
    const t = editing ? findTask(params.id) : null;
    taskForm = t ? { key, name: t.name, diff: t.diff, due: t.due, hours: t.hours || 1, repeat: t.repeat || "", progress: t.progress || 0 }
      : { key, name: "", diff: 3, due: params.due !== undefined ? params.due : 2, hours: 1, repeat: "", progress: 0 };
  }
  const f = taskForm;
  const t = editing ? findTask(params.id) : null;
  const dueValue = f.due == null ? "" : isoDate(dateAt(f.due));
  let diffButtons = "";
  for (let d = 1; d <= 5; d++) diffButtons += `<button class="diff ${f.diff === d ? "on" : ""}" onclick="taskForm.diff = ${d}; render()">${d}</button>`;
  const split = f.hours > 2 && f.due != null && f.due >= 2;
  let plan = "";
  if (split) {
    const copy = { hours: f.hours * (1 - f.progress / 100), due: f.due };
    splitTask(copy);
    if (copy.parts) {
      plan = `<div class="card" style="gap:6px"><span class="t-small">${tr("%1$s left, split into %2$d parts", hoursLabel(Math.round(copy.hours * 4) / 4), copy.parts)}</span>
        ${Array.from({ length: copy.parts }, (_, i) => `<div class="row b-small"><span class="grow">${dayLabel(i)}</span><span class="deep" style="font-weight:700">${hoursLabel(copy.partHours)}</span></div>`).join("")}
        <span class="b-small muted">${tr("Each part shows on the Tasks screen on its day. Tired days and busy class days get less.")}</span></div>`;
    }
  }
  return header(tr(editing ? "Edit Task" : "Add Task"), editing && t.due != null ? dueText(t.due) : tr("What do you need to do?"), true) + `
    <label class="field">${tr("Task name")}<input value="${esc(f.name)}" maxlength="120" oninput="taskForm.name = this.value" placeholder="${tr("e.g. Biology essay")}"></label>
    ${editing ? `<div class="card" style="gap:8px"><div class="row"><span class="t-small grow">${tr("Progress")}</span><span class="b-small deep" id="prog-label">${tr("%d%% done", f.progress)}</span></div>
      <input type="range" min="0" max="100" step="10" value="${f.progress}" oninput="taskForm.progress = Number(this.value); document.getElementById('prog-label').textContent = tr('%d%% done', this.value)" onchange="render()"></div>` : ""}
    <span class="t-small">${tr("Difficulty")}</span>
    <div class="diffrow">${diffButtons}</div>
    <p class="b-small muted">${tr("1 = quick and easy, 5 = needs your best energy.")}</p>
    <label class="field">${tr("Due date")}<input type="date" value="${dueValue}" min="${isoDate(TODAY)}" onchange="taskForm.due = this.value ? offsetOf(new Date(this.value + 'T00:00')) : null; render()"></label>
    <span class="t-small">${tr("Hours needed")}</span>
    <div class="stepper"><button onclick="taskForm.hours = Math.max(0.25, taskForm.hours - 0.25); render()">−</button><span>${hoursLabel(f.hours)}</span><button onclick="taskForm.hours = Math.min(40, taskForm.hours + 0.25); render()">+</button></div>
    <p class="b-small muted">${tr("Over 2 h? It is split into a small part for each day before it is due.")}</p>
    ${plan}
    <span class="t-small">${tr("Repeat")}</span>
    ${chips(["Never", "Daily", "Weekly"], f.repeat === "" ? "Never" : f.repeat === "daily" ? "Daily" : "Weekly", "setRepeat(")}
    <p class="b-small" id="task-error" style="color:var(--error)"></p>
    <button class="btn block" onclick="saveTask()">${tr(editing ? "Save changes" : "Add task")}</button>
    ${editing ? `<button class="textbtn" style="color:var(--error)" onclick="deleteTask()">${tr("Delete Task")}</button>` : ""}`;
}

function isoDate(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function setRepeat(value) {
  taskForm.repeat = value === "Never" ? "" : value.toLowerCase();
  render();
}

function saveTask() {
  const f = taskForm;
  if (!f.name.trim()) { document.getElementById("task-error").textContent = tr("Give the task a name."); return; }
  let t;
  if (params.id !== undefined) {
    t = findTask(params.id);
    if (t.due !== f.due) delete t.keepPlan;   // a new due date lets the rebalance plan it again
  } else {
    t = { id: current.nextId++ };
    current.tasks.push(t);
  }
  t.name = f.name.trim();
  t.diff = f.diff;
  t.due = f.due;
  t.hours = f.hours;
  t.repeat = f.repeat;
  t.progress = f.progress;
  delete t.doDay;
  current.moves = current.moves.filter(m => m.taskId !== t.id);
  splitTask(t);
  if (t.progress >= 100) { t.done = true; t.doneToday = true; }
  autoPlan(t);
  const moved = current.moves.find(m => m.taskId === t.id);
  snack(moved ? tr("Saved. Lumenstru planned it for %s, a better day.", dayLabel(moved.to)) : tr(params.id !== undefined ? "Task updated" : "Task added"));
  taskForm = null;
  back();
}

function deleteTask() {
  confirmDialog(tr("Delete this task?"), tr("This can't be undone."), tr("Delete"), () => {
    current.tasks = current.tasks.filter(t => t.id !== params.id);
    current.moves = current.moves.filter(m => m.taskId !== params.id);
    taskForm = null;
    snack(tr("Task deleted"));
    back();
  });
}

// Exam mode (ExamPlannerScreen.kt)
let examForm = null;

function examPlan(f) {
  // revision spread from today to the day before the exam; low-energy and period days get half
  const days = [];
  let weight = 0;
  for (let d = 0; d < f.due; d++) {
    const w = energyAt(current, d) === 1 || isPeriodDay(current, d) ? 0.5 : 1;
    days.push({ d, w });
    weight += w;
  }
  return days.map(x => ({ d: x.d, hours: Math.max(0.25, Math.round(f.hours * x.w / weight * 4) / 4), low: x.w < 1 }));
}

function examScreen() {
  if (!examForm) examForm = { name: "", due: 10, hours: 8 };
  const f = examForm;
  const plan = f.due >= 2 ? examPlan(f) : [];
  return header(tr("Exam mode"), tr("Spread your revision around your cycle"), true) + `
    <label class="field">${tr("Exam name")}<input value="${esc(f.name)}" oninput="examForm.name = this.value" placeholder="${tr("e.g. Biology final")}"></label>
    <label class="field">${tr("Exam date")}<input type="date" value="${isoDate(dateAt(f.due))}" min="${isoDate(dateAt(2))}" onchange="examForm.due = offsetOf(new Date(this.value + 'T00:00')); render()"></label>
    <span class="t-small">${tr("Hours of revision")}</span>
    <div class="stepper"><button onclick="examForm.hours = Math.max(1, examForm.hours - 1); render()">−</button><span>${hoursLabel(f.hours)}</span><button onclick="examForm.hours = Math.min(60, examForm.hours + 1); render()">+</button></div>
    ${isPeriodDay(current, f.due) ? noticeCard(tr("Exam on a period day"), tr("Your period is expected that day. The plan front-loads revision so you are ready early."), false, "strawberry") : ""}
    <span class="overline">${tr("YOUR PLAN")}</span>
    <div class="group">${plan.map(x => `<div class="partrow"><span class="hrs">${hoursLabel(x.hours)}</span><div class="grow"><div class="tname">${x.d === 0 ? tr("Today") : dayHeading(x.d)}</div>
      <div class="twhen">${x.low ? tr("Lighter day: period or low energy") : tr("Normal day")}</div></div></div>`).join('<div class="sep"></div>')}</div>
    <p class="b-small" id="exam-error" style="color:var(--error)"></p>
    <button class="btn block" onclick="saveExam()">${tr("Add to my tasks")}</button>`;
}

function saveExam() {
  const f = examForm;
  if (!f.name.trim()) { document.getElementById("exam-error").textContent = tr("Give the exam a name."); return; }
  if (f.due < 2) { document.getElementById("exam-error").textContent = tr("Pick a date at least 2 days away."); return; }
  const plan = examPlan(f);
  current.tasks.push({ id: current.nextId++, name: tr("Revise: %s", f.name.trim()), diff: 4, due: f.due, hours: f.hours, parts: plan.length, partHours: plan[0].hours, progress: 0 });
  current.exam = { name: f.name.trim(), due: f.due };
  examForm = null;
  snack(tr("Revision plan added to your tasks."));
  goTab("tasks");
}

// Notification Settings + App Settings
function notificationScreen() {
  const n = current.notif;
  const rows = [["hydration", "Hydration Reminder"], ["rest", "Rest Reminder"], ["task", "Task Reminder"]].map(([key, label]) => `
    <div class="srow" style="cursor:default"><span class="grow">${tr(label)}</span>
      <input type="time" class="timepill" value="${n[key].time}" onchange="current.notif.${key}.time = this.value; snack(tr('Saved'))">
      <button class="switch-btn" onclick="current.notif.${key}.on = !current.notif.${key}.on; render()"><span class="switch ${n[key].on ? "on" : ""}"></span></button></div>`).join('<div class="sep"></div>');
  return header(tr("Notification Settings"), tr("Pick what reminds you, and when"), true) + `
    <div class="sgroup">
      <div class="srow" style="cursor:default">${icon("moon")}<span class="grow">${tr("Do Not Disturb")}</span><button class="switch-btn" onclick="current.notif.dnd = !current.notif.dnd; render()"><span class="switch ${n.dnd ? "on" : ""}"></span></button></div>
    </div>
    ${sectionLabel(tr("Daily reminders"))}
    <div class="sgroup">${rows}</div>
    ${sectionLabel(tr("Period"))}
    <div class="sgroup"><div class="srow" style="cursor:default"><span class="grow">${tr("Period alerts")}<div class="b-small muted">${tr("A heads-up before your period, and the \"avoid wearing white\" note.")}</div></span>
      <button class="switch-btn" onclick="current.notif.period = !current.notif.period; render()"><span class="switch ${n.period ? "on" : ""}"></span></button></div></div>
    ${sectionLabel(tr("Class alarms"))}
    <p class="b-small muted">${tr("Minutes before each class")}</p>
    ${chips(["5", "10", "15", "20", "30"], String(n.classMinutes), "setClassMinutes(")}`;
}

function setClassMinutes(v) {
  current.notif.classMinutes = Number(v);
  render();
}

function appSettingsScreen() {
  const langName = LANGUAGE_NAMES.find(l => l[0] === lang)[1];
  return header(tr("App Settings"), tr("Theme, language and more"), true) + `
    ${sectionLabel(tr("Theme"))}
    <div class="theme-pick">
      <button class="${!current.night ? "on" : ""}" onclick="setNight(false); render()"><span class="swatch matcha"></span>${tr("Matcha")}<small>${tr("Full-focus days")}</small></button>
      <button class="${current.night ? "on" : ""}" onclick="setNight(true); render()"><span class="swatch lavender"></span>${tr("Lavender")}<small>${tr("Calmer, quieter days")}</small></button>
    </div>
    <p class="b-small muted">${tr("Lavender switches on by itself when a period starts, and Matcha comes back when it ends.")}</p>
    <div class="sgroup">
      ${settingRow(tr("Language"), "sparkles", `<span class="b-small ink2">${langName}</span>&nbsp;&nbsp;${CHEV}`, "languageSheet()")}<div class="sep"></div>
      ${settingRow(tr("Notification Settings"), "bell", CHEV, "go('notifications')")}<div class="sep"></div>
      ${settingRow(tr("Take the tour again"), "help", CHEV, "tourSheet(0)")}
    </div>`;
}
