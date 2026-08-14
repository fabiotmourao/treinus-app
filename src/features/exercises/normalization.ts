export type ExerciseBodyView = 'front' | 'back' | 'both';

export type NormalizedExerciseGroup = {
  key: string;
  label: string;
  bodyView: ExerciseBodyView;
};

type GroupRule = NormalizedExerciseGroup & {
  tokens: string[];
};

const FRONT_GROUPS: NormalizedExerciseGroup[] = [
  { key: 'shoulders', label: 'Ombros', bodyView: 'front' },
  { key: 'chest', label: 'Peitoral', bodyView: 'front' },
  { key: 'biceps', label: 'Bíceps', bodyView: 'front' },
  { key: 'abdomen', label: 'Abdômen', bodyView: 'front' },
  { key: 'obliques', label: 'Oblíquos', bodyView: 'front' },
  { key: 'forearms', label: 'Antebraços', bodyView: 'front' },
  { key: 'abductors', label: 'Abdutores', bodyView: 'front' },
  { key: 'adductors', label: 'Adutores', bodyView: 'front' },
  { key: 'quadriceps', label: 'Quadriceps', bodyView: 'front' },
  { key: 'cardio', label: 'Cardio', bodyView: 'both' },
];

const BACK_GROUPS: NormalizedExerciseGroup[] = [
  { key: 'trapezius', label: 'Trapézio', bodyView: 'back' },
  { key: 'triceps', label: 'Tríceps', bodyView: 'back' },
  { key: 'lats', label: 'Dorsais', bodyView: 'back' },
  { key: 'lower_back', label: 'Lombares', bodyView: 'back' },
  { key: 'glutes', label: 'Glúteos', bodyView: 'back' },
  { key: 'hamstrings', label: 'Isquiotibiais', bodyView: 'back' },
  { key: 'calves', label: 'Panturrilhas', bodyView: 'back' },
  { key: 'cardio', label: 'Cardio', bodyView: 'both' },
];

const GROUPS_BY_KEY = new Map<string, NormalizedExerciseGroup>(
  [...FRONT_GROUPS, ...BACK_GROUPS].map((group) => [group.key, group])
);

const GROUP_RULES: GroupRule[] = [
  { key: 'cardio', label: 'Cardio', bodyView: 'both', tokens: ['cardio', 'aerob'] },
  { key: 'shoulders', label: 'Ombros', bodyView: 'front', tokens: ['shoulder', 'deltoid'] },
  { key: 'chest', label: 'Peitoral', bodyView: 'front', tokens: ['chest', 'pectoral', 'pec'] },
  { key: 'biceps', label: 'Bíceps', bodyView: 'front', tokens: ['biceps'] },
  { key: 'abdomen', label: 'Abdômen', bodyView: 'front', tokens: ['abs', 'abdom'] },
  { key: 'obliques', label: 'Oblíquos', bodyView: 'front', tokens: ['oblique'] },
  { key: 'forearms', label: 'Antebraços', bodyView: 'front', tokens: ['forearm', 'lower arm', 'brachioradialis'] },
  { key: 'abductors', label: 'Abdutores', bodyView: 'front', tokens: ['abductor'] },
  { key: 'adductors', label: 'Adutores', bodyView: 'front', tokens: ['adductor'] },
  { key: 'quadriceps', label: 'Quadriceps', bodyView: 'front', tokens: ['quadricep', 'quad'] },
  { key: 'trapezius', label: 'Trapézio', bodyView: 'back', tokens: ['trapez', 'neck'] },
  { key: 'triceps', label: 'Tríceps', bodyView: 'back', tokens: ['triceps'] },
  { key: 'lats', label: 'Dorsais', bodyView: 'back', tokens: ['lats', 'latissimus', 'upper back', 'middle back', 'back'] },
  {
    key: 'lower_back',
    label: 'Lombares',
    bodyView: 'back',
    tokens: ['lower back', 'lumbar', 'spinal erector', 'erector spinae'],
  },
  { key: 'glutes', label: 'Glúteos', bodyView: 'back', tokens: ['glute'] },
  { key: 'hamstrings', label: 'Isquiotibiais', bodyView: 'back', tokens: ['hamstring'] },
  { key: 'calves', label: 'Panturrilhas', bodyView: 'back', tokens: ['calves', 'calf', 'lower leg'] },
];

