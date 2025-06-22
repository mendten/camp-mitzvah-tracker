
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
  { id: 'shacharit', title: 'Shacharit (Morning Prayer)', type: 'prayer', icon: '🌅', isMandatory: true, isActive: true },
  { id: 'torah-study', title: 'Torah Study', type: 'learning', icon: '📜', isMandatory: true, isActive: true },
  { id: 'chesed', title: 'Acts of Kindness', type: 'mitzvah', icon: '❤️', isMandatory: false, isActive: true },
  { id: 'sports', title: 'Sports & Activities', type: 'activity', icon: '⚽', isMandatory: false, isActive: true },
  { id: 'mincha', title: 'Mincha (Afternoon Prayer)', type: 'prayer', icon: '☀️', isMandatory: false, isActive: true },
  { id: 'evening-seder', title: 'Evening Learning Seder', type: 'learning', icon: '📚', isMandatory: false, isActive: true },
  { id: 'maariv', title: 'Maariv (Evening Prayer)', type: 'prayer', icon: '🌙', isMandatory: false, isActive: true },
  { id: 'reflection', title: 'Daily Reflection', type: 'reflection', icon: '⭐', isMandatory: false, isActive: true },
];

export const CAMP_DATA: Bunk[] = [
  {
    id: 'alef',
    name: 'alef',
    displayName: 'Alef',
    staff: [
      { id: 'staff_menny', name: 'Menny Munitz', bunkId: 'alef' },
      { id: 'staff_zalman_r', name: 'Zalman Rubenfeld', bunkId: 'alef' }
    ],
    campers: [
      { id: 'shiloh_abarbanel', name: 'Shiloh Menachem Abarbanel', bunkId: 'alef' },
      { id: 'mordechai_barouk', name: 'Mordechai Barouk', bunkId: 'alef' },
      { id: 'avremi_brody', name: 'Avremi Brody', bunkId: 'alef' },
      { id: 'yoni_cotlar', name: 'Yoni Cotlar', bunkId: 'alef' },
      { id: 'zalmy_epstein', name: 'Zalmy Epstein', bunkId: 'alef' },
      { id: 'maor_fellig', name: 'Maor Fellig', bunkId: 'alef' },
      { id: 'yaakov_friedman', name: 'Yaakov Friedman', bunkId: 'alef' },
      { id: 'menachem_hankin', name: 'Menachem Mendel Hankin', bunkId: 'alef' },
      { id: 'schneur_kaplan', name: 'Schneur Zalman Kaplan', bunkId: 'alef' },
      { id: 'yisroel_levy', name: 'Yisroel Levy', bunkId: 'alef' },
      { id: 'shaya_menkes', name: 'Shaya Menkes', bunkId: 'alef' },
      { id: 'menachem_miara', name: 'Menachem Mendel Miara', bunkId: 'alef' },
      { id: 'yossi_perlstein', name: 'Yossi Perlstein', bunkId: 'alef' },
      { id: 'mordy_raksin', name: 'Mordy Raksin', bunkId: 'alef' },
      { id: 'yacov_tawil', name: 'Yacov Tawil', bunkId: 'alef' }
    ]
  },
  {
    id: 'beis',
    name: 'beis',
    displayName: 'Beis',
    staff: [
      { id: 'staff_mendy_z', name: 'Mendy Zalmanov', bunkId: 'beis' },
      { id: 'staff_dovi_r', name: 'Dovi Rosenfeld', bunkId: 'beis' }
    ],
    campers: [
      { id: 'isaac_abergel', name: 'Isaac Abergel', bunkId: 'beis' },
      { id: 'tzvi_abergel', name: 'Tzvi Abergel', bunkId: 'beis' },
      { id: 'moshe_abramov', name: 'Moshe Abramov', bunkId: 'beis' },
      { id: 'yona_krinsky', name: 'Yona Krinsky', bunkId: 'beis' },
      { id: 'yosef_miara', name: 'Yosef Yitzchak Miara', bunkId: 'beis' },
      { id: 'shimon_myhill', name: 'Shimon Myhill', bunkId: 'beis' },
      { id: 'ben_nachlas', name: 'Ben Nachlas', bunkId: 'beis' },
      { id: 'shmuly_shagalov', name: 'Shmuly Shagalov', bunkId: 'beis' },
      { id: 'chaim_silberstein', name: 'Chaim Silberstein', bunkId: 'beis' },
      { id: 'zalman_winner', name: 'Zalman Winner', bunkId: 'beis' }
    ]
  },
  {
    id: 'gimmel',
    name: 'gimmel',
    displayName: 'Gimmel',
    staff: [
      { id: 'staff_koppel', name: 'Koppel Silberberg', bunkId: 'gimmel' },
      { id: 'staff_arik', name: 'Arik Gutnik', bunkId: 'gimmel' }
    ],
    campers: [
      { id: 'nachman_altein', name: 'Nachman Yosef Altein', bunkId: 'gimmel' },
      { id: 'motti_andrusier', name: 'Motti Andrusier', bunkId: 'gimmel' },
      { id: 'dovid_bedrick', name: 'Dovid Bedrick', bunkId: 'gimmel' },
      { id: 'mendel_bortunk', name: 'Mendel Bortunk', bunkId: 'gimmel' },
      { id: 'shmuel_elkayam', name: 'Shmuel Elkayam', bunkId: 'gimmel' },
      { id: 'yanky_friedman', name: 'Yanky Friedman', bunkId: 'gimmel' },
      { id: 'shmuel_gansburg', name: 'Shmuel Gansburg', bunkId: 'gimmel' },
      { id: 'schneur_geisinsky', name: 'Schneur Geisinsky', bunkId: 'gimmel' },
      { id: 'chaim_gutnick', name: 'Chaim Gutnick', bunkId: 'gimmel' },
      { id: 'yehuda_halilyan', name: 'Yehuda Halilyan', bunkId: 'gimmel' },
      { id: 'mordechai_kudan', name: 'Mordechai Kudan', bunkId: 'gimmel' },
      { id: 'schneur_levin', name: 'Schneur Levin', bunkId: 'gimmel' },
      { id: 'benny_mendelsohn', name: 'Benny Mendelsohn', bunkId: 'gimmel' },
      { id: 'yaakov_rieger', name: 'Yaakov Rieger', bunkId: 'gimmel' },
      { id: 'menachem_wolff', name: 'Menachem Mendel Wolff', bunkId: 'gimmel' },
      { id: 'benyamin_young', name: 'Benyamin Young', bunkId: 'gimmel' }
    ]
  },
  {
    id: 'daled',
    name: 'daled',
    displayName: 'Daled',
    staff: [
      { id: 'staff_moishy', name: 'Moishy Young', bunkId: 'daled' },
      { id: 'staff_chesky', name: 'Chesky Wilchansky', bunkId: 'daled' }
    ],
    campers: [
      { id: 'avraham_galinsky', name: 'Avraham Galinsky', bunkId: 'daled' },
      { id: 'mendel_horowitz', name: 'Mendel Horowitz', bunkId: 'daled' },
      { id: 'yehuda_levin', name: 'Yehuda Levin', bunkId: 'daled' },
      { id: 'alter_marcus', name: 'Alter Marcus', bunkId: 'daled' },
      { id: 'tzvi_margolin', name: 'Tzvi Margolin', bunkId: 'daled' },
      { id: 'yaakov_posner', name: 'Yaakov Posner', bunkId: 'daled' },
      { id: 'mendel_raskin', name: 'Mendel Raskin', bunkId: 'daled' },
      { id: 'shneur_rosenfeld', name: 'Shneur Zalman Rosenfeld', bunkId: 'daled' },
      { id: 'yosef_trojanowski', name: 'Yosef Dov Trojanowski', bunkId: 'daled' },
      { id: 'michai_weiss', name: 'Michai Weiss', bunkId: 'daled' }
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
