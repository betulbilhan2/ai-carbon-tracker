// Leaderboard mock data per scope

export const MOCK_DATA = {
  university: [
    { rank: 1,  name: 'Mehmet Demir',    institution: 'ODTÜ · Makina Müh.',          score: 580, weeklyChange: +45,  badge: '🏆', isUser: false },
    { rank: 2,  name: 'Ayşe Kaya',       institution: 'ODTÜ · Bilgisayar Müh.',      score: 510, weeklyChange: +124, badge: '🌍', isUser: true  },
    { rank: 3,  name: 'Zeynep Çelik',    institution: 'ODTÜ · Çevre Müh.',           score: 485, weeklyChange: +38,  badge: '🔥', isUser: false },
    { rank: 4,  name: 'Selin Arslan',    institution: 'ODTÜ · Kimya Müh.',           score: 365, weeklyChange: +22,  badge: '🌱', isUser: false },
    { rank: 5,  name: 'Caner Erkin',     institution: 'ODTÜ · Elektrik-Elektronik',  score: 175, weeklyChange: -5,   badge: '🌱', isUser: false },
  ],
  city: [
    { rank: 1,  name: 'Deniz Öztürk',    institution: 'Bilkent Ü. · İşletme',        score: 1580, weeklyChange: +110, badge: '🏆', isUser: false },
    { rank: 2,  name: 'Serhan Aydın',    institution: 'Hacettepe · Tıp',             score: 1490, weeklyChange: +72,  badge: '🌍', isUser: false },
    { rank: 3,  name: 'Kübra Doğan',     institution: 'Gazi Ü. · Eczacılık',         score: 1374, weeklyChange: +55,  badge: '♻️', isUser: false },
    { rank: 4,  name: 'Emre Uçar',       institution: 'Ankara Ü. · Hukuk',           score: 1288, weeklyChange: -8,   badge: '🔥', isUser: false },
    { rank: 5,  name: 'Neslihan Kılıç',  institution: 'Çankaya Ü. · Mimarlık',       score: 1204, weeklyChange: +34,  badge: '🌱', isUser: false },
    { rank: 6,  name: 'Mehmet Demir',    institution: 'ODTÜ · Makina Müh.',          score: 580,  weeklyChange: +45,  badge: '🏆', isUser: false },
    { rank: 7,  name: 'Hakan Polat',     institution: 'Atılım Ü. · Yazılım Müh.',   score: 540,  weeklyChange: +19,  badge: '🚲', isUser: false },
    { rank: 8,  name: 'Ayşe Kaya',       institution: 'ODTÜ · Bilgisayar Müh.',      score: 510,  weeklyChange: +124, badge: '🌍', isUser: true  },
    { rank: 9,  name: 'Duygu Eren',      institution: 'Başkent Ü. · Psikoloji',      score: 490,  weeklyChange: +27,  badge: '🌱', isUser: false },
    { rank: 10, name: 'Ali Korkmaz',     institution: 'TED Ü. · Endüstri Müh.',      score: 470,  weeklyChange: -14,  badge: '🔥', isUser: false },
  ],
  national: [
    { rank: 1,  name: 'Fatih Erdoğan',   institution: 'İTÜ · Çevre Müh.',            score: 2340, weeklyChange: +145, badge: '🏆', isUser: false },
    { rank: 2,  name: 'Yasemin Güler',   institution: 'Boğaziçi · Biyoloji',         score: 2210, weeklyChange: +98,  badge: '🌍', isUser: false },
    { rank: 3,  name: 'Ramazan Çakır',   institution: 'ODTÜ · Fizik',                score: 2088, weeklyChange: +77,  badge: '♻️', isUser: false },
    { rank: 4,  name: 'İpek Şimşek',     institution: 'Hacettepe · Tıp',             score: 1990, weeklyChange: +60,  badge: '🔥', isUser: false },
    { rank: 5,  name: 'Kemal Avcı',      institution: 'Bilkent · Bilg. Müh.',        score: 1876, weeklyChange: +52,  badge: '🌱', isUser: false },
    { rank: 6,  name: 'Seda Yücel',      institution: 'Koç Ü. · İşletme',            score: 1803, weeklyChange: +41,  badge: '🌍', isUser: false },
    { rank: 7,  name: 'Onur Akgün',      institution: 'Sabancı · Mühendislik',        score: 1742, weeklyChange: -9,   badge: '♻️', isUser: false },
    { rank: 8,  name: 'Büşra Kılınç',    institution: 'Marmara · Çevre Müh.',        score: 1695, weeklyChange: +33,  badge: '🚲', isUser: false },
    { rank: 9,  name: 'Tarık Demir',     institution: 'Ege Ü. · Ziraat',             score: 1648, weeklyChange: +25,  badge: '🌱', isUser: false },
    { rank: 10, name: 'Elif Yavaş',      institution: 'Gazi Ü. · Matematik',         score: 1610, weeklyChange: +18,  badge: '🔥', isUser: false },
    { rank: 34, name: 'Ayşe Kaya',       institution: 'ODTÜ · Bilgisayar Müh.',      score: 510,  weeklyChange: +124, badge: '🌍', isUser: true  },
  ],
};

export const USER_RANK_BY_SCOPE = {
  university: { rank: 2,  total: 5    },
  city:       { rank: 8,  total: 42   },
  national:   { rank: 34, total: 1240 },
};

export const SCOPE_LABELS = {
  university: '🏛️ Üniversitem (ODTÜ)',
  city:       '🏙️ Şehrim (Ankara)',
  national:   '🇹🇷 Türkiye Geneli',
};
