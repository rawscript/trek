import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { HeartRateZone } from '../../utils/analytics';

interface HeartRateZoneChartProps {
  zones: HeartRateZone[];
}

const HeartRateZoneChart: React.FC<HeartRateZoneChartProps> = ({ zones }) => {
    const data = zones.map(zone => ({
        name: zone.name.split(':')[0],
        time: Math.round(zone.time / 60), // convert to minutes
        color: zone.color,
    }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const zoneInfo = zones.find(z => z.name.startsWith(label));
            return (
                <div className="rounded-md bg-white/80 p-3 text-sm shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
                    <p className="font-bold text-brand-dark dark:text-brand-light">{`${label}`}</p>
                    <p className="text-brand-gray dark:text-gray-400">{`Time: ${payload[0].value} min`}</p>
                    {zoneInfo && <p className="text-xs text-brand-gray dark:text-gray-400">{zoneInfo.range}</p>}
                </div>
            );
        }
        return null;
    };


  return (
    <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis type="number" stroke="#6B7280" className="text-xs dark:stroke-gray-400" />
                <YAxis type="category" dataKey="name" stroke="#6B7280" className="text-xs dark:stroke-gray-400" width={80} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200, 200, 200, 0.2)' }} />
                <Bar dataKey="time" name="Time (min)" barSize={20}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
};

export default HeartRateZoneChart;
