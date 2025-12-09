import LayoutSupremo from '@/components/LayoutSupremo';
import { TrophyIcon } from '@heroicons/react/24/outline';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function LeaderboardPage() {
  const [ranking, setRanking] = useState<any[]>([]);

  useEffect(() => {
    async function loadRanking() {
      const { data } = await supabase
        .from('gamification_rankings')
        .select('*')
        .order('points', { ascending: false })
        .limit(10);
      setRanking(data || []);
    }
    loadRanking();
  }, []);

  return (
    <LayoutSupremo title="Leaderboard Supremo">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <TrophyIcon className="w-16 h-16 text-yellow-500" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Leaderboard Supremo
          </h1>
        </div>

        <div className="space-y-4">
          {ranking.map((user, i) => (
            <div key={user.id} className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border border-purple-500/30 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-6xl font-bold text-yellow-400">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{user.name}</h3>
                  <p className="text-gray-300">{user.role}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-yellow-400">{user.points?.toLocaleString()}</p>
                <p className="text-gray-400">pontos</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </LayoutSupremo>
  );
}
