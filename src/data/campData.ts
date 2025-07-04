
export interface Camper {
  id: string;
  name: string;
  bunkId: string;
}

export interface Staff {
  id: string;
  name: string;
  bunkId: string;
}

export interface Bunk {
  id: string;
  name: string;
  displayName: string;
  staff: Staff[];
  campers: Camper[];
}

export interface Mission {
  id: string;
  title: string;
  type: string;
  icon: string;
  isMandatory: boolean;
  isActive: boolean;
}

export interface SessionConfig {
  currentSession: 1 | 2;
  currentWeek: number;
  currentDay: number;
  sessionLengths: [number, number]; // [session1 weeks, session2 weeks]
}

export const DEFAULT_MISSIONS: Mission[] = [
  { id: 'modeh-ani', title: 'Modeh Ani', type: 'prayer', icon: '🌅', isMandatory: true, isActive: true },
  { id: 'negel-vaaser', title: 'Negel Vaaser', type: 'ritual', icon: '💧', isMandatory: true, isActive: true },
  { id: 'brachos-krias-shema', title: 'Brachos/Krias Shema in morning', type: 'prayer', icon: '📜', isMandatory: true, isActive: true },
  { id: 'krias-shema-night', title: 'Krias Shema/Chesbon Hanefesh at night', type: 'prayer', icon: '🌙', isMandatory: true, isActive: true },
  { id: 'sleep-yarmulka-tzitzis', title: 'Sleep with yarmulka and tzitzis', type: 'mitzvah', icon: '🛏️', isMandatory: true, isActive: true },
  { id: 'mikvah', title: 'Mikvah', type: 'ritual', icon: '🏊', isMandatory: false, isActive: true },
];

