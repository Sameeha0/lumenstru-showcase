// drawn pictures of the girls (flat svg, no photos since they're not real people)
// portrait(id, size) gives back an svg string

const LOOKS = {
  // O Level student in Karachi: sage hijab, white school shirt
  aisha: { skin: "#C98E66", cheek: "#E08A7A", bg: "#E5EAE1", hijab: "#8FA68A", hijabShade: "#7B9476", top: "#FFFFFF", collar: "#5A7156" },
  // CS student: long dark hair, lavender hoodie
  zara: { skin: "#B97B58", cheek: "#D9786A", bg: "#DCD2F2", hair: "#1E1A1C", hairShade: "#2E282B", top: "#9C8CC9", collar: "#C3B5E3", long: true },
  // MSc student: black bob with a fringe, glasses, oat cardigan
  mei: { skin: "#F1CDA8", cheek: "#EBA096", bg: "#F2D8D2", hair: "#17171C", hairShade: "#26262E", top: "#D9C7A8", collar: "#FFFFFF", bob: true, glasses: true },
  // nursing student: curly brown hair in a bun, teal scrubs
  sofia: { skin: "#D7A07A", cheek: "#E08A7A", bg: "#F3EDE2", hair: "#5A3725", hairShade: "#6E4630", top: "#4F9A94", collar: "#3F837D", bun: true },
};

function portrait(id, size) {
  const l = LOOKS[id];
  let back = "";    // hair or hijab behind the head
  let front = "";   // fringe / hijab edge in front
  if (l.hijab) {
    back = `<path d="M50 14c-21 0-33 15-33 35 0 12 3 22 9 30l-6 21h60l-6-21c6-8 9-18 9-30 0-20-12-35-33-35Z" fill="${l.hijab}"/>`;
    front = `<path d="M50 19c-15 0-25 10-26 25 4-9 14-15 26-15s22 6 26 15c-1-15-11-25-26-25Z" fill="${l.hijabShade}"/>`;
  } else if (l.long) {
    back = `<path d="M50 15c-19 0-29 13-29 30v40c0 6 6 10 12 10h34c6 0 12-4 12-10V45c0-17-10-30-29-30Z" fill="${l.hair}"/>`;
    front = `<path d="M27 44c2-14 11-22 23-22s21 8 23 22c-6-8-15-10-23-10-9 0-17 3-23 10Z" fill="${l.hairShade}"/>`;
  } else if (l.bob) {
    back = `<path d="M50 15c-19 0-29 13-29 31 0 9 1 17 4 22h50c3-5 4-13 4-22 0-18-10-31-29-31Z" fill="${l.hair}"/>`;
    front = `<path d="M27 42c1-13 10-21 23-21s22 8 23 21c-4-3-10-4-14-4l-3-6-3 6c-6 0-12 0-17 1-4 0-7 1-9 3Z" fill="${l.hairShade}"/>`;
  } else if (l.bun) {
    back = `<circle cx="50" cy="14" r="10" fill="${l.hair}"/><circle cx="45" cy="11" r="4" fill="${l.hairShade}"/><circle cx="55" cy="12" r="4" fill="${l.hairShade}"/>
      <path d="M50 18c-18 0-27 12-27 28 0 6 1 10 3 14h48c2-4 3-8 3-14 0-16-9-28-27-28Z" fill="${l.hair}"/>`;
    front = `<path d="M27 43c2-12 11-19 23-19s21 7 23 19c-5-5-10-7-15-8-3 3-9 4-16 4-6 0-11 1-15 4Z" fill="${l.hairShade}"/>
      <circle cx="28" cy="44" r="4" fill="${l.hair}"/><circle cx="72" cy="44" r="4" fill="${l.hair}"/>`;
  }
  const glasses = l.glasses
    ? `<g fill="none" stroke="#3A2F2A" stroke-width="1.6"><circle cx="41" cy="49" r="6.5"/><circle cx="59" cy="49" r="6.5"/><path d="M47.5 49h5"/></g>` : "";
  return `
  <svg viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="Drawn portrait">
    <circle cx="50" cy="50" r="50" fill="${l.bg}"/>
    <g clip-path="url(#clip-${id}-${size})">
      <clipPath id="clip-${id}-${size}"><circle cx="50" cy="50" r="50"/></clipPath>
      ${back}
      <path d="M22 100c2-15 13-23 28-23s26 8 28 23Z" fill="${l.top}"/>
      <path d="M41 77l9 9 9-9" fill="none" stroke="${l.collar}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="44" y="64" width="12" height="14" rx="5" fill="${l.skin}"/>
      <ellipse cx="50" cy="48" rx="19" ry="21" fill="${l.skin}"/>
      ${front}
      <ellipse cx="41" cy="50" rx="2" ry="2.6" fill="#2A2222"/>
      <ellipse cx="59" cy="50" rx="2" ry="2.6" fill="#2A2222"/>
      <path d="M37 44.5q4-2.5 8 0M55 44.5q4-2.5 8 0" fill="none" stroke="#2A2222" stroke-width="1.3" stroke-linecap="round"/>
      <circle cx="37" cy="57" r="3.6" fill="${l.cheek}" opacity=".45"/>
      <circle cx="63" cy="57" r="3.6" fill="${l.cheek}" opacity=".45"/>
      <path d="M45 59q5 4 10 0" fill="none" stroke="#7A3E36" stroke-width="1.6" stroke-linecap="round"/>
      ${glasses}
    </g>
  </svg>`;
}
