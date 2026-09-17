import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldWarning,
  FileDashed,
  CheckCircle,
  Warning,
  Broadcast,
  DownloadSimple,
} from '@phosphor-icons/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const ease = [0.32, 0.72, 0, 1];

const mockData = [
  { name: '00:00', scans: 400, fakes: 24 },
  { name: '04:00', scans: 300, fakes: 13 },
  { name: '08:00', scans: 550, fakes: 98 },
  { name: '12:00', scans: 1450, fakes: 139 },
  { name: '16:00', scans: 2600, fakes: 348 },
  { name: '20:00', scans: 1300, fakes: 88 },
  { name: '24:00', scans: 800, fakes: 43 },
];

const initialAlerts = [
  {
    id: 'SD-892',
    type: 'PAN Card',
    status: 'Pixel match forgery',
    conf: '99.4%',
    time: '2m ago',
    severity: 'high',
  },
  {
    id: 'SD-891',
    type: 'Aadhaar',
    status: 'OCR field mismatch',
    conf: '74.2%',
    time: '14m ago',
    severity: 'medium',
  },
  {
    id: 'SD-888',
    type: 'Passport',
    status: 'Structural anomaly',
    conf: '92.1%',
    time: '1h ago',
    severity: 'high',
  },
  {
    id: 'SD-873',
    type: 'Aadhaar',
    status: 'AI generation detected',
    conf: '99.9%',
    time: '3h ago',
    severity: 'high',
  },
  {
    id: 'SD-860',
    type: 'Driving Licence',
    status: 'QR signature invalid',
    conf: '88.5%',
    time: '5h ago',
    severity: 'medium',
  },
];

/* ── Custom chart tooltip ── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-4 py-3 text-xs font-mono shadow-xl">
      <p className="text-text-muted mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-text-secondary capitalize">{entry.dataKey}:</span>
          <span className="text-text-primary font-medium">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [alerts, setAlerts] = useState(initialAlerts);

  useEffect(() => {
    const interval = setInterval(() => {
      const docTypes = ['Aadhaar', 'PAN Card', 'Passport', 'Voter ID'];
      const statuses = [
        { s: 'Deepfake face detected', sev: 'high' },
        { s: 'ELA outlier regions', sev: 'high' },
        { s: 'Metadata inconsistency', sev: 'medium' },
        { s: 'Synthetic generation', sev: 'high' },
      ];

      const type = docTypes[Math.floor(Math.random() * docTypes.length)];
      const st = statuses[Math.floor(Math.random() * statuses.length)];

      const newAlert = {
        id: `SD-${Math.floor(1000 + Math.random() * 9000)}`,
        type,
        status: st.s,
        conf: `${(85 + Math.random() * 14.9).toFixed(1)}%`,
        time: 'Just now',
        severity: st.sev,
        isNew: true,
      };

      setAlerts((prev) => {
        const marked = prev.map((a) => ({
          ...a,
          isNew: false,
          time: a.time === 'Just now' ? '1m ago' : a.time,
        }));
        return [newAlert, ...marked].slice(0, 8);
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const kpis = [
    {
      label: 'Total scans (24h)',
      value: '7,100',
      icon: FileDashed,
      color: 'text-accent-cyan',
      glow: 'rgba(34, 211, 238, 0.07)',
    },
    {
      label: 'Verified genuine',
      value: '6,549',
      icon: CheckCircle,
      color: 'text-accent-green',
      glow: 'rgba(34, 197, 94, 0.07)',
    },
    {
      label: 'Flagged forgeries',
      value: '509',
      icon: ShieldWarning,
      color: 'text-accent-red',
      glow: 'rgba(239, 68, 68, 0.07)',
    },
    {
      label: 'Manual review',
      value: '42',
      icon: Warning,
      color: 'text-accent-amber',
      glow: 'rgba(245, 158, 11, 0.07)',
    },
  ];

  return (
    <div className="flex-grow w-full max-w-[1400px] mx-auto px-6 pt-24 pb-24">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-3xl font-bold tracking-[-0.025em]">Analytics</h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-green/10 border border-accent-green/20 text-accent-green text-[11px] font-medium">
              <Broadcast size={11} className="animate-glow-pulse" />
              Live
            </div>
          </div>
          <p className="text-sm text-text-secondary">
            Real-time document verification intelligence
          </p>
        </div>

        <button className="flex items-center gap-2 h-10 px-5 glass-panel text-sm text-text-secondary hover:text-text-primary transition-colors duration-300 rounded-xl">
          <DownloadSimple size={16} />
          Export logs
        </button>
      </motion.div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.5, ease }}
              className="glass-card p-6 relative"
            >
              {/* Ambient color glow */}
              <div
                className="absolute -right-6 -top-6 w-28 h-28 rounded-full blur-3xl pointer-events-none"
                style={{ background: kpi.glow }}
              />

              <div className="flex items-center justify-between mb-4 relative z-10">
                <span className="text-xs text-text-secondary font-medium">
                  {kpi.label}
                </span>
                <Icon className={`h-4 w-4 ${kpi.color}`} weight="fill" />
              </div>

              <span className="text-3xl font-bold font-mono text-text-primary relative z-10 tracking-tight tabular-nums">
                {kpi.value}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* ── Chart + Live Feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6, ease }}
          className="glass-card p-6 lg:col-span-2 flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold">Detection volume</h3>
            <span className="text-[11px] text-text-muted font-mono">Last 24h</span>
          </div>

          <div className="flex-grow w-full h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={mockData}
                margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gFakes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.03)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="none"
                  tick={{
                    fill: '#3e3e54',
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="none"
                  tick={{
                    fill: '#3e3e54',
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="scans"
                  stroke="#22d3ee"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#gScans)"
                />
                <Area
                  type="monotone"
                  dataKey="fakes"
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#gFakes)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Live intercept feed */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease }}
          className="glass-card flex flex-col overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-border-subtle flex justify-between items-center flex-shrink-0">
            <h3 className="text-sm font-semibold">Live intercepts</h3>
            <div className="w-2 h-2 rounded-full bg-accent-cyan animate-glow-pulse" />
          </div>

          <div className="flex-1 overflow-hidden">
            <AnimatePresence initial={false}>
              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: 1,
                    height: 'auto',
                    backgroundColor: alert.isNew
                      ? 'rgba(239, 68, 68, 0.04)'
                      : 'transparent',
                  }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="px-5 py-3.5 border-b border-border-subtle/40"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-mono font-semibold text-text-primary">
                      {alert.id}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {alert.time}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[11px] text-text-secondary mb-0.5">
                        {alert.type}
                      </div>
                      <div
                        className={`text-xs font-medium ${
                          alert.severity === 'high'
                            ? 'text-accent-red'
                            : 'text-accent-amber'
                        }`}
                      >
                        {alert.status}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-text-muted">
                        Confidence
                      </div>
                      <div className="text-xs font-mono text-text-primary tabular-nums">
                        {alert.conf}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
