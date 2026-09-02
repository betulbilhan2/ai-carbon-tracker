import { BarChart2 } from 'lucide-react';

export default function PlaceholderScreen({ icon: Icon = BarChart2, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-5">
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{ width: 80, height: 80, backgroundColor: '#111816', border: '1px solid #1E3A30' }}
      >
        <Icon size={36} color="#1E3A30" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold" style={{ color: '#F0FDF4' }}>
          {title}
        </h2>
        <p className="text-sm mt-2" style={{ color: '#4B6E5E' }}>
          {description ?? 'Bu bölüm Aşama 2\'de geliştirilecektir.'}
        </p>
      </div>
      <div
        className="rounded-full px-5 py-2 text-sm font-medium"
        style={{ backgroundColor: '#182420', border: '1px solid #1E3A30', color: '#4B6E5E' }}
      >
        Yakında • Coming Soon
      </div>
    </div>
  );
}
