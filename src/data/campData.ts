
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
  { id: 'modeh-ani', title: 'Modeh ani', type: 'prayer', icon: '🌅', isMandatory: true, isActive: true },
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
      { id: 'staff_a1', name: 'Mendy Zalmanov', bunkId: 'kevutzah-alef' }
    ],
    campers: [
      { id: 'camper_a1', name: 'Yoel Bistricer', bunkId: 'kevutzah-alef' },
      { id: 'camper_a2', name: 'Bentzi Glick', bunkId: 'kevutzah-alef' },
      { id: 'camper_a3', name: 'Yochanan Homnick', bunkId: 'kevutzah-alef' },
      { id: 'camper_a4', name: 'Levi Kaplan', bunkId: 'kevutzah-alef' },
      { id: 'camper_a5', name: 'Simcha Levenson', bunkId: 'kevutzah-alef' },
      { id: 'camper_a6', name: 'Mendel Lipsker', bunkId: 'kevutzah-alef' },
      { id: 'camper_a7', name: 'Yisroel Mishulovin', bunkId: 'kevutzah-alef' },
      { id: 'camper_a8', name: 'Mendy Serebryanski', bunkId: 'kevutzah-alef' }
    ]
  },
  {
    id: 'kevutzah-beis',
    name: 'kevutzah-beis',
    displayName: 'Kevutzah Beis',
    staff: [
      { id: 'staff_b1', name: 'Moshe Young', bunkId: 'kevutzah-beis' }
    ],
    campers: [
      { id: 'camper_b1', name: 'Sholom Ber Barkahn', bunkId: 'kevutzah-beis' },
      { id: 'camper_b2', name: 'Mendy Blau', bunkId: 'kevutzah-beis' },
      { id: 'camper_b3', name: 'Zalman Flint', bunkId: 'kevutzah-beis' },
      { id: 'camper_b4', name: 'Menachem Mendel Goldberg', bunkId: 'kevutzah-beis' },
      { id: 'camper_b5', name: 'Shneur Zalman Greenberg', bunkId: 'kevutzah-beis' },
      { id: 'camper_b6', name: 'Mendel Kastel', bunkId: 'kevutzah-beis' },
      { id: 'camper_b7', name: 'Yehoshua Nochum Plotkin', bunkId: 'kevutzah-beis' },
      { id: 'camper_b8', name: 'Mendel Ruderman', bunkId: 'kevutzah-beis' },
      { id: 'camper_b9', name: 'Zalman Spritzer', bunkId: 'kevutzah-beis' }
    ]
  },
  {
    id: 'kevutzah-gimmel',
    name: 'kevutzah-gimmel',
    displayName: 'Kevutzah Gimmel',
    staff: [
      { id: 'staff_g1', name: 'Nosson oster', bunkId: 'kevutzah-gimmel' }
    ],
    campers: [
      { id: 'camper_g1', name: 'Mendy Bogomilsky', bunkId: 'kevutzah-gimmel' },
      { id: 'camper_g2', name: 'Dovid Schochet', bunkId: 'kevutzah-gimmel' },
      { id: 'camper_g3', name: 'Shlomo Goldberg', bunkId: 'kevutzah-gimmel' },
      { id: 'camper_g4', name: 'Levi Goldstein', bunkId: 'kevutzah-gimmel' },
      { id: 'camper_g5', name: 'Yisroel Greenberg', bunkId: 'kevutzah-gimmel' },
      { id: 'camper_g6', name: 'Mordechi Rivkin', bunkId: 'kevutzah-gimmel' },
      { id: 'camper_g7', name: 'Moishy Rodkin', bunkId: 'kevutzah-gimmel' },
      { id: 'camper_g8', name: 'Shneur Zalman Seltzer', bunkId: 'kevutzah-gimmel' },
      { id: 'camper_g9', name: 'Velvel Tenenbaum', bunkId: 'kevutzah-gimmel' }
    ]
  },
  {
    id: 'kevutzah-daled',
    name: 'kevutzah-daled',
    displayName: 'Kevutzah Daled',
    staff: [
      { id: 'staff_d1', name: 'Dovi Cadaner', bunkId: 'kevutzah-daled' }
    ],
    campers: [
      { id: 'camper_d1', name: 'Shmuel Bukiet', bunkId: 'kevutzah-daled' },
      { id: 'camper_d2', name: 'Levi Gluck', bunkId: 'kevutzah-daled' },
      { id: 'camper_d3', name: 'Bentzi Korf', bunkId: 'kevutzah-daled' },
      { id: 'camper_d4', name: 'Yochanan Laine', bunkId: 'kevutzah-daled' },
      { id: 'camper_d5', name: 'Yisroel Meir Mishulovin', bunkId: 'kevutzah-daled' },
      { id: 'camper_d6', name: 'Motti Rivkin', bunkId: 'kevutzah-daled' },
      { id: 'camper_d7', name: 'Shmuel Zalman Schreiber', bunkId: 'kevutzah-daled' },
      { id: 'camper_d8', name: 'Levi Strikovsky', bunkId: 'kevutzah-daled' }
    ]
  },
  {
    id: 'kevutzah-hei',
    name: 'kevutzah-hei',
    displayName: 'Kevutzah Hei',
    staff: [
      { id: 'staff_h1', name: 'A B Stolik', bunkId: 'kevutzah-hei' }
    ],
    campers: [
      { id: 'camper_h1', name: 'Mattan Eckstein', bunkId: 'kevutzah-hei' },
      { id: 'camper_h2', name: 'Dovid Gancz', bunkId: 'kevutzah-hei' },
      { id: 'camper_h3', name: 'Mendy Hendel', bunkId: 'kevutzah-hei' },
      { id: 'camper_h4', name: 'Mendy Hivert', bunkId: 'kevutzah-hei' },
      { id: 'camper_h5', name: 'Shmuel Kesselman', bunkId: 'kevutzah-hei' },
      { id: 'camper_h6', name: 'Yisroel Moshe Kotlarsky', bunkId: 'kevutzah-hei' },
      { id: 'camper_h7', name: 'Mendy Kurant', bunkId: 'kevutzah-hei' },
      { id: 'camper_h8', name: 'Dovid Nissan', bunkId: 'kevutzah-hei' },
      { id: 'camper_h9', name: 'Mendy Schecter', bunkId: 'kevutzah-hei' }
    ]
  },
  {
    id: 'kevutzah-vov',
    name: 'kevutzah-vov',
    displayName: 'Kevutzah Vov',
    staff: [
      { id: 'staff_v1', name: 'Uziel Wagner', bunkId: 'kevutzah-vov' }
    ],
    campers: [
      { id: 'camper_v1', name: 'Levi Greenwald', bunkId: 'kevutzah-vov' },
      { id: 'camper_v2', name: 'Yisroel Halperin', bunkId: 'kevutzah-vov' },
      { id: 'camper_v3', name: 'Tzvi Hirsch Kesselman', bunkId: 'kevutzah-vov' },
      { id: 'camper_v4', name: 'Levi Kraus', bunkId: 'kevutzah-vov' },
      { id: 'camper_v5', name: 'Yehoshua Landa', bunkId: 'kevutzah-vov' },
      { id: 'camper_v6', name: 'Mendel Munitz', bunkId: 'kevutzah-vov' },
      { id: 'camper_v7', name: 'Mendel Yitzchok Slonim', bunkId: 'kevutzah-vov' },
      { id: 'camper_v8', name: 'Chaim Yitzchok Zaklikovsky', bunkId: 'kevutzah-vov' }
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