export const CAMP_DATA: Bunk[] = [
  {
    id: 'kevutzah-alef',
    name: 'kevutzah-alef',
    displayName: 'Kevutzah Alef',
    staff: [
      { id: 'staff_a1', name: 'Rabbi Cohen', bunkId: 'kevutzah-alef' },
      { id: 'staff_a2', name: 'Moshe Levy', bunkId: 'kevutzah-alef' }
    ],
    campers: [
      { id: 'camper_a1', name: 'Yaakov Goldstein', bunkId: 'kevutzah-alef' },
      { id: 'camper_a2', name: 'Mendy Rosen', bunkId: 'kevutzah-alef' },
      { id: 'camper_a3', name: 'Shmuel Klein', bunkId: 'kevutzah-alef' },
      { id: 'camper_a4', name: 'Dovid Schwartz', bunkId: 'kevutzah-alef' },
      { id: 'camper_a5', name: 'Yosef Friedman', bunkId: 'kevutzah-alef' },
      { id: 'camper_a6', name: 'Zalman Weiss', bunkId: 'kevutzah-alef' },
      { id: 'camper_a7', name: 'Levi Katz', bunkId: 'kevutzah-alef' },
      { id: 'camper_a8', name: 'Mendel Green', bunkId: 'kevutzah-alef' },
      { id: 'camper_a9', name: 'Shimon Blue', bunkId: 'kevutzah-alef' }
    ]
  },
  {
    id: 'kevutzah-beis',
    name: 'kevutzah-beis',
    displayName: 'Kevutzah Beis',
    staff: [
      { id: 'staff_b1', name: 'Rabbi Shapiro', bunkId: 'kevutzah-beis' },
      { id: 'staff_b2', name: 'Avraham Miller', bunkId: 'kevutzah-beis' }
    ],
    campers: [
      { id: 'camper_b1', name: 'Chaim Rosenberg', bunkId: 'kevutzah-beis' },
      { id: 'camper_b2', name: 'Eliezer Brown', bunkId: 'kevutzah-beis' },
      { id: 'camper_b3', name: 'Yehuda White', bunkId: 'kevutzah-beis' },
      { id: 'camper_b4', name: 'Moshe Silver', bunkId: 'kevutzah-beis' },
      { id: 'camper_b5', name: 'Shneur Gold', bunkId: 'kevutzah-beis' },
      { id: 'camper_b6', name: 'Baruch Stone', bunkId: 'kevutzah-beis' },
      { id: 'camper_b7', name: 'Yitzchak Diamond', bunkId: 'kevutzah-beis' },
      { id: 'camper_b8', name: 'Aharon Crystal', bunkId: 'kevutzah-beis' }
    ]
  },
  {
    id: 'kevutzah-gimmel',
    name: 'kevutzah-gimmel',
    displayName: 'Kevutzah Gimmel',
    staff: [
      { id: 'staff_g1', name: 'Rabbi Goldberg', bunkId: 'kevutzah-gimmel' },
      { id: 'staff_g2', name: 'Yosef Stern', bunkId: 'kevutzah-gimmel' }
    ],
    campers: [
      { id: 'camper_g1', name: 'Naftali Hoffman', bunkId: 'kevutzah-gimmel' },
      { id: 'camper_g2', name: 'Boruch Fishman', bunkId: 'kevutzah-gimmel' },
      { id: 'camper_g3', name: 'Tzvi Newman', bunkId: 'kevutzah-gimmel' },
      { id: 'camper_g4', name: 'Yisroel Mann', bunkId: 'kevutzah-gimmel' },
      { id: 'camper_g5', name: 'Avraham Wolf', bunkId: 'kevutzah-gimmel' },
      { id: 'camper_g6', name: 'Mendel Fox', bunkId: 'kevutzah-gimmel' },
      { id: 'camper_g7', name: 'Sholom Bear', bunkId: 'kevutzah-gimmel' },
      { id: 'camper_g8', name: 'Pinchus Lamb', bunkId: 'kevutzah-gimmel' },
      { id: 'camper_g9', name: 'Ephraim Lion', bunkId: 'kevutzah-gimmel' }
    ]
  },
  {
    id: 'kevutzah-daled',
    name: 'kevutzah-daled',
    displayName: 'Kevutzah Daled',
    staff: [
      { id: 'staff_d1', name: 'Rabbi Greenberg', bunkId: 'kevutzah-daled' },
      { id: 'staff_d2', name: 'Shalom Davis', bunkId: 'kevutzah-daled' }
    ],
    campers: [
      { id: 'camper_d1', name: 'Mordechai Rain', bunkId: 'kevutzah-daled' },
      { id: 'camper_d2', name: 'Yehoshua Snow', bunkId: 'kevutzah-daled' },
      { id: 'camper_d3', name: 'Binyamin Wind', bunkId: 'kevutzah-daled' },
      { id: 'camper_d4', name: 'Gershon Storm', bunkId: 'kevutzah-daled' },
      { id: 'camper_d5', name: 'Daniel Fire', bunkId: 'kevutzah-daled' },
      { id: 'camper_d6', name: 'Aryeh Earth', bunkId: 'kevutzah-daled' },
      { id: 'camper_d7', name: 'Zev Ocean', bunkId: 'kevutzah-daled' },
      { id: 'camper_d8', name: 'Asher Mountain', bunkId: 'kevutzah-daled' }
    ]
  },
  {
    id: 'kevutzah-hei',
    name: 'kevutzah-hei',
    displayName: 'Kevutzah Hei',
    staff: [
      { id: 'staff_h1', name: 'Rabbi Goldstein', bunkId: 'kevutzah-hei' },
      { id: 'staff_h2', name: 'Mordechai King', bunkId: 'kevutzah-hei' }
    ],
    campers: [
      { id: 'camper_h1', name: 'Yosef Moon', bunkId: 'kevutzah-hei' },
      { id: 'camper_h2', name: 'Eliyahu Star', bunkId: 'kevutzah-hei' },
      { id: 'camper_h3', name: 'Menachem Sun', bunkId: 'kevutzah-hei' },
      { id: 'camper_h4', name: 'Yankel Sky', bunkId: 'kevutzah-hei' },
      { id: 'camper_h5', name: 'Shmuel River', bunkId: 'kevutzah-hei' },
      { id: 'camper_h6', name: 'Zalman Lake', bunkId: 'kevutzah-hei' },
      { id: 'camper_h7', name: 'Levi Valley', bunkId: 'kevutzah-hei' },
      { id: 'camper_h8', name: 'Dovid Hill', bunkId: 'kevutzah-hei' },
      { id: 'camper_h9', name: 'Nachman Field', bunkId: 'kevutzah-hei' }
    ]
  },
  {
    id: 'kevutzah-vov',
    name: 'kevutzah-vov',
    displayName: 'Kevutzah Vov',
    staff: [
      { id: 'staff_v1', name: 'Rabbi Silverstein', bunkId: 'kevutzah-vov' },
      { id: 'staff_v2', name: 'Chaim Prince', bunkId: 'kevutzah-vov' }
    ],
    campers: [
      { id: 'camper_v1', name: 'Yisrael Rock', bunkId: 'kevutzah-vov' },
      { id: 'camper_v2', name: 'Avraham Stone', bunkId: 'kevutzah-vov' },
      { id: 'camper_v3', name: 'Yitzchok Pearl', bunkId: 'kevutzah-vov' },
      { id: 'camper_v4', name: 'Moshe Gem', bunkId: 'kevutzah-vov' },
      { id: 'camper_v5', name: 'Shneur Crystal', bunkId: 'kevutzah-vov' },
      { id: 'camper_v6', name: 'Yehuda Ruby', bunkId: 'kevutzah-vov' },
      { id: 'camper_v7', name: 'Sholom Jade', bunkId: 'kevutzah-vov' },
      { id: 'camper_v8', name: 'Mendel Opal', bunkId: 'kevutzah-vov' }
    ]
  }
];

export const SESSION_CONFIG: SessionConfig = {
  currentSession: 1,
  currentWeek: 2,
  currentDay: 3,
  sessionLengths: [4, 3]
};

export const REQUIRED_MISSIONS_COUNT = 5; // Need to complete at least 5 missions to qualify
