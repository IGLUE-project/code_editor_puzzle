
import { 
  amethyst, aquaBlue, atomDark, cobalt2, cyberpunk, dracula, ecoLight, 
  freeCodeCampDark, githubLight, gruvboxDark, gruvboxLight, levelUp, 
  monokaiPro, neoCyan, nightOwl, sandpackDark 
} from "@codesandbox/sandpack-themes";

const templates = {
  dark: "dark",
  light: "light",
  amethyst: amethyst,
  aquaBlue: aquaBlue,
  atomDark: atomDark,
  cobalt2: cobalt2,
  cyberpunk: cyberpunk,
  dracula: dracula,
  ecoLight: ecoLight,
  freeCodeCampDark: freeCodeCampDark,
  githubLight: githubLight,
  gruvboxDark: gruvboxDark,
  gruvboxLight: gruvboxLight,
  levelUp: levelUp,
  monokaiPro: monokaiPro,
  neoCyan: neoCyan,
  nightOwl: nightOwl,
  sandpackDark: sandpackDark
};


export function getTemplate(theme)  {
  return templates[theme] || templates.light;
}