Lumenstru AI - Student Showcase
================================
Open index.html in any browser (works offline, no server needed).

Four made-up students (drawn portraits, not real people). Click one to
open their phone with Lumenstru running on their own data, next to a
short note on how the app helps them.
Direct links: index.html#aisha  #zara  #mei  #sofia

Everything on the phone works: Log today (starting a period switches to
Lavender by itself, ending it brings Matcha back), check-in, add / edit /
tick tasks (big tasks split into parts, hard tasks move to better days),
timetable, exam mode, reminders, focus timer, Calm Space music (made live
in the browser, use headphones), breathing / meditation / stretch, the AI
Assistant (the app's own rule-based engine), Insights + doctor summary PDF
(opens the print dialog, choose "Save as PDF"), language (English,
Español, हिन्दी, 한국어, 中文), sign in, backup file save / restore, erase.
Scroll the phone with the mouse wheel or drag it like a finger.

Separate from the final year project; it does not use any app code.
The phone screens copy the Android app's Compose code (colours, fonts,
sizes, icons and layout).

Files
  index.html        page + all styles
  js/data.js        the four students
  js/app.js         page, navigation, cycle maths, Dashboard, Calendar, Tasks
  js/screens.js     Calm, Profile, Assistant, Reminders, Timetable,
                    Insights, Log Period, Task editor, Exam mode, Settings
  js/assistant.js   the AI Assistant (ported from the app's Assistant.kt)
  js/portraits.js   drawn portraits of the students
  js/lang.js        the app's language packs
  assets/fonts      Lora + DM Sans (the app's fonts)
  assets/mascot     the app's mascots
Dates are made relative to today, so the demo always looks current.
