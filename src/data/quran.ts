// Données de référence du Coran (ordre = sourate 1 à 114).
// Volontairement codées en dur (pas en base) : ce sont des constantes stables.

export const SURAH_NAMES: string[] = [
  "Al-Fatiha","Al-Baqara","Aal-Imran","An-Nisa","Al-Ma'ida","Al-An'am","Al-A'raf","Al-Anfal","At-Tawba","Yunus",
  "Hud","Yusuf","Ar-Ra'd","Ibrahim","Al-Hijr","An-Nahl","Al-Isra","Al-Kahf","Maryam","Ta-Ha",
  "Al-Anbiya","Al-Hajj","Al-Mu'minun","An-Nur","Al-Furqan","Ash-Shu'ara","An-Naml","Al-Qasas","Al-Ankabut","Ar-Rum",
  "Luqman","As-Sajda","Al-Ahzab","Saba","Fatir","Ya-Sin","As-Saffat","Sad","Az-Zumar","Ghafir",
  "Fussilat","Ash-Shura","Az-Zukhruf","Ad-Dukhan","Al-Jathiya","Al-Ahqaf","Muhammad","Al-Fath","Al-Hujurat","Qaf",
  "Adh-Dhariyat","At-Tur","An-Najm","Al-Qamar","Ar-Rahman","Al-Waqi'a","Al-Hadid","Al-Mujadila","Al-Hashr","Al-Mumtahana",
  "As-Saff","Al-Jumu'a","Al-Munafiqun","At-Taghabun","At-Talaq","At-Tahrim","Al-Mulk","Al-Qalam","Al-Haqqa","Al-Ma'arij",
  "Nuh","Al-Jinn","Al-Muzzammil","Al-Muddaththir","Al-Qiyama","Al-Insan","Al-Mursalat","An-Naba","An-Nazi'at","Abasa",
  "At-Takwir","Al-Infitar","Al-Mutaffifin","Al-Inshiqaq","Al-Buruj","At-Tariq","Al-A'la","Al-Ghashiya","Al-Fajr","Al-Balad",
  "Ash-Shams","Al-Layl","Ad-Duha","Ash-Sharh","At-Tin","Al-Alaq","Al-Qadr","Al-Bayyina","Az-Zalzala","Al-Adiyat",
  "Al-Qari'a","At-Takathur","Al-Asr","Al-Humaza","Al-Fil","Quraysh","Al-Ma'un","Al-Kawthar","Al-Kafirun","An-Nasr",
  "Al-Masad","Al-Ikhlas","Al-Falaq","An-Nas"
];

// Nombre de versets par sourate (Hafs). Total = 6236.
export const SURAH_VERSES: number[] = [
  7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,
  112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,
  54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,
  14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,
  29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,
  11,8,3,9,5,4,7,3,6,3,5,4,5,6
];

export const TOTAL_VERSES = 6236;

// Pour chaque juz (1 à 30) : [première sourate, dernière sourate] qu'il touche.
// Un juz est "acquis" si TOUTES les sourates de cet intervalle sont connues.
export const JUZ_SURAH_RANGES: [number, number][] = [
  [1,2],[2,2],[2,3],[3,4],[4,4],[4,5],[5,6],[6,7],[7,8],[8,9],
  [9,11],[11,12],[12,14],[15,16],[17,18],[18,20],[21,22],[23,25],[25,27],[27,29],
  [29,33],[33,36],[36,39],[39,41],[41,45],[46,51],[51,57],[58,66],[67,77],[78,114]
];

export const TOTAL_SURAHS = 114;
export const TOTAL_JUZ = 30;

/** Libellé affiché d'une sourate, ex. "1. Al-Fatiha". `id` est 1-indexé. */
export function surahLabel(id: number): string {
  return `${id}. ${SURAH_NAMES[id - 1]}`;
}
