// Master Leaderboard Users pool with explicit university and city
export const ALL_USERS = [
  // FÜ / Elazığ Kullanıcıları
  { id: 201, name: 'Zeynep Çelik',    university: 'FÜ',          department: 'Yazılım Müh.',           city: 'Elazığ',   score: 1580, weeklyChange: +92,  badge: '🏆' },
  { id: 202, name: 'Mehmet Demir',    university: 'FÜ',          department: 'Makina Müh.',            city: 'Elazığ',   score: 1420, weeklyChange: +45,  badge: '🌍' },
  { id: 203, name: 'Emre Uçar',       university: 'FÜ',          department: 'Çevre Müh.',             city: 'Elazığ',   score: 1280, weeklyChange: +65,  badge: '♻️' },
  { id: 204, name: 'Selin Arslan',    university: 'FÜ',          department: 'Bilgisayar Müh.',        city: 'Elazığ',   score: 1150, weeklyChange: +38,  badge: '🌱' },
  { id: 205, name: 'Burak Yıldız',    university: 'FÜ',          department: 'Elektrik-Elektronik',    city: 'Elazığ',   score: 980,  weeklyChange: +24,  badge: '🔥' },
  { id: 206, name: 'Merve Kaya',      university: 'FÜ',          department: 'Beslenme ve Diyetetik',  city: 'Elazığ',   score: 840,  weeklyChange: +15,  badge: '🌱' },
  { id: 207, name: 'Caner Erkin',     university: 'FÜ',          department: 'İnşaat Müh.',            city: 'Elazığ',   score: 720,  weeklyChange: -12,  badge: '🚲' },
  { id: 208, name: 'Ahmet Özdemir',   university: 'FÜ',          department: 'Mekatronik Müh.',        city: 'Elazığ',   score: 610,  weeklyChange: +18,  badge: '🌱' },

  // Türkiye Geneli & Diğer Şehir/Üniversiteler
  { id: 101, name: 'Fatih Erdoğan',   university: 'İTÜ',         department: 'Çevre Müh.',             city: 'İstanbul', score: 2340, weeklyChange: +145, badge: '🏆' },
  { id: 102, name: 'Yasemin Güler',   university: 'Boğaziçi',    department: 'Biyoloji',               city: 'İstanbul', score: 2210, weeklyChange: +98,  badge: '🌍' },
  { id: 103, name: 'Ramazan Çakır',   university: 'ODTÜ',        department: 'Fizik',                  city: 'Ankara',   score: 2088, weeklyChange: +77,  badge: '♻️' },
  { id: 104, name: 'İpek Şimşek',     university: 'Hacettepe',   department: 'Tıp',                    city: 'Ankara',   score: 1990, weeklyChange: +60,  badge: '🔥' },
  { id: 105, name: 'Kemal Avcı',      university: 'Bilkent',     department: 'Bilgisayar Müh.',        city: 'Ankara',   score: 1876, weeklyChange: +52,  badge: '🌱' },
  { id: 106, name: 'Seda Yücel',      university: 'Koç Ü.',      department: 'İşletme',                city: 'İstanbul', score: 1803, weeklyChange: +41,  badge: '🌍' },
  { id: 107, name: 'Onur Akgün',      university: 'Sabancı',     department: 'Endüstri Müh.',          city: 'İstanbul', score: 1742, weeklyChange: -9,   badge: '♻️' },
  { id: 108, name: 'Büşra Kılınç',    university: 'Marmara',     department: 'Çevre Müh.',             city: 'İstanbul', score: 1695, weeklyChange: +33,  badge: '🚲' },
  { id: 109, name: 'Tarık Demir',     university: 'Ege Ü.',      department: 'Ziraat',                 city: 'İzmir',    score: 1648, weeklyChange: +25,  badge: '🌱' },
  { id: 110, name: 'Elif Yavaş',      university: 'Gazi Ü.',     department: 'Matematik',              city: 'Ankara',   score: 1610, weeklyChange: +18,  badge: '🔥' },
  { id: 301, name: 'Deniz Öztürk',    university: 'Bilkent Ü.',  department: 'İşletme',                city: 'Ankara',   score: 1490, weeklyChange: +72,  badge: '🏆' },
  { id: 302, name: 'Serhan Aydın',    university: 'Hacettepe',   department: 'Tıp',                    city: 'Ankara',   score: 1390, weeklyChange: +55,  badge: '🌍' },
  { id: 303, name: 'Kübra Doğan',     university: 'Gazi Ü.',     department: 'Eczacılık',              city: 'Ankara',   score: 1374, weeklyChange: +55,  badge: '♻️' },
  { id: 304, name: 'Neslihan Kılıç',  university: 'Çankaya Ü.',  department: 'Mimarlık',               city: 'Ankara',   score: 1204, weeklyChange: +34,  badge: '🌱' },
  { id: 305, name: 'Hakan Polat',     university: 'Atılım Ü.',   department: 'Yazılım Müh.',           city: 'Ankara',   score: 540,  weeklyChange: +19,  badge: '🚲' },
  { id: 306, name: 'Duygu Eren',      university: 'Başkent Ü.',  department: 'Psikoloji',              city: 'Ankara',   score: 490,  weeklyChange: +27,  badge: '🌱' },
  { id: 307, name: 'Ali Korkmaz',     university: 'TED Ü.',      department: 'Endüstri Müh.',          city: 'Ankara',   score: 470,  weeklyChange: -14,  badge: '🔥' },
];

