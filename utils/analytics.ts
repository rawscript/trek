export interface HeartRateZone {
    name: string;
    range: string;
    time: number; // in seconds
    color: string;
}

export interface HeartRateAnalysis {
    avg: number;
    max: number;
    min: number;
    zones: HeartRateZone[];
}

// Based on general estimates for zones
const ZONES_CONFIG = [
    { name: 'Zone 1: Very Light', range: '< 114 bpm', maxBpm: 114, color: '#60A5FA' }, // Blue
    { name: 'Zone 2: Light', range: '114-133 bpm', maxBpm: 133, color: '#34D399' }, // Green
    { name: 'Zone 3: Moderate', range: '133-152 bpm', maxBpm: 152, color: '#FBBF24' }, // Yellow
    { name: 'Zone 4: Hard', range: '152-171 bpm', maxBpm: 171, color: '#F87171' }, // Red
    { name: 'Zone 5: Maximum', range: '> 171 bpm', maxBpm: Infinity, color: '#C084FC' }, // Purple
];

export const analyzeHeartRate = (heartRateData: number[]): HeartRateAnalysis | null => {
    if (heartRateData.length < 2) return null; // Need at least 2 data points (assuming 1 per second)

    const avg = Math.round(heartRateData.reduce((a, b) => a + b, 0) / heartRateData.length);
    const max = Math.max(...heartRateData);
    const min = Math.min(...heartRateData);
    
    // Assuming 1 data point per second for time calculation
    const zones = ZONES_CONFIG.map(z => ({ ...z, time: 0 }));

    let lastBpm = ZONES_CONFIG[0].maxBpm;
    for (const bpm of heartRateData) {
        const zone = zones.find(z => bpm < z.maxBpm);
        if (zone) {
            zone.time += 1; // Add 1 second
        }
    }
    
    return { avg, max, min, zones };
};
