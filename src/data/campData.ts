
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
  { id: 'vaaser', title: 'Vaaser', type: 'ritual', icon: '💧', isMandatory: true, isActive: true },
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
      { id: 'camper_a1', name: 'Isaac Abergel', bunkId: 'kevutzah-alef' },
      { id: 'camper_a2', name: 'Tzvi Abergel', bunkId: 'kevutzah-alef' },
      { id: 'camper_a3', name: 'Mordy Bloom', bunkId: 'kevutzah-alef' },
      { id: 'camper_a4', name: 'Mendel Bortunk', bunkId: 'kevutzah-alef' },
      { id: 'camper_a5', name: 'Avremi Brody', bunkId: 'kevutzah-alef' },
      { id: 'camper_a6', name: 'Mordy Raksin', bunkId: 'kevutzah-alef' },
      { id: 'camper_a7', name: 'Yossi Weiss', bunkId: 'kevutzah-alef' },
      { id: 'camper_a8', name: 'Shimon Myhill', bunkId: 'kevutzah-alef' }
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
      { id: 'camper_b1', name: 'Maor Fellig', bunkId: 'kevutzah-beis' },
      { id: 'camper_b2', name: 'JJ Fischweicher', bunkId: 'kevutzah-beis' },
      { id: 'camper_b3', name: 'Zalman Fischweicher', bunkId: 'kevutzah-beis' },
      { id: 'camper_b4', name: 'Eli Levy', bunkId: 'kevutzah-beis' },
      { id: 'camper_b5', name: 'Tzvi Margolin', bunkId: 'kevutzah-beis' },
      { id: 'camper_b6', name: 'Shmuly Shagalov', bunkId: 'kevutzah-beis' },
      { id: 'camper_b7', name: 'Chaim Silberstein', bunkId: 'kevutzah-beis' },
      { id: 'camper_b8', name: 'Mendel Weic', bunkId: 'kevutzah-beis' },
      { id: 'camper_b9', name: 'Ari Wolff', bunkId: 'kevutzah-beis' }
    ]
  },
  {
    id: 'kevutzah-gimmel',
    name: 'kevutzah-gimmel',
    displayName: 'Kevutzah Gimmel',
    staff: [
      { id: 'staff_g1', name: 'Nosson Oster', bunkId: 'kevutzah-gimmel' }
    ],
    campers: [
      { id: 'camper_g1', name: 'Nachman Yosef Altein', bunkId: 'kevutzah-gimmel' },
      { id: 'camper_g2', name: 'Dovid Bedrick', bunkId: 'kevutzah-gimmel' },
      { id: 'camper_g3', name: 'Yaakov Friedman', bunkId: 'kevutzah-gimmel' },
      { id: 'camper_g4', name: 'Yanky Friedman', bunkId: 'kevutzah-gimmel' },
      { id: 'camper_g5', name: 'Yehuda Halilyan', bunkId: 'kevutzah-gimmel' },
      { id: 'camper_g6', name: 'Nachum Marcus', bunkId: 'kevutzah-gimmel' },
      { id: 'camper_g7', name: 'Shaya Naiditch', bunkId: 'kevutzah-gimmel' },
      { id: 'camper_g8', name: 'Tzvika Weinbaum', bunkId: 'kevutzah-gimmel' },
      { id: 'camper_g9', name: 'Yosef Dov Trojanowski', bunkId: 'kevutzah-gimmel' }
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
      { id: 'camper_d1', name: 'Daniel Braun', bunkId: 'kevutzah-daled' },
      { id: 'camper_d2', name: 'Yoni Cotlar', bunkId: 'kevutzah-daled' },
      { id: 'camper_d3', name: 'Zalmy Epstein', bunkId: 'kevutzah-daled' },
      { id: 'camper_d4', name: 'Mendel Horowitz', bunkId: 'kevutzah-daled' },
      { id: 'camper_d5', name: 'Yisroel Reicher', bunkId: 'kevutzah-daled' },
      { id: 'camper_d6', name: 'Shmuli Smith', bunkId: 'kevutzah-daled' },
      { id: 'camper_d7', name: 'Michai Weiss', bunkId: 'kevutzah-daled' },
      { id: 'camper_d8', name: 'Alan Grimberg', bunkId: 'kevutzah-daled' }
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
      { id: 'camper_h1', name: 'Shiloh Menachem Abarbanel', bunkId: 'kevutzah-hei' },
      { id: 'camper_h2', name: 'Mordechai Barouk', bunkId: 'kevutzah-hei' },
      { id: 'camper_h3', name: 'Menachem Mendel Hankin', bunkId: 'kevutzah-hei' },
      { id: 'camper_h4', name: 'Schneur Zalman Kaplan', bunkId: 'kevutzah-hei' },
      { id: 'camper_h5', name: 'Eliyahu Chaim Kroker', bunkId: 'kevutzah-hei' },
      { id: 'camper_h6', name: 'Ben Nachlas', bunkId: 'kevutzah-hei' },
      { id: 'camper_h7', name: 'Yacov Tawil', bunkId: 'kevutzah-hei' },
      { id: 'camper_h8', name: 'Shmuly Teitelbaum', bunkId: 'kevutzah-hei' },
      { id: 'camper_h9', name: 'Benyamin Young', bunkId: 'kevutzah-hei' }
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
      { id: 'camper_v1', name: 'Dovber Chakoff', bunkId: 'kevutzah-vov' },
      { id: 'camper_v2', name: 'Yehuda Jacobowitz', bunkId: 'kevutzah-vov' },
      { id: 'camper_v3', name: 'Mendel Khaytin', bunkId: 'kevutzah-vov' },
      { id: 'camper_v4', name: 'Yehuda Levin', bunkId: 'kevutzah-vov' },
      { id: 'camper_v5', name: 'Shmuly Pliskin', bunkId: 'kevutzah-vov' },
      { id: 'camper_v6', name: 'Yaakov Posner', bunkId: 'kevutzah-vov' },
      { id: 'camper_v7', name: 'Binyomin Press', bunkId: 'kevutzah-vov' },
      { id: 'camper_v8', name: 'Shneur Zalman Rosenfeld', bunkId: 'kevutzah-vov' }
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
