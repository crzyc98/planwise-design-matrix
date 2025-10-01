import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
  ResponsiveContainer,
} from 'recharts';

interface DistributionBin {
  bin: string;
  count: number;
  binStart: number;
  binEnd: number;
}

interface DistributionSeries {
  title: string;
  unit: '%' | 'count' | 'rate' | 'years';
  bins: DistributionBin[];
  peerAverage: number;
  nationalAverage?: number;
  clientValue: number | null;
}

interface DistributionCardProps {
  series: DistributionSeries;
  height?: number;
}

export default function DistributionCard({ series, height = 280 }: DistributionCardProps) {
  const data = series.bins.map((b) => ({
    ...b,
    label: b.bin,
    value: b.count,
  }));

  // Find which bin contains the client's value
  const clientIdx =
    series.clientValue == null
      ? -1
      : series.bins.findIndex(
          (b) => series.clientValue! >= b.binStart && series.clientValue! < b.binEnd
        );

  const markerData = clientIdx >= 0 ? data[clientIdx] : null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="text-base font-semibold text-gray-900">{series.title}</h3>
      <div className="mt-3" style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={18}>
            <CartesianGrid vertical={false} strokeOpacity={0.3} stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              tickMargin={8}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#d1d5db' }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#d1d5db' }}
              label={{
                value: 'Number of Clients',
                angle: -90,
                position: 'insideLeft',
                style: { fill: '#6b7280', fontSize: 12 },
              }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const inClientBin = clientIdx >= 0 && label === series.bins[clientIdx].bin;
                return (
                  <div className="rounded-md border border-gray-200 bg-white p-3 text-sm shadow-lg">
                    <div className="font-semibold text-gray-900 mb-1">{label}</div>
                    <div className="text-gray-700">
                      Number of clients: <span className="font-medium">{payload[0].value}</span>
                    </div>
                    <div className="text-gray-700">
                      Client in this bin:{' '}
                      <span className={`font-medium ${inClientBin ? 'text-emerald-600' : 'text-gray-500'}`}>
                        {inClientBin ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {series.clientValue != null && (
                      <div className="text-gray-700 mt-1">
                        Client value:{' '}
                        <span className="font-medium text-emerald-600">
                          {series.clientValue}
                          {series.unit}
                        </span>
                      </div>
                    )}
                    <div className="text-gray-600 text-xs mt-1">
                      Peer avg: {series.peerAverage}
                      {series.unit}
                    </div>
                    {series.nationalAverage != null && (
                      <div className="text-gray-600 text-xs">
                        National avg: {series.nationalAverage}
                        {series.unit}
                      </div>
                    )}
                  </div>
                );
              }}
            />
            <Bar
              dataKey="value"
              fill="#94a3b8"
              radius={[8, 8, 0, 0]}
              isAnimationActive={false}
              activeBar={{ fill: '#64748b' }}
            />
            {markerData && (
              <ReferenceDot
                x={markerData.label}
                y={(markerData.value ?? 0) + Math.max(markerData.value * 0.08, 1)}
                r={6}
                fill="#059669"
                stroke="#ffffff"
                strokeWidth={2}
                isFront
                shape="diamond"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="text-emerald-600 text-base">◆</span>{' '}
            <span>
              Client{series.clientValue != null ? `: ${series.clientValue}${series.unit}` : ' (unavailable)'}
            </span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-0.5 w-4 bg-gray-700"></span>
            <span>
              Peer avg: {series.peerAverage}
              {series.unit}
            </span>
          </span>
          {series.nationalAverage != null && (
            <span className="inline-flex items-center gap-2">
              <span className="h-0.5 w-4 border-t border-dashed border-gray-400"></span>
              <span>
                National: {series.nationalAverage}
                {series.unit}
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
