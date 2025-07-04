
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
    id: 'alef',
    name: 'alef',
    displayName: 'Alef',
    staff: [
      { id: 'staff_mendy_z', name: 'Mendy Zalmanov', bunkId: 'alef' }
    ],
    campers: [
      { id: 'isaac_abergel', name: 'Isaac Abergel', bunkId: 'alef' },
      { id: 'tzvi_abergel', name: 'Tzvi Abergel', bunkId: 'alef' },
      { id: 'mordy_bloom', name: 'Mordy Bloom', bunkId: 'alef' },
      { id: 'mendel_bortunk', name: 'Mendel Bortunk', bunkId: 'alef' },
      { id: 'avremi_brody', name: 'Avremi Brody', bunkId: 'alef' },
      { id: 'mordy_raksin', name: 'Mordy Raksin', bunkId: 'alef' },
      { id: 'yossi_weiss', name: 'Yossi Weiss', bunkId: 'alef' },
      { id: 'shimon_myhill', name: 'Shimon Myhill', bunkId: 'alef' }
    ]
  },
  {
    id: 'beis',
    name: 'beis',
    displayName: 'Beis',
    staff: [
      { id: 'staff_moshe_y', name: 'Moshe Young', bunkId: 'beis' }
    ],
    campers: [
      { id: 'maor_fellig', name: 'Maor Fellig', bunkId: 'beis' },
      { id: 'jj_fischweicher', name: 'JJ Fischweicher', bunkId: 'beis' },
      { id: 'zalman_fischweicher', name: 'Zalman Fischweicher', bunkId: 'beis' },
      { id: 'eli_levy', name: 'Eli Levy', bunkId: 'beis' },
      { id: 'tzvi_margolin', name: 'Tzvi Margolin', bunkId: 'beis' },
      { id: 'shmuly_shagalov', name: 'Shmuly Shagalov', bunkId: 'beis' },
      { id: 'chaim_silberstein', name: 'Chaim Silberstein', bunkId: 'beis' },
      { id: 'mendel_weic', name: 'Mendel Weic', bunkId: 'beis' },
      { id: 'ari_wolff', name: 'Ari Wolff', bunkId: 'beis' }
    ]
  },
  {
    id: 'gimmel',
    name: 'gimmel',
    displayName: 'Gimmel',
    staff: [
      { id: 'staff_nosson_o', name: 'Nosson Oster', bunkId: 'gimmel' }
    ],
    campers: [
      { id: 'nachman_altein', name: 'Nachman Yosef Altein', bunkId: 'gimmel' },
      { id: 'dovid_bedrick', name: 'Dovid Bedrick', bunkId: 'gimmel' },
      { id: 'yaakov_friedman', name: 'Yaakov Friedman', bunkId: 'gimmel' },
      { id: 'yanky_friedman', name: 'Yanky Friedman', bunkId: 'gimmel' },
      { id: 'yehuda_halilyan', name: 'Yehuda Halilyan', bunkId: 'gimmel' },
      { id: 'nachum_marcus', name: 'Nachum Marcus', bunkId: 'gimmel' },
      { id: 'shaya_naiditch', name: 'Shaya Naiditch', bunkId: 'gimmel' },
      { id: 'tzvika_weinbaum', name: 'Tzvika Weinbaum', bunkId: 'gimmel' },
      { id: 'yosef_trojanowski', name: 'Yosef Dov Trojanowski', bunkId: 'gimmel' }
    ]
  },
  {
    id: 'daled',
    name: 'daled',
    displayName: 'Daled',
    staff: [
      { id: 'staff_dovi_c', name: 'Dovi Cadaner', bunkId: 'daled' }
    ],
    campers: [
      { id: 'daniel_braun', name: 'Daniel Braun', bunkId: 'daled' },
      { id: 'yoni_cotlar', name: 'Yoni Cotlar', bunkId: 'daled' },
      { id: 'zalmy_epstein', name: 'Zalmy Epstein', bunkId: 'daled' },
      { id: 'mendel_horowitz', name: 'Mendel Horowitz', bunkId: 'daled' },
      { id: 'yisroel_reicher', name: 'Yisroel Reicher', bunkId: 'daled' },
      { id: 'shmuli_smith', name: 'Shmuli Smith', bunkId: 'daled' },
      { id: 'michai_weiss', name: 'Michai Weiss', bunkId: 'daled' },
      { id: 'alan_grimberg', name: 'Alan Grimberg', bunkId: 'daled' }
    ]
  },
  {
    id: 'hei',
    name: 'hei',
    displayName: 'Hei',
    staff: [
      { id: 'staff_ab_s', name: 'A B Stolik', bunkId: 'hei' }
    ],
    campers: [
      { id: 'shiloh_abarbanel', name: 'Shiloh Menachem Abarbanel', bunkId: 'hei' },
      { id: 'mordechai_barouk', name: 'Mordechai Barouk', bunkId: 'hei' },
      { id: 'menachem_hankin', name: 'Menachem Mendel Hankin', bunkId: 'hei' },
      { id: 'schneur_kaplan', name: 'Schneur Zalman Kaplan', bunkId: 'hei' },
      { id: 'eliyahu_kroker', name: 'Eliyahu Chaim Kroker', bunkId: 'hei' },
      { id: 'ben_nachlas', name: 'Ben Nachlas', bunkId: 'hei' },
      { id: 'yacov_tawil', name: 'Yacov Tawil', bunkId: 'hei' },
      { id: 'shmuly_teitelbaum', name: 'Shmuly Teitelbaum', bunkId: 'hei' },
      { id: 'benyamin_young', name: 'Benyamin Young', bunkId: 'hei' }
    ]
  },
  {
    id: 'vov',
    name: 'vov',
    displayName: 'Vov',
    staff: [
      { id: 'staff_uziel_w', name: 'Uziel Wagner', bunkId: 'vov' }
    ],
    campers: [
      { id: 'dovber_chakoff', name: 'Dovber Chakoff', bunkId: 'vov' },
      { id: 'yehuda_jacobowitz', name: 'Yehuda Jacobowitz', bunkId: 'vov' },
      { id: 'mendel_khaytin', name: 'Mendel Khaytin', bunkId: 'vov' },
      { id: 'yehuda_levin', name: 'Yehuda Levin', bunkId: 'vov' },
      { id: 'shmuly_pliskin', name: 'Shmuly Pliskin', bunkId: 'vov' },
      { id: 'yaakov_posner', name: 'Yaakov Posner', bunkId: 'vov' },
      { id: 'binyomin_press', name: 'Binyomin Press', bunkId: 'vov' },
      { id: 'shneur_rosenfeld', name: 'Shneur Zalman Rosenfeld', bunkId: 'vov' }
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
