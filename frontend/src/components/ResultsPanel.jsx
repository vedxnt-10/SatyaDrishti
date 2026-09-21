import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import {
  ShieldCheck,
  ShieldWarning,
  Warning,
  ArrowCounterClockwise,
  DownloadSimple,
  CaretDown,
  Eye,
} from '@phosphor-icons/react';

const ease = [0.32, 0.72, 0, 1];

/* ── Animated counter ── */
function Counter({ from, to }) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    const animation = animate(count, to, { duration: 2.2, ease });
    return animation.stop;
  }, [count, to]);

  return <motion.span>{rounded}</motion.span>;
}

/* ── Risk gauge arc (SVG semicircle) ── */
function RiskGauge({ score }) {
  const radius = 80;
  const circumference = Math.PI * radius;
  const [currentOffset, setCurrentOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentOffset(circumference - (score / 100) * circumference);
    }, 300);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  const getColor = (s) => {
    if (s < 40) return '#22c55e';
    if (s < 70) return '#f59e0b';
    return '#ef4444';
  };

  const getGlow = (s) => {
    if (s < 40) return 'drop-shadow(0 0 6px rgba(34,197,94,0.4))';
    if (s < 70) return 'drop-shadow(0 0 6px rgba(245,158,11,0.4))';
    return 'drop-shadow(0 0 6px rgba(239,68,68,0.4))';
  };

  return (
    <svg viewBox="0 0 200 115" className="w-full max-w-[200px] mx-auto mb-2">
      {/* Background arc */}
      <path
        d="M 20 105 A 80 80 0 0 1 180 105"
        fill="none"
        stroke="#141420"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* Filled arc */}
      <path
        d="M 20 105 A 80 80 0 0 1 180 105"
        fill="none"
        stroke={getColor(score)}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={currentOffset}
        style={{
          transition:
            'stroke-dashoffset 2.2s cubic-bezier(0.32, 0.72, 0, 1), stroke 0.5s ease',
          filter: getGlow(score),
        }}
      />
    </svg>
  );
}

