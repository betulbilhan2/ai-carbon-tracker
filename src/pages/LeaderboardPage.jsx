import { useState } from 'react';
import ScopeToggle    from '../components/leaderboard/ScopeToggle';
import UserRankBanner from '../components/leaderboard/UserRankBanner';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';
import BadgeShowcase  from '../components/leaderboard/BadgeShowcase';

export default function LeaderboardPage() {
  const [scope, setScope] = useState('university');

  return (
    <div className="flex flex-col gap-6">
      {/* ── Scope Toggle ── */}
      <ScopeToggle activeScope={scope} onChange={setScope} />

      {/* ── User rank banner (full width) ── */}
      <UserRankBanner scope={scope} />

      {/* ── Two-column: Table (65%) + Badges (35%) ── */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 0.55fr', alignItems: 'start' }}>
        <LeaderboardTable scope={scope} />
        <BadgeShowcase />
      </div>
    </div>
  );
}