// Leaderboard mock data per scope
export const MOCK_DATA = {
  university: [
    { rank: 1,  name: 'Zeynep Çelik',    institution: 'FÜ · Yazılım Müh.',            score: 1580, weeklyChange: +92,  badge: '🏆', isUser: false },
    { rank: 2,  name: 'Mehmet Demir',    institution: 'FÜ · Makina Müh.',             score: 1420, weeklyChange: +45,  badge: '🌍', isUser: false },
    { rank: 3,  name: 'Emre Uçar',       institution: 'FÜ · Çevre Müh.',              score: 1280, weeklyChange: +65,  badge: '♻️', isUser: false },
    { rank: 4,  name: 'Selin Arslan',    institution: 'FÜ · Bilgisayar Müh.',         score: 1150, weeklyChange: +38,  badge: '🌱', isUser: false },
    { rank: 5,  name: 'Burak Yıldız',    institution: 'FÜ · Elektrik-Elektronik',     score: 980,  weeklyChange: +24,  badge: '🔥', isUser: false },
    { rank: 6,  name: 'Merve Kaya',      institution: 'FÜ · Beslenme ve Diyetetik',   score: 840,  weeklyChange: +15,  badge: '🌱', isUser: false },
    { rank: 7,  name: 'Caner Erkin',     institution: 'FÜ · İnşaat Müh.',             score: 720,  weeklyChange: -12,  badge: '🚲', isUser: false },
    { rank: 8,  name: 'Ahmet Özdemir',   institution: 'FÜ · Mekatronik Müh.',         score: 610,  weeklyChange: +18,  badge: '🌱', isUser: false },
  ],
  city: [
    { rank: 1,  name: 'Zeynep Çelik',    institution: 'FÜ · Yazılım Müh.',            score: 1580, weeklyChange: +92,  badge: '🏆', isUser: false },
    { rank: 2,  name: 'Mehmet Demir',    institution: 'FÜ · Makina Müh.',             score: 1420, weeklyChange: +45,  badge: '🌍', isUser: false },
    { rank: 3,  name: 'Emre Uçar',       institution: 'FÜ · Çevre Müh.',              score: 1280, weeklyChange: +65,  badge: '♻️', isUser: false },
    { rank: 4,  name: 'Selin Arslan',    institution: 'FÜ · Bilgisayar Müh.',         score: 1150, weeklyChange: +38,  badge: '🌱', isUser: false },
    { rank: 5,  name: 'Burak Yıldız',    institution: 'FÜ · Elektrik-Elektronik',     score: 980,  weeklyChange: +24,  badge: '🔥', isUser: false },
    { rank: 6,  name: 'Merve Kaya',      institution: 'FÜ · Beslenme ve Diyetetik',   score: 840,  weeklyChange: +15,  badge: '🌱', isUser: false },
    { rank: 7,  name: 'Caner Erkin',     institution: 'FÜ · İnşaat Müh.',             score: 720,  weeklyChange: -12,  badge: '🚲', isUser: false },
    { rank: 8,  name: 'Ahmet Özdemir',   institution: 'FÜ · Mekatronik Müh.',         score: 610,  weeklyChange: +18,  badge: '🌱', isUser: false },
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
