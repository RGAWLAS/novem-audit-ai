'use client';
import {
  Radar, RadarChart as RChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from 'recharts';
import type { RadarScores } from '@/lib/types';

const LABELS: Record<keyof RadarScores, string> = {
  tracking: 'TRACKING', paidAcquisition: 'PAID', organicPresence: 'ORGANIC',
  conversion: 'CONVERSION', retention: 'RETENTION', measurement: 'MEASUREMENT',
};

export function RadarChart({ scores }: { scores: RadarScores }) {
  // `null` = nie zweryfikowano. Leave the vertex empty (recharts renders a gap)
  // rather than plotting a 0 that would read as "they do nothing on this axis".
  const data = (Object.keys(scores) as (keyof RadarScores)[]).map((k) => ({
    axis: LABELS[k], value: scores[k],
  }));
  return (
    <div className="w-full h-80">
      <ResponsiveContainer>
        <RChart data={data} outerRadius="75%">
          <PolarGrid stroke="#0F0F12" strokeDasharray="2 3" strokeOpacity={0.18} />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: '#0F0F12', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', fontWeight: 700 }}
          />
          <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: '#5C5C66', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }} stroke="#0F0F12" strokeOpacity={0.15} />
          <Radar name="Score" dataKey="value" stroke="#0F0F12" fill="#D4FF00" fillOpacity={0.55} strokeWidth={2} />
        </RChart>
      </ResponsiveContainer>
    </div>
  );
}
