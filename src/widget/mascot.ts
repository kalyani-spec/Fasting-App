// The WaterGlass mascot as raw SVG strings, for the home-screen widget
// (widgets render outside React Native, so react-native-svg can't be used).

const GLASS = `
<path d="M32 34h56l-6.5 66a8 8 0 0 1-8 7h-27a8 8 0 0 1-8-7z" fill="#FFF" stroke="#17231F" stroke-width="3" stroke-linejoin="round"/>
<path d="M35.5 58c6-4 12 4 18 0s12 4 18 0 9 2 12 1l-4.2 41a5 5 0 0 1-5 4.5h-25.6a5 5 0 0 1-5-4.5z" fill="#CFE6FA"/>
<circle cx="50" cy="94" r="2.5" fill="#FFF"/><circle cx="68" cy="97" r="2" fill="#FFF"/><circle cx="60" cy="90" r="1.5" fill="#FFF"/>
<path d="M88 12c3 4 5 7 5 9a5 5 0 0 1-10 0c0-2 2-5 5-9z" fill="#9DC2F0" stroke="#17231F" stroke-width="2.5" stroke-linejoin="round"/>
<ellipse cx="44" cy="82" rx="5" ry="3" fill="#F2A39B"/><ellipse cx="76" cy="82" rx="5" ry="3" fill="#F2A39B"/>`;

const OPEN_EYES = `<circle cx="51" cy="74" r="4" fill="#17231F"/><circle cx="69" cy="74" r="4" fill="#17231F"/>
<circle cx="52.3" cy="72.6" r="1.3" fill="#FFF"/><circle cx="70.3" cy="72.6" r="1.3" fill="#FFF"/>`;
const CLOSED_EYES = `<path d="M46 74q4-4 8 0M66 74q4-4 8 0" stroke="#17231F" stroke-width="3" stroke-linecap="round" fill="none"/>`;
const SMILE = `<path d="M55 82q5 5 10 0" stroke="#17231F" stroke-width="3" stroke-linecap="round" fill="none"/>`;
// Arms are drawn in light mint so they read on the dark widget background.
const WAVE = `<path d="M34 66q-10 6-8 16M87 62q12-2 16-16" stroke="#8FD3C4" stroke-width="3.5" stroke-linecap="round" fill="none"/>`;
const MOON = `<path d="M106 8a12 12 0 1 0 8 20a10 10 0 0 1-8-20z" fill="#F2C14E"/>`;

const wrap = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">${body}</svg>`;

export const MASCOT_WAVE = wrap(WAVE + GLASS + OPEN_EYES + SMILE);
export const MASCOT_CALM = wrap(MOON + GLASS + CLOSED_EYES + SMILE);
