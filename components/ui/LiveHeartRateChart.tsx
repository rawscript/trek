import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface LiveHeartRateChartProps {
  data: { hr: number }[];
}

const LiveHeartRateChart: React.FC<LiveHeartRateChartProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 60 }}>
        <ResponsiveContainer>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F87171" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F87171" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <Area type="monotone" dataKey="hr" stroke="#F87171" fillOpacity={1} fill="url(#colorHr)" strokeWidth={2} />
            </AreaChart>
        </ResponsiveContainer>
    </div>
  );
};

export default LiveHeartRateChart;
