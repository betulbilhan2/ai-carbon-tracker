// Merkezi emisyon katsayıları ve sabitler — tüm activity bileşenleri buradan import eder

export const TRANSPORT_VEHICLES = [
  { id: 'bus',        emoji: '🚌', label: 'Otobüs',     factor: 0.089,  unit: 'kg/km', altId: 'metro' },
  { id: 'metro',      emoji: '🚇', label: 'Metro',       factor: 0.020,  unit: 'kg/km', altId: null    },
  { id: 'car',        emoji: '🚗', label: 'Araba',       factor: 0.145,  unit: 'kg/km', altId: 'metro' },
  { id: 'motorcycle', emoji: '🛵', label: 'Motosiklet',  factor: 0.103,  unit: 'kg/km', altId: 'bus'   },
  { id: 'bike',       emoji: '🚲', label: 'Bisiklet',    factor: 0.000,  unit: 'kg/km', altId: null    },
  { id: 'plane',      emoji: '✈️', label: 'Uçak',        factor: 0.255,  unit: 'kg/km', altId: 'bus'   },
];

export const ENERGY_TYPES = [
  { id: 'electricity', label: 'Elektrik',   factor: 0.481, unit: 'kWh' },
  { id: 'naturalgas',  label: 'Doğalgaz',   factor: 2.040, unit: 'm³'  },
  { id: 'coal',        label: 'Kömür',      factor: 2.860, unit: 'kg'  },
];

export const MEAL_TYPES = [
  { id: 'red_meat',    emoji: '🥩', label: 'Kırmızı Etli',  factor: 6.610, unit: 'porsiyon' },
  { id: 'white_meat',  emoji: '🍗', label: 'Beyaz Etli',    factor: 3.190, unit: 'porsiyon' },
  { id: 'vegetarian',  emoji: '🥗', label: 'Vejetaryen',    factor: 1.500, unit: 'porsiyon' },
  { id: 'vegan',       emoji: '🌱', label: 'Vegan',         factor: 0.900, unit: 'porsiyon' },
];

export const WASTE_TYPES = [
  { id: 'plastic',  emoji: '🧴', label: 'Plastik Şişe',   factor: 0.083, unit: 'adet' },
  { id: 'paper',    emoji: '📦', label: 'Kağıt / Karton', factor: 0.021, unit: 'kg'   },
  { id: 'glass',    emoji: '🍾', label: 'Cam',             factor: 0.011, unit: 'adet' },
  { id: 'organic',  emoji: '🌿', label: 'Organik',         factor: 0.390, unit: 'kg'   },
];

export const CATEGORIES = [
  { id: 'transport', emoji: '🚌', label: 'Ulaşım'     },
  { id: 'energy',    emoji: '⚡', label: 'Enerji'     },
  { id: 'food',      emoji: '🥦', label: 'Beslenme'   },
  { id: 'waste',     emoji: '♻️', label: 'Sıfır Atık' },
];

// Today's date-time string for default input value
export function nowDateTimeLocal() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}
