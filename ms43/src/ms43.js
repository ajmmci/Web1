// Moteur MS43 : detection de la version SW et application des recettes.
// Tourne dans le navigateur, sans envoi du fichier a un serveur.
// Le moteur n'ecrit que les valeurs des recettes et ne calcule aucune valeur de calibration.
// Les checksums ne sont pas touches : le flasher les corrige a l'ecriture.

export const IMAGE_SIZE = 0x80000;
export const SW_OFFSET = 0x70042;
export const PROGRAM_SW_OFFSET = 0x6ffba;
export const SW_LENGTH = 6;
export const KNOWN_SOFTWARE = ['430037', '430055', '430056', '430064', '430066', '430069'];
export const ENGINES = ['B22', 'B25', 'B30'];

// Memes adresses que 430069, seule l'echelle de charge change : l'identifiant SW ne les distingue pas.
const VARIANTS = { 430069: ['430069', '430069_ExtendedLoad'] };

// Aucune recette ne peut ecrire dans ces categories (depollution, diagnostic, antidemarrage).
export const FORBIDDEN_CATEGORIES = [
  'Canister Purge', 'Catalyst', 'Diagnostic Trouble Codes', 'DMTL', 'DTC Suppression',
  'EWS', 'Misfire', 'OBD', 'Secondary Air',
];

// Ces maps sont classees ailleurs dans les XDF (Config Switches, Lambda...) mais relevent du meme perimetre.
export const FORBIDDEN_MAPS = [
  'c_conf_cat', 'c_conf_dmtl', 'c_conf_eobd', 'c_conf_lam_sav_diag', 'c_conf_mil', 'c_conf_mil_eu2',
  'c_conf_sap', 'c_conf_sav_diag', 'lc_diag_actchk_vls_down_ready', 'lc_lam_dly_down',
];
const FORBIDDEN_TITLE = /imob|(^|_)(vls|lsh)_down/;

export function isForbidden(map) {
  return map.categories.some((c) => FORBIDDEN_CATEGORIES.includes(c))
    || FORBIDDEN_MAPS.includes(map.title)
    || FORBIDDEN_TITLE.test(map.title);
}

function readId(bytes, offset) {
  return String.fromCharCode(...bytes.subarray(offset, offset + SW_LENGTH));
}

export function detectSoftware(bytes) {
  if (bytes.length !== IMAGE_SIZE) {
    return { status: 'bad_size', size: bytes.length, expected: IMAGE_SIZE };
  }
  const id = readId(bytes, SW_OFFSET);
  const hex = [...bytes.subarray(SW_OFFSET, SW_OFFSET + SW_LENGTH)].map((b) => b.toString(16).padStart(2, '0')).join(' ');
  if (!KNOWN_SOFTWARE.includes(id)) return { status: 'unknown', raw: hex };
  const programId = readId(bytes, PROGRAM_SW_OFFSET);
  if (programId !== id) return { status: 'inconsistent', software: id, program: programId };
  return { status: 'known', software: id, variants: VARIANTS[id] ?? [id] };
}

// Tags de modele -> base moteur (badges marketing M54, d'apres Wikipedia). Chaque groupe de chiffres
// doit correspondre EN ENTIER, donc 430069, M54 ou EU4 ne declenchent rien. 20/25/30 = cylindree.
// Les chassis seuls (Z3/Z4/X3/X5) ne figurent pas : une meme caisse recoit plusieurs moteurs.
export const ENGINE_ALIASES = {
  20: 'B22', 320: 'B22', 520: 'B22', // 320i/320Ci (E46), 520i (E39/E60), Z3 2.2i, Z4 2.2i
  25: 'B25', 325: 'B25', 525: 'B25', // 325i/325xi/325Ci/325ti (E46), 525i/525xi (E39/E60), X3 2.5i, Z4 2.5i, Z3 2.5i
  30: 'B30', 330: 'B30', 530: 'B30', 730: 'B30', // 330i/330xi/330Ci (E46), 530i (E39/E60), 730i/730Li (E65), X3/X5 3.0i, Z4/Z3 3.0i
};

// Reconnait la base moteur dans le nom : B22/B25/B30 (seul ou dans M54B30) et les tags de modele.
export function detectEngine(fileName) {
  const found = new Set();
  for (const m of fileName.matchAll(/(?<![A-Za-z])B(22|25|30)(?!\d)/gi)) found.add(`B${m[1]}`);
  for (const m of fileName.matchAll(/\d+/g)) {
    const engine = ENGINE_ALIASES[m[0]];
    if (engine) found.add(engine);
  }
  if (found.size === 1) return { status: 'known', engine: [...found][0] };
  return { status: found.size === 0 ? 'missing' : 'ambiguous', found: [...found] };
}

// Seules les formules lineaires sont acceptees : une formule non reconnue rend la map inutilisable.
export function parseEquation(equation) {
  const text = equation.replace(/\s/g, '');
  const number = '[+-]?\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?';
  let m;
  if (text === 'X') return { factor: 1, offset: 0 };
  if ((m = text.match(new RegExp(`^X\\*(${number})$`)))) return { factor: Number(m[1]), offset: 0 };
  if ((m = text.match(new RegExp(`^(${number})\\*X(${number})?$`)))) {
    const hasSign = m[2] === undefined || /^[+-]/.test(m[2]);
    if (hasSign) return { factor: Number(m[1]), offset: m[2] ? Number(m[2]) : 0 };
  }
  return null;
}