const BODY_PART_FALLBACK: Record<string, string> = {
  shoulders: 'shoulders',
  chest: 'chest',
  waist: 'abdomen',
  'lower arms': 'forearms',
  'upper arms': 'biceps',
  'upper legs': 'quadriceps',
  'lower legs': 'calves',
  back: 'lats',
  neck: 'trapezius',
  cardio: 'cardio',
};

const TERM_TRANSLATIONS: Record<string, string> = {
  cardio: 'Cardio',
  shoulders: 'Ombros',
  chest: 'Peitoral',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  forearms: 'Antebraços',
  quadriceps: 'Quadríceps',
  hamstrings: 'Isquiotibiais',
  calves: 'Panturrilhas',
  glutes: 'Glúteos',
  abductors: 'Abdutores',
  adductors: 'Adutores',
  lats: 'Dorsais',
  traps: 'Trapézio',
  trapezius: 'Trapézio',
  abs: 'Abdômen',
  obliques: 'Oblíquos',
  waist: 'Abdômen',
  back: 'Costas',
  neck: 'Pescoço',
  'upper arms': 'Braços superiores',
  'lower arms': 'Antebraços',
  'upper legs': 'Coxas anteriores',
  'lower legs': 'Panturrilhas',
  bodyweight: 'Peso corporal',
  barbell: 'Barra',
  dumbbell: 'Halter',
  cable: 'Polia',
  kettlebell: 'Kettlebell',
  machine: 'Máquina',
  band: 'Faixa elástica',
  rope: 'Corda',
  medicine: 'Medicine ball',
  ball: 'Bola',
  trap: 'Trap bar',
  smith: 'Smith machine',
  ez: 'Barra EZ',
};

function normalizeToken(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function includesToken(base: string, token: string): boolean {
  return base.includes(token) || token.includes(base);
}

function findGroupByText(text: string): GroupRule | null {
  if (!text) {
    return null;
  }

  const normalizedText = normalizeToken(text);
  for (const rule of GROUP_RULES) {
    const matched = rule.tokens.some((token) => includesToken(normalizedText, normalizeToken(token)));
    if (matched) {
      return rule;
    }
  }

  return null;
}

export function translateApiTerm(value: string): string {
  const normalized = normalizeToken(value);
  if (!normalized) {
    return value;
  }

  if (TERM_TRANSLATIONS[normalized]) {
    return TERM_TRANSLATIONS[normalized];
  }

  return value;
}

export function normalizeExerciseGroup(input: {
  bodyPart: string;
  target: string;
  tags?: string[];
}): NormalizedExerciseGroup {
  const tags = input.tags ?? [];
  const searchable = [input.target, input.bodyPart, ...tags].filter(Boolean);

  for (const chunk of searchable) {
    const group = findGroupByText(chunk);
    if (group) {
      return { key: group.key, label: group.label, bodyView: group.bodyView };
    }
  }

  const bodyPartKey = BODY_PART_FALLBACK[normalizeToken(input.bodyPart)];
  if (bodyPartKey && GROUPS_BY_KEY.has(bodyPartKey)) {
    return GROUPS_BY_KEY.get(bodyPartKey)!;
  }

  return GROUPS_BY_KEY.get('cardio')!;
}

export function getGroupsForView(view: 'front' | 'back'): NormalizedExerciseGroup[] {
  return view === 'front' ? FRONT_GROUPS : BACK_GROUPS;
}