/* ── Heatmap comparison slider ── */
function HeatmapSlider({ originalImage, heatmapImage }) {
  const [pos, setPos] = useState(50);

  return (
    <div className="relative rounded-xl bg-bg-primary overflow-hidden aspect-[4/3] border border-border-subtle select-none">
      {/* Original (right side, full) */}
      {originalImage && (
        <img
          src={originalImage}
          className="absolute inset-0 w-full h-full object-contain"
          draggable="false"
          alt="Original document"
        />
      )}

      {/* Heatmap (left side, clipped) */}
      {heatmapImage && (
        <div
          className="absolute inset-0"
          style={{
            clipPath: `polygon(0 0, ${pos}% 0, ${pos}% 100%, 0 100%)`,
          }}
        >
          <img
            src={heatmapImage}
            className="absolute inset-0 w-full h-full object-contain"
            draggable="false"
            alt="Forensic heatmap"
          />
        </div>
      )}

      {/* Invisible range input for dragging */}
      <input
        type="range"
        min="0"
        max="100"
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
        aria-label="Heatmap comparison slider"
      />

      {/* Visual divider line */}
      <div
        className="absolute top-0 bottom-0 w-[2px] bg-accent-primary pointer-events-none shadow-[0_0_8px_rgba(16,185,129,0.3)]"
        style={{ left: `calc(${pos}% - 1px)` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-9 bg-bg-card border border-accent-primary/60 rounded-lg flex items-center justify-center gap-[3px]">
          <div className="w-[2px] h-3.5 bg-accent-primary/60 rounded-full" />
          <div className="w-[2px] h-3.5 bg-accent-primary/60 rounded-full" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 text-[10px] font-mono text-accent-primary bg-bg-card/80 backdrop-blur-sm px-2 py-1 rounded-md border border-border-subtle pointer-events-none z-0">
        Forensic heatmap
      </div>
      <div className="absolute top-3 right-3 text-[10px] font-mono text-text-secondary bg-bg-card/80 backdrop-blur-sm px-2 py-1 rounded-md border border-border-subtle pointer-events-none z-0">
        Original
      </div>
    </div>
  );
}

/* ── Main Results Panel ── */
export default function ResultsPanel({ result, originalImage, onReset }) {
  const [expandedLayer, setExpandedLayer] = useState(null);

  if (!result) return null;

  const { verdict, risk_score, layers, explanation, heatmap_base64, extracted_data } =
    result;

  /* Verdict configuration */
  const verdictMap = {
    genuine: {
      label: 'Genuine',
      icon: ShieldCheck,
      color: 'text-accent-green',
      bg: 'bg-accent-green/10',
      border: 'border-accent-green/25',
    },
    suspicious: {
      label: 'Suspicious',
      icon: Warning,
      color: 'text-accent-amber',
      bg: 'bg-accent-amber/10',
      border: 'border-accent-amber/25',
    },
    likely_fake: {
      label: 'Likely forged',
      icon: ShieldWarning,
      color: 'text-accent-red',
      bg: 'bg-accent-red/10',
      border: 'border-accent-red/25',
    },
  };

  const vc = verdictMap[verdict] || verdictMap.suspicious;
  const VerdictIcon = vc.icon;

  /* Layer definitions */
  const layerDefs = [
    { id: 'pixel_forensics', name: 'Pixel forensics (ELA)' },
    { id: 'structural', name: 'Structural validation' },
    { id: 'security_features', name: 'Security features' },
    { id: 'ocr_consistency', name: 'OCR consistency' },
    { id: 'ai_detection', name: 'AI generation check' },
  ];

  /* Export handler — preserved from original */
  const handleExport = () => {
    const timestamp = new Date().toISOString();
    const reportContent = `=========================================================
      SEC-65B FORENSIC DOCUMENT ANALYSIS REPORT
=========================================================
Generated: ${timestamp}
System: SatyaDrishti AI Verification Engine
---------------------------------------------------------
[ VERDICT ]
Status: ${result.verdict.toUpperCase()}
Risk Score: ${result.risk_score} / 100
Explanation: ${result.explanation}

[ BIOMETRIC MATCH ]
Status: ${result.face_match?.status?.toUpperCase() || 'N/A'}
Similarity Score: ${result.face_match?.confidence ? result.face_match.confidence.toFixed(1) + '%' : 'N/A'}

[ LAYER DIAGNOSTICS ]
- Pixel Forensics (ELA): ${result.layers.pixel_forensics?.status?.toUpperCase()} (${result.layers.pixel_forensics?.score}/100)
  ${result.layers.pixel_forensics?.details}
- AI Detection: ${result.layers.ai_detection?.status?.toUpperCase()} (${result.layers.ai_detection?.score}/100)
  ${result.layers.ai_detection?.details}
- Security Features: ${result.layers.security_features?.status?.toUpperCase()} (${result.layers.security_features?.score}/100)
- Structural Check: ${result.layers.structural?.status?.toUpperCase()} (${result.layers.structural?.score}/100)
- OCR Consistency: ${result.layers.ocr_consistency?.status?.toUpperCase()} (${result.layers.ocr_consistency?.score}/100)

[ METADATA DUMP ]
${JSON.stringify(result.extracted_data?._sys_metadata || {}, null, 2)}

---------------------------------------------------------
This report is generated securely and timestamped for
court admissibility under Section 65B of the Indian
Evidence Act.
=========================================================`;

    const element = document.createElement('a');
    const file = new Blob([reportContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `SatyaDrishti_Forensic_Report_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-4"
    >
      {/* ────────── LEFT COLUMN: Verdict + Heatmap ────────── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Verdict card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease }}
          className={`glass-card p-5 flex flex-col border-t-2 ${vc.border}`}
        >
          {/* Verdict badge */}
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-6 ${vc.bg} ${vc.color} ${vc.border} border`}
          >
            <VerdictIcon weight="fill" className="h-3.5 w-3.5" />
            {vc.label}
          </div>

          {/* Risk gauge */}
          <RiskGauge score={risk_score} />

          {/* Score number */}
          <div className="text-5xl font-mono font-bold text-text-primary tracking-tight mb-1">
            <Counter from={0} to={risk_score} />
            <span className="text-lg text-text-muted font-medium ml-1">/100</span>
          </div>
          <p className="text-xs text-text-muted font-medium mb-6">Risk score</p>

          {/* Explanation */}
          <p className="text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
            {explanation}
          </p>

          {/* Actions */}
          <div className="mt-4 w-full flex flex-col sm:flex-row gap-3 relative z-10">
            <button
              onClick={handleExport}
              className="flex-1 px-4 py-2 bg-accent-green/10 hover:bg-accent-green/20 text-accent-green border border-accent-green/20 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
            >
              <DownloadSimple size={16} weight="bold" />
              Export Sec-65B report
            </button>
            <button
              onClick={onReset}
              className="flex-1 px-4 py-2 bg-bg-elevated hover:bg-bg-elevated/80 text-text-secondary hover:text-text-primary border border-border-subtle rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ArrowCounterClockwise size={16} />
              Scan another document
            </button>
          </div>
        </motion.div>

        {/* Heatmap slider */}
        {heatmap_base64 && originalImage && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <Eye size={16} className="text-accent-cyan" weight="duotone" />
              <h3 className="text-sm font-semibold">Forensic X-Ray</h3>
            </div>
            <div className="relative w-full h-[240px] lg:h-[280px] rounded-xl overflow-hidden bg-bg-main border border-border-subtle group">
              <HeatmapSlider
                originalImage={originalImage}
                heatmapImage={heatmap_base64}
              />
            </div>
            <p className="text-xs text-text-muted mt-3 leading-relaxed">
              Drag the slider to compare the original document with the ELA
              variance heatmap. Bright regions indicate compression
              inconsistencies.
            </p>
          </motion.div>
        )}
      </div>

      {/* ────────── RIGHT COLUMN: Layers + Metadata ────────── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Forensic layers */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease }}
          className="glass-card p-5"
        >
          <h3 className="text-sm font-semibold mb-3">Forensic layers</h3>
          <div className="flex flex-col gap-1">
            {layerDefs.map((def) => {
              const layer = layers[def.id];
              if (!layer) return null;

              const isPass = layer.status === 'pass';
              const isWarning = layer.status === 'warning';
              const Icon = isPass
                ? ShieldCheck
                : isWarning
                  ? Warning
                  : ShieldWarning;
              const iconColor = isPass
                ? 'text-accent-green'
                : isWarning
                  ? 'text-accent-amber'
                  : 'text-accent-red';
              const barColor = isPass
                ? 'bg-accent-green'
                : isWarning
                  ? 'bg-accent-amber'
                  : 'bg-accent-red';
              const isOpen = expandedLayer === def.id;

              return (
                <button
                  key={def.id}
                  onClick={() =>
                    setExpandedLayer(isOpen ? null : def.id)
                  }
                  className="w-full text-left bg-bg-main/30 hover:bg-bg-main/60 rounded-xl px-4 py-2.5 border border-border-subtle transition-colors duration-300"
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 ${iconColor} flex-shrink-0`}
                      weight="fill"
                    />
                    <span className="text-sm text-text-primary flex-1 truncate">
                      {def.name}
                    </span>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Score bar */}
                      <div className="w-14 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor}`}
                          style={{
                            width: `${layer.score}%`,
                            transition: 'width 0.8s cubic-bezier(0.32, 0.72, 0, 1)',
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-text-muted w-7 text-right tabular-nums">
                        {layer.score}
                      </span>
                      <CaretDown
                        size={12}
                        className={`text-text-muted transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="text-xs text-text-secondary mt-3 pl-7 leading-relaxed">
                        {layer.details}
                      </p>
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>



        {/* Extracted data dump */}
        {extracted_data && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease }}
            className="glass-card overflow-hidden"
          >
            <div className="px-5 py-2.5 border-b border-border-subtle flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-accent-primary animate-glow-pulse" />
              <span className="text-[11px] font-mono text-text-muted">
                extracted_data.json
              </span>
            </div>
            <div className="p-4 font-mono text-[11px] text-accent-cyan/70 overflow-x-auto whitespace-pre leading-relaxed max-h-[160px] overflow-y-auto">
              {JSON.stringify(extracted_data, null, 2)}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