export function findMap(def, title) {
  const found = def.maps.filter((m) => m.title === title);
  if (found.length !== 1) throw new Error(`Map "${title}" : ${found.length} resultat(s) dans ${def.software}`);
  return found[0];
}

function elementOffset(map, index) {
  return map.file_offset + index * (map.bits / 8);
}

function readRaw(bytes, map, index) {
  const size = map.bits / 8;
  const start = elementOffset(map, index);
  if (start < 0 || start + size > bytes.length) throw new Error(`${map.title} : adresse hors du fichier`);
  let value = 0;
  for (let i = 0; i < size; i++) {
    const position = map.lsb_first ? i : size - 1 - i;
    value += bytes[start + i] * 2 ** (8 * position);
  }
  return map.signed && value >= 2 ** (map.bits - 1) ? value - 2 ** map.bits : value;
}

function writeRaw(bytes, map, index, value) {
  const min = map.signed ? -(2 ** (map.bits - 1)) : 0;
  const max = map.signed ? 2 ** (map.bits - 1) - 1 : 2 ** map.bits - 1;
  if (value < min || value > max) throw new Error(`${map.title} : valeur brute ${value} hors limites`);
  const size = map.bits / 8;
  const start = elementOffset(map, index);
  let unsigned = value < 0 ? value + 2 ** map.bits : value;
  for (let i = 0; i < size; i++) {
    const position = map.lsb_first ? i : size - 1 - i;
    bytes[start + position] = unsigned % 256;
    unsigned = Math.floor(unsigned / 256);
  }
}

function scaling(map) {
  const scale = parseEquation(map.equation);
  if (!scale || scale.factor === 0) throw new Error(`${map.title} : formule non prise en charge (${map.equation})`);
  return scale;
}

export function readMap(bytes, map) {
  const { factor, offset } = scaling(map);
  const count = map.rows * map.cols;
  return Array.from({ length: count }, (_, i) => readRaw(bytes, map, i) * factor + offset);
}

function writeMap(bytes, map, values, result) {
  if (isForbidden(map)) {
    throw new Error(`${map.title} : ecriture refusee (categorie ${map.categories.join(', ')})`);
  }
  const count = map.rows * map.cols;
  if (!Array.isArray(values) || values.length !== count) {
    throw new Error(`${map.title} : ${count} valeur(s) attendue(s)`);
  }
  if (!values.every(Number.isFinite)) throw new Error(`${map.title} : valeur non numerique`);

  const { factor, offset } = scaling(map);
  values.forEach((requested, i) => {
    const before = readRaw(bytes, map, i);
    const after = Math.round((requested - offset) / factor);
    const applied = after * factor + offset;
    if (Math.abs(applied - requested) > Math.abs(factor) * 1e-6) {
      result.rounded.push({ map: map.title, index: i, requested, applied, units: map.units });
    }
    if (before === after) return;
    writeRaw(bytes, map, i, after);
    result.changes.push({
      map: map.title,
      index: i,
      file_offset: elementOffset(map, i),
      before: before * factor + offset,
      after: applied,
      units: map.units,
    });
  });
}

// Une table n'a de sens qu'avec ses axes : si ceux du fichier different de la reference, on refuse.
function checkAxes(bytes, def, axes) {
  for (const axis of axes ?? []) {
    const map = findMap(def, axis.map);
    const { factor } = scaling(map);
    const current = readMap(bytes, map);
    const same = current.length === axis.values.length
      && current.every((v, i) => Math.abs(v - axis.values[i]) < Math.abs(factor) / 2);
    if (!same) throw new Error(`Axe ${axis.map} different de la reference de la recette`);
  }
}

// Recette : { name, software: ['430069'], engines: ['B30'], writes: [{ map: 'nom_xdf', values: [...], axes: [...] }] }
// Valeurs en unites physiques. Toute erreur annule l'ensemble : pas de fichier partiellement modifie.
export function applyRecipes(original, def, engine, recipes) {
  const detected = detectSoftware(original);
  if (detected.status !== 'known') throw new Error('Fichier non reconnu : aucune modification appliquee');
  if (!detected.variants.includes(def.software)) {
    throw new Error(`Definition ${def.software} incompatible avec le SW ${detected.software}`);
  }
  if (!ENGINES.includes(engine)) throw new Error(`Base moteur inconnue : ${engine}`);

  const bytes = original.slice();
  const result = { bytes, changes: [], rounded: [] };
  const written = new Set();
  for (const recipe of recipes) {
    if (!recipe.software.includes(def.software)) throw new Error(`Recette "${recipe.name}" non prevue pour le SW ${def.software}`);
    if (!recipe.engines.includes(engine)) throw new Error(`Recette "${recipe.name}" non prevue pour ${engine}`);
    for (const { map: title, values, axes } of recipe.writes) {
      if (written.has(title)) throw new Error(`Map "${title}" ecrite par plusieurs recettes`);
      written.add(title);
      checkAxes(bytes, def, axes);
      writeMap(bytes, findMap(def, title), values, result);
    }
  }
  return result;
}
