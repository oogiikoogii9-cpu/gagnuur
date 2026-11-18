import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Layers,
  Eye,
  Flame,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  ANATOMY_ZONES,
  WELD_JOINTS,
  type AnatomyZone,
  type JointId,
} from '../data/weldingData';

interface JointExplorerStageProps {
  selectedJoint: JointId;
  onSelectJoint: (id: JointId) => void;
  exploredJoints: JointId[];
  onMarkExplored: (id: JointId) => void;
  onGoNextStage: () => void;
}

type ViewMode = 'split' | 'isometric' | 'cross_section';

export const JointExplorerStage: React.FC<JointExplorerStageProps> = ({
  selectedJoint,
  onSelectJoint,
  exploredJoints,
  onMarkExplored,
  onGoNextStage,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isWelding, setIsWelding] = useState<boolean>(false);
  const [weldProgress, setWeldProgress] = useState<number>(1);
  const [activeZone, setActiveZone] = useState<AnatomyZone['id']>('weld_metal');
  const [showMacroPhoto, setShowMacroPhoto] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);

  const joint = WELD_JOINTS.find((j) => j.id === selectedJoint) || WELD_JOINTS[0];
  const zoneInfo = ANATOMY_ZONES.find((z) => z.id === activeZone) || ANATOMY_ZONES[1];

  useEffect(() => {
    onMarkExplored(selectedJoint);
  }, [selectedJoint, onMarkExplored]);

  useEffect(() => {
    if (!isWelding) return;
    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setWeldProgress((prev) => {
        const next = prev + dt * 0.34;
        if (next >= 1) {
          setIsWelding(false);
          return 1;
        }
        return next;
      });
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isWelding]);

  const handleSimulateWeld = () => {
    if (isWelding) {
      setIsWelding(false);
    } else {
      if (weldProgress >= 1) {
        setWeldProgress(0);
      }
      setIsWelding(true);
    }
  };

  const handleResetWeld = () => {
    setIsWelding(false);
    setWeldProgress(0);
  };

  const handleSelectJoint = (id: JointId) => {
    onSelectJoint(id);
    setIsWelding(false);
    setWeldProgress(1);
  };

  const currentJointIndex = WELD_JOINTS.findIndex((j) => j.id === selectedJoint);
  const nextJoint = WELD_JOINTS[(currentJointIndex + 1) % WELD_JOINTS.length];

  return (
    <section aria-labelledby="stage1-heading" className="space-y-6">
      {/* Section Heading */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-medium text-amber-700 tracking-wide">
            01-р үе шат · Үндсэн ангилал
          </p>
          <h2
            id="stage1-heading"
            className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-slate-900 text-balance"
          >
            Гагнуурын үндсэн 5 холболт ба оёоны бүтэц
          </h2>
        </div>
        <div className="text-sm text-slate-600 font-mono tabular-nums">
          Судалсан: {exploredJoints.length} / {WELD_JOINTS.length} төрөл
        </div>
      </div>

      {/* Joint Type Selector Bar */}
      <div
        role="tablist"
        aria-label="Гагнуурын холболтын төрлүүд"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2"
      >
        {WELD_JOINTS.map((item, idx) => {
          const isActive = item.id === selectedJoint;
          const isVisited = exploredJoints.includes(item.id);
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleSelectJoint(item.id)}
              className={`group flex flex-col items-start text-left px-3.5 py-2.5 rounded-lg border transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-sky-600 ${
                isActive
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span
                  className={`text-xs font-mono tabular-nums ${
                    isActive ? 'text-amber-400' : 'text-slate-500'
                  }`}
                >
                  0{idx + 1}
                </span>
                {isVisited && (
                  <CheckCircle2
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-emerald-400' : 'text-emerald-600'
                    }`}
                    aria-label="Судалсан"
                  />
                )}
              </div>
              <span className="mt-1 text-sm font-semibold leading-snug line-clamp-1">
                {item.nameMn}
              </span>
              <span
                className={`text-xs truncate w-full ${
                  isActive ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {item.nameEn}
              </span>
            </button>
          );
        })}
      </div>

      {/* Two-Zone Sandbox Layout (65% Stage / 35% Concept & Control Deck) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Interactive Stage (7 cols ~ 60%) */}
        <div className="lg:col-span-7 flex flex-col rounded-xl border border-slate-200 bg-slate-950 text-slate-100 overflow-hidden">
          {/* Stage Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900/90">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-800">
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  viewMode === 'split'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Хосолсон
              </button>
              <button
                onClick={() => setViewMode('isometric')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  viewMode === 'isometric'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                3D Изометр
              </button>
              <button
                onClick={() => setViewMode('cross_section')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  viewMode === 'cross_section'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Огтлол ба Бүс
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulateWeld}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-sky-400"
              >
                {isWelding ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Түр зогсоох
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Гагнаж үзэх
                  </>
                )}
              </button>
              <button
                onClick={handleResetWeld}
                aria-label="Оёог дахин тохируулах"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 text-xs font-medium transition-colors whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Цэвэрлэх
              </button>
            </div>
          </div>

          {/* Interactive SVG Canvas */}
          <div className="relative flex-1 blueprint-grid p-4 md:p-6 flex flex-col justify-between min-h-[420px]">
            <div
              className={`grid gap-4 items-center flex-1 ${
                viewMode === 'split' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
              }`}
            >
              {(viewMode === 'split' || viewMode === 'isometric') && (
                <div className="flex flex-col items-center justify-center rounded-lg border border-slate-800/80 bg-slate-900/50 p-3">
                  <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Орон зайн 3D загвар</span>
                    <span className="font-mono tabular-nums text-amber-400">
                      {Math.round(weldProgress * 100)}%
                    </span>
                  </div>
                  <IsometricJointSvg
                    jointId={selectedJoint}
                    weldProgress={weldProgress}
                    isWelding={isWelding}
                  />
                </div>
              )}

              {(viewMode === 'split' || viewMode === 'cross_section') && (
                <div className="flex flex-col items-center justify-center rounded-lg border border-slate-800/80 bg-slate-900/50 p-3">
                  <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Огтлолын бүтэц (дарж үзнэ үү)</span>
                    <span className="text-sky-400">5 бүс</span>
                  </div>
                  <CrossSectionAnatomySvg
                    jointId={selectedJoint}
                    activeZone={activeZone}
                    onSelectZone={setActiveZone}
                    weldProgress={weldProgress}
                  />
                </div>
              )}
            </div>

            {/* Interactive Anatomy Zone Selector & Explanation Strip */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                {ANATOMY_ZONES.map((zone) => {
                  const selected = zone.id === activeZone;
                  return (
                    <button
                      key={zone.id}
                      onClick={() => setActiveZone(zone.id)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        selected
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {zone.nameMn}
                    </button>
                  );
                })}
              </div>
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-3.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white">
                    {zoneInfo.nameMn}{' '}
                    <span className="font-normal text-slate-400">({zoneInfo.nameEn})</span>
                  </h3>
                  <span className="text-xs font-mono text-amber-400 tabular-nums">
                    {zoneInfo.temperatureNote}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">
                  {zoneInfo.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Concept & Control Deck (5 cols ~ 40%) */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 md:p-6 space-y-5">
          <div className="space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-mono font-medium text-slate-700">{joint.code}</span>
                <span aria-hidden="true">·</span>
                <span>{joint.nameEn}</span>
              </div>
              <h3 className="mt-1 text-xl font-bold text-slate-900">{joint.nameMn}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{joint.summary}</p>
            </div>

            {/* Key Engineering Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
              <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3">
                <div className="text-xs text-slate-500">Металлын зузаан</div>
                <div className="mt-0.5 text-sm font-semibold font-mono tabular-nums text-slate-900">
                  {joint.thicknessRange}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3">
                <div className="text-xs text-slate-500">Ачаалал даах чадвар</div>
                <div className="mt-0.5 text-sm font-semibold text-slate-900">
                  {joint.strengthRating}
                </div>
              </div>
            </div>

            {/* Recommended Grooves */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                Түгээмэл оёоны төрлүүд
              </div>
              <ul className="space-y-1.5">
                {joint.recommendedGrooves.map((g) => (
                  <li key={g} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-amber-600 font-mono text-xs mt-0.5">—</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pros & Cons */}
            <div className="grid grid-cols-1 gap-2.5 pt-2 border-t border-slate-100">
              <div className="rounded-lg bg-emerald-50/70 border border-emerald-200 p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  Давуу тал
                </div>
                <p className="mt-1 text-xs text-emerald-950/90 leading-relaxed">{joint.pros}</p>
              </div>
              <div className="rounded-lg bg-amber-50/70 border border-amber-200 p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  Анхаарах зүйл
                </div>
                <p className="mt-1 text-xs text-amber-950/90 leading-relaxed">{joint.cons}</p>
              </div>
            </div>

            {/* Real Applications & Macro Reference Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-700">Хэрэглээний жишээ</span>
                <button
                  onClick={() => setShowMacroPhoto((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 hover:text-sky-800 whitespace-nowrap shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {showMacroPhoto ? 'Хэрэглээ харах' : 'Бодит макро зүсэлт үзэх'}
                </button>
              </div>

              {showMacroPhoto ? (
                <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-900">
                  {!imgError ? (
                    <img
                      src="/src/assets/images/weld_macro_etch_1794982486833.jpg"
                      alt="V-хэлбэрийн гагнуурын оёоны макро зүсэлт"
                      referrerPolicy="no-referrer"
                      onError={() => setImgError(true)}
                      className="w-full h-36 object-cover"
                    />
                  ) : (
                    <div className="h-36 flex flex-col items-center justify-center bg-slate-800 text-slate-300 text-xs p-4 text-center">
                      <Flame className="w-6 h-6 text-amber-500 mb-1.5" />
                      <span>V-хэлбэрийн оёоны макро зүсэлтийн бүтэц</span>
                    </div>
                  )}
                  <div className="px-3 py-2 text-xs text-slate-200 bg-slate-900">
                    Бодит ган оёоны идүүлсэн макро огтлол: оёоны талст бүтэц болон ДНБ тод харагдаж байна.
                  </div>
                </div>
              ) : (
                <ul className="space-y-1">
                  {joint.applications.map((app) => (
                    <li key={app} className="text-xs text-slate-600 flex items-center gap-2">
                      <span className="text-slate-400">•</span>
                      <span>{app}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={() => handleSelectJoint(nextJoint.id)}
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              Дараах: {nextJoint.nameMn}
            </button>
            <button
              onClick={onGoNextStage}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              2-р шат руу <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------- Interactive 3D Isometric SVG with Animated Welding Torch ---------- */

interface IsometricJointSvgProps {
  jointId: JointId;
  weldProgress: number;
  isWelding: boolean;
}

const IsometricJointSvg: React.FC<IsometricJointSvgProps> = ({
  jointId,
  weldProgress,
  isWelding,
}) => {
  // Seam line start & end coordinates per joint type in 320x230 SVG space
  const seamPaths: Record<JointId, { x1: number; y1: number; x2: number; y2: number }> = {
    butt: { x1: 112, y1: 158, x2: 210, y2: 102 },
    tee: { x1: 122, y1: 162, x2: 215, y2: 108 },
    corner: { x1: 108, y1: 150, x2: 205, y2: 94 },
    lap: { x1: 112, y1: 146, x2: 210, y2: 90 },
    edge: { x1: 96, y1: 132, x2: 206, y2: 68 },
  };

  const seam = seamPaths[jointId];
  const currX = seam.x1 + (seam.x2 - seam.x1) * weldProgress;
  const currY = seam.y1 + (seam.y2 - seam.y1) * weldProgress;
  const seamLength = Math.hypot(seam.x2 - seam.x1, seam.y2 - seam.y1);

  return (
    <svg
      viewBox="0 0 320 230"
      className="w-full max-w-[360px] h-auto select-none"
      role="img"
      aria-label={`${jointId} холболтын 3D изометрийн загвар`}
    >
      <defs>
        <linearGradient id="steelTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="steelSide" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id="steelDark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <radialGradient id="arcGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="35%" stopColor="#fbbf24" stopOpacity="0.95" />
          <stop offset="70%" stopColor="#ea580c" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Plates geometry for each of the 5 basic joints */}
      {jointId === 'butt' && (
        <g>
          {/* Left Plate */}
          <polygon points="35,112 110,156 208,100 133,56" fill="url(#steelTop)" stroke="#cbd5e1" strokeWidth="1" />
          <polygon points="35,112 110,156 110,174 35,130" fill="url(#steelSide)" stroke="#475569" strokeWidth="1" />
          <polygon points="110,156 208,100 208,118 110,174" fill="url(#steelDark)" stroke="#475569" strokeWidth="1" />
          {/* Right Plate */}
          <polygon points="114,158 190,202 288,146 212,102" fill="url(#steelTop)" stroke="#cbd5e1" strokeWidth="1" />
          <polygon points="114,158 190,202 190,220 114,176" fill="url(#steelSide)" stroke="#475569" strokeWidth="1" />
          <polygon points="190,202 288,146 288,164 190,220" fill="url(#steelDark)" stroke="#475569" strokeWidth="1" />
        </g>
      )}

      {jointId === 'tee' && (
        <g>
          {/* Horizontal Base Plate */}
          <polygon points="35,142 158,212 285,138 162,68" fill="url(#steelTop)" stroke="#cbd5e1" strokeWidth="1" />
          <polygon points="35,142 158,212 158,226 35,156" fill="url(#steelSide)" stroke="#475569" strokeWidth="1" />
          <polygon points="158,212 285,138 285,152 158,226" fill="url(#steelDark)" stroke="#475569" strokeWidth="1" />
          {/* Vertical Stem Plate */}
          <polygon points="104,68 122,78 216,24 198,14" fill="#cbd5e1" stroke="#e2e8f0" strokeWidth="1" />
          <polygon points="104,68 104,152 122,162 122,78" fill="url(#steelSide)" stroke="#64748b" strokeWidth="1" />
          <polygon points="122,78 122,162 216,108 216,24" fill="url(#steelTop)" stroke="#cbd5e1" strokeWidth="1" />
        </g>
      )}

      {jointId === 'corner' && (
        <g>
          {/* Horizontal Base Plate */}
          <polygon points="108,150 205,206 286,158 189,102" fill="url(#steelTop)" stroke="#cbd5e1" strokeWidth="1" />
          <polygon points="108,150 205,206 205,220 108,164" fill="url(#steelSide)" stroke="#475569" strokeWidth="1" />
          <polygon points="205,206 286,158 286,172 205,220" fill="url(#steelDark)" stroke="#475569" strokeWidth="1" />
          {/* Vertical Corner Plate */}
          <polygon points="90,56 108,66 205,10 187,0" fill="#cbd5e1" stroke="#e2e8f0" strokeWidth="1" transform="translate(0, 12)" />
          <polygon points="90,68 90,154 108,164 108,78" fill="url(#steelSide)" stroke="#64748b" strokeWidth="1" />
          <polygon points="108,78 108,164 205,108 205,22" fill="url(#steelTop)" stroke="#cbd5e1" strokeWidth="1" />
        </g>
      )}

      {jointId === 'lap' && (
        <g>
          {/* Bottom Plate */}
          <polygon points="88,142 182,196 290,134 196,80" fill="url(#steelDark)" stroke="#94a3b8" strokeWidth="1" />
          <polygon points="88,142 182,196 182,212 88,158" fill="#334155" stroke="#475569" strokeWidth="1" />
          <polygon points="182,196 290,134 290,150 182,212" fill="#1e293b" stroke="#475569" strokeWidth="1" />
          {/* Top Overlapping Plate */}
          <polygon points="32,102 112,148 210,92 130,46" fill="url(#steelTop)" stroke="#cbd5e1" strokeWidth="1" />
          <polygon points="32,102 112,148 112,162 32,116" fill="url(#steelSide)" stroke="#64748b" strokeWidth="1" />
          <polygon points="112,148 210,92 210,106 112,162" fill="#64748b" stroke="#94a3b8" strokeWidth="1" />
        </g>
      )}

      {jointId === 'edge' && (
        <g>
          {/* Back Plate */}
          <polygon points="112,140 128,149 238,85 222,76" fill="#cbd5e1" stroke="#e2e8f0" strokeWidth="1" />
          <polygon points="128,149 128,208 238,144 238,85" fill="url(#steelDark)" stroke="#64748b" strokeWidth="1" />
          {/* Front Plate */}
          <polygon points="94,130 110,139 220,75 204,66" fill="#cbd5e1" stroke="#e2e8f0" strokeWidth="1" />
          <polygon points="94,130 94,188 110,198 110,139" fill="url(#steelSide)" stroke="#475569" strokeWidth="1" />
          <polygon points="110,139 110,198 220,134 220,75" fill="url(#steelTop)" stroke="#94a3b8" strokeWidth="1" />
        </g>
      )}

      {/* Solidified Weld Bead */}
      {weldProgress > 0.01 && (
        <g>
          {/* Thermal Heat Tint Halo */}
          <line
            x1={seam.x1}
            y1={seam.y1}
            x2={currX}
            y2={currY}
            stroke="#f97316"
            strokeOpacity="0.28"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Weld Metal Bead */}
          <line
            x1={seam.x1}
            y1={seam.y1}
            x2={currX}
            y2={currY}
            stroke="#e2e8f0"
            strokeWidth="9"
            strokeLinecap="round"
          />
          {/* Ripple Texture */}
          <line
            x1={seam.x1}
            y1={seam.y1}
            x2={currX}
            y2={currY}
            stroke="#94a3b8"
            strokeWidth="5"
            strokeDasharray="2 5"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Welding Torch + Electric Arc while welding */}
      {(isWelding || (weldProgress > 0 && weldProgress < 1)) && (
        <g transform={`translate(${currX}, ${currY})`}>
          {/* Electric Arc Glow */}
          <circle cx="0" cy="0" r="22" fill="url(#arcGlow)" />
          {/* Sparks */}
          {isWelding && (
            <g stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round">
              <line x1="-4" y1="-2" x2="-16" y2="-12" />
              <line x1="6" y1="-4" x2="18" y2="-14" />
              <line x1="-2" y1="6" x2="-12" y2="16" />
              <line x1="7" y1="4" x2="17" y2="12" />
            </g>
          )}
          {/* Electrode / Torch Body */}
          <line x1="0" y1="-3" x2="-22" y2="-46" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="-26,-42 -18,-48 -36,-76 -46,-68" fill="#1e293b" stroke="#94a3b8" strokeWidth="1" />
        </g>
      )}

      {/* Seam guide indicator when reset to 0 */}
      {weldProgress === 0 && (
        <line
          x1={seam.x1}
          y1={seam.y1}
          x2={seam.x2}
          y2={seam.y2}
          stroke="#fbbf24"
          strokeWidth="2"
          strokeDasharray={`${Math.min(6, seamLength / 10)} 4`}
        />
      )}
    </svg>
  );
};

/* ---------- Interactive Cross-Section Anatomy SVG ---------- */

interface CrossSectionAnatomySvgProps {
  jointId: JointId;
  activeZone: AnatomyZone['id'];
  onSelectZone: (zone: AnatomyZone['id']) => void;
  weldProgress: number;
}

const CrossSectionAnatomySvg: React.FC<CrossSectionAnatomySvgProps> = ({
  jointId,
  activeZone,
  onSelectZone,
  weldProgress,
}) => {
  const isSelected = (z: AnatomyZone['id']) => activeZone === z;
  const weldOpacity = weldProgress > 0.05 ? 1 : 0.25;

  return (
    <svg
      viewBox="0 0 300 220"
      className="w-full max-w-[340px] h-auto select-none"
      role="img"
      aria-label="Гагнуурын оёоны огтлолын бүтэц"
    >
      {/* Cross section plates based on joint type */}
      {jointId === 'butt' && (
        <g>
          {/* Base Metal Left & Right */}
          <rect
            x="22"
            y="84"
            width="104"
            height="58"
            rx="2"
            fill={isSelected('base_metal') ? '#38bdf8' : '#64748b'}
            fillOpacity={isSelected('base_metal') ? 0.55 : 0.85}
            stroke={isSelected('base_metal') ? '#38bdf8' : '#94a3b8'}
            strokeWidth={isSelected('base_metal') ? 2.5 : 1}
            className="cursor-pointer transition-colors"
            onClick={() => onSelectZone('base_metal')}
          />
          <rect
            x="174"
            y="84"
            width="104"
            height="58"
            rx="2"
            fill={isSelected('base_metal') ? '#38bdf8' : '#64748b'}
            fillOpacity={isSelected('base_metal') ? 0.55 : 0.85}
            stroke={isSelected('base_metal') ? '#38bdf8' : '#94a3b8'}
            strokeWidth={isSelected('base_metal') ? 2.5 : 1}
            className="cursor-pointer transition-colors"
            onClick={() => onSelectZone('base_metal')}
          />
          {/* HAZ (Heat Affected Zone) */}
          <path
            d="M 110,84 L 128,84 L 143,142 L 122,142 Z M 190,84 L 172,84 L 157,142 L 178,142 Z"
            fill={isSelected('haz') ? '#f59e0b' : '#b45309'}
            fillOpacity={weldOpacity * (isSelected('haz') ? 0.9 : 0.55)}
            stroke={isSelected('haz') ? '#fbbf24' : 'none'}
            strokeWidth="2"
            className="cursor-pointer"
            onClick={() => onSelectZone('haz')}
          />
          {/* Weld Metal */}
          <path
            d="M 122,84 Q 150,70 178,84 L 160,142 Q 150,150 140,142 Z"
            fill={isSelected('weld_metal') ? '#fb923c' : '#e2e8f0'}
            fillOpacity={weldOpacity}
            stroke={isSelected('weld_metal') ? '#f97316' : '#cbd5e1'}
            strokeWidth={isSelected('weld_metal') ? 2.5 : 1}
            className="cursor-pointer"
            onClick={() => onSelectZone('weld_metal')}
          />
          {/* Weld Root Marker */}
          <circle
            cx="150"
            cy="144"
            r="8"
            fill={isSelected('weld_root') ? '#38bdf8' : '#0f172a'}
            fillOpacity="0.85"
            stroke="#38bdf8"
            strokeWidth={isSelected('weld_root') ? 2.5 : 1.5}
            className="cursor-pointer"
            onClick={() => onSelectZone('weld_root')}
          />
          {/* Weld Toe Marker */}
          <circle
            cx="178"
            cy="84"
            r="7"
            fill={isSelected('weld_toe') ? '#f43f5e' : '#0f172a'}
            fillOpacity="0.85"
            stroke="#fb7185"
            strokeWidth={isSelected('weld_toe') ? 2.5 : 1.5}
            className="cursor-pointer"
            onClick={() => onSelectZone('weld_toe')}
          />
        </g>
      )}

      {jointId === 'tee' && (
        <g>
          {/* Base Plate */}
          <rect
            x="30"
            y="140"
            width="240"
            height="42"
            rx="2"
            fill={isSelected('base_metal') ? '#38bdf8' : '#64748b'}
            fillOpacity={isSelected('base_metal') ? 0.55 : 0.85}
            stroke={isSelected('base_metal') ? '#38bdf8' : '#94a3b8'}
            strokeWidth={isSelected('base_metal') ? 2.5 : 1}
            className="cursor-pointer"
            onClick={() => onSelectZone('base_metal')}
          />
          {/* Vertical Stem */}
          <rect
            x="130"
            y="36"
            width="40"
            height="104"
            rx="2"
            fill={isSelected('base_metal') ? '#38bdf8' : '#64748b'}
            fillOpacity={isSelected('base_metal') ? 0.55 : 0.85}
            stroke={isSelected('base_metal') ? '#38bdf8' : '#94a3b8'}
            strokeWidth={isSelected('base_metal') ? 2.5 : 1}
            className="cursor-pointer"
            onClick={() => onSelectZone('base_metal')}
          />
          {/* HAZ */}
          <path
            d="M 130,96 L 130,140 L 82,140 L 82,152 L 146,152 L 146,96 Z M 170,96 L 170,140 L 218,140 L 218,152 L 154,152 L 154,96 Z"
            fill={isSelected('haz') ? '#f59e0b' : '#b45309'}
            fillOpacity={weldOpacity * (isSelected('haz') ? 0.85 : 0.5)}
            className="cursor-pointer"
            onClick={() => onSelectZone('haz')}
          />
          {/* Left & Right Fillet Weld Metal */}
          <path
            d="M 130,104 Q 112,126 92,140 L 130,140 Z M 170,104 Q 188,126 208,140 L 170,140 Z"
            fill={isSelected('weld_metal') ? '#fb923c' : '#e2e8f0'}
            fillOpacity={weldOpacity}
            stroke={isSelected('weld_metal') ? '#f97316' : '#cbd5e1'}
            strokeWidth={isSelected('weld_metal') ? 2.5 : 1}
            className="cursor-pointer"
            onClick={() => onSelectZone('weld_metal')}
          />
          <circle
            cx="130"
            cy="140"
            r="7"
            fill="#0f172a"
            stroke="#38bdf8"
            strokeWidth={isSelected('weld_root') ? 3 : 1.5}
            className="cursor-pointer"
            onClick={() => onSelectZone('weld_root')}
          />
          <circle
            cx="208"
            cy="140"
            r="7"
            fill="#0f172a"
            stroke="#fb7185"
            strokeWidth={isSelected('weld_toe') ? 3 : 1.5}
            className="cursor-pointer"
            onClick={() => onSelectZone('weld_toe')}
          />
        </g>
      )}

      {jointId === 'corner' && (
        <g>
          {/* Vertical Wall */}
          <rect
            x="64"
            y="42"
            width="42"
            height="130"
            rx="2"
            fill={isSelected('base_metal') ? '#38bdf8' : '#64748b'}
            fillOpacity={isSelected('base_metal') ? 0.55 : 0.85}
            stroke={isSelected('base_metal') ? '#38bdf8' : '#94a3b8'}
            strokeWidth={isSelected('base_metal') ? 2.5 : 1}
            className="cursor-pointer"
            onClick={() => onSelectZone('base_metal')}
          />
          {/* Horizontal Plate */}
          <rect
            x="106"
            y="130"
            width="136"
            height="42"
            rx="2"
            fill={isSelected('base_metal') ? '#38bdf8' : '#64748b'}
            fillOpacity={isSelected('base_metal') ? 0.55 : 0.85}
            stroke={isSelected('base_metal') ? '#38bdf8' : '#94a3b8'}
            strokeWidth={isSelected('base_metal') ? 2.5 : 1}
            className="cursor-pointer"
            onClick={() => onSelectZone('base_metal')}
          />
          {/* HAZ */}
          <path
            d="M 106,86 L 118,86 L 118,130 L 154,130 L 154,142 L 106,142 Z"
            fill={isSelected('haz') ? '#f59e0b' : '#b45309'}
            fillOpacity={weldOpacity * 0.55}
            className="cursor-pointer"
            onClick={() => onSelectZone('haz')}
          />
          {/* Inner Fillet */}
          <path
            d="M 106,94 L 146,130 L 106,130 Z"
            fill={isSelected('weld_metal') ? '#fb923c' : '#e2e8f0'}
            fillOpacity={weldOpacity}
            stroke={isSelected('weld_metal') ? '#f97316' : '#cbd5e1'}
            strokeWidth={isSelected('weld_metal') ? 2.5 : 1}
            className="cursor-pointer"
            onClick={() => onSelectZone('weld_metal')}
          />
          <circle
            cx="106"
            cy="130"
            r="7"
            fill="#0f172a"
            stroke="#38bdf8"
            strokeWidth={isSelected('weld_root') ? 3 : 1.5}
            className="cursor-pointer"
            onClick={() => onSelectZone('weld_root')}
          />
          <circle
            cx="146"
            cy="130"
            r="7"
            fill="#0f172a"
            stroke="#fb7185"
            strokeWidth={isSelected('weld_toe') ? 3 : 1.5}
            className="cursor-pointer"
            onClick={() => onSelectZone('weld_toe')}
          />
        </g>
      )}

      {jointId === 'lap' && (
        <g>
          {/* Bottom Plate */}
          <rect
            x="96"
            y="124"
            width="174"
            height="38"
            rx="2"
            fill={isSelected('base_metal') ? '#38bdf8' : '#64748b'}
            fillOpacity={isSelected('base_metal') ? 0.55 : 0.85}
            stroke={isSelected('base_metal') ? '#38bdf8' : '#94a3b8'}
            strokeWidth={isSelected('base_metal') ? 2.5 : 1}
            className="cursor-pointer"
            onClick={() => onSelectZone('base_metal')}
          />
          {/* Top Plate */}
          <rect
            x="30"
            y="84"
            width="168"
            height="38"
            rx="2"
            fill={isSelected('base_metal') ? '#38bdf8' : '#64748b'}
            fillOpacity={isSelected('base_metal') ? 0.55 : 0.85}
            stroke={isSelected('base_metal') ? '#38bdf8' : '#94a3b8'}
            strokeWidth={isSelected('base_metal') ? 2.5 : 1}
            className="cursor-pointer"
            onClick={() => onSelectZone('base_metal')}
          />
          {/* HAZ */}
          <path
            d="M 186,84 L 198,84 L 244,124 L 244,136 L 186,136 Z"
            fill={isSelected('haz') ? '#f59e0b' : '#b45309'}
            fillOpacity={weldOpacity * 0.55}
            className="cursor-pointer"
            onClick={() => onSelectZone('haz')}
          />
          {/* Fillet Weld */}
          <path
            d="M 198,86 L 238,124 L 198,124 Z"
            fill={isSelected('weld_metal') ? '#fb923c' : '#e2e8f0'}
            fillOpacity={weldOpacity}
            stroke={isSelected('weld_metal') ? '#f97316' : '#cbd5e1'}
            strokeWidth={isSelected('weld_metal') ? 2.5 : 1}
            className="cursor-pointer"
            onClick={() => onSelectZone('weld_metal')}
          />
          <circle
            cx="198"
            cy="124"
            r="7"
            fill="#0f172a"
            stroke="#38bdf8"
            strokeWidth={isSelected('weld_root') ? 3 : 1.5}
            className="cursor-pointer"
            onClick={() => onSelectZone('weld_root')}
          />
          <circle
            cx="238"
            cy="124"
            r="7"
            fill="#0f172a"
            stroke="#fb7185"
            strokeWidth={isSelected('weld_toe') ? 3 : 1.5}
            className="cursor-pointer"
            onClick={() => onSelectZone('weld_toe')}
          />
        </g>
      )}

      {jointId === 'edge' && (
        <g>
          {/* Left Parallel Plate */}
          <rect
            x="104"
            y="72"
            width="40"
            height="112"
            rx="2"
            fill={isSelected('base_metal') ? '#38bdf8' : '#64748b'}
            fillOpacity={isSelected('base_metal') ? 0.55 : 0.85}
            stroke={isSelected('base_metal') ? '#38bdf8' : '#94a3b8'}
            strokeWidth={isSelected('base_metal') ? 2.5 : 1}
            className="cursor-pointer"
            onClick={() => onSelectZone('base_metal')}
          />
          {/* Right Parallel Plate */}
          <rect
            x="148"
            y="72"
            width="40"
            height="112"
            rx="2"
            fill={isSelected('base_metal') ? '#38bdf8' : '#64748b'}
            fillOpacity={isSelected('base_metal') ? 0.55 : 0.85}
            stroke={isSelected('base_metal') ? '#38bdf8' : '#94a3b8'}
            strokeWidth={isSelected('base_metal') ? 2.5 : 1}
            className="cursor-pointer"
            onClick={() => onSelectZone('base_metal')}
          />
          {/* HAZ */}
          <path
            d="M 104,72 L 188,72 L 188,96 L 104,96 Z"
            fill={isSelected('haz') ? '#f59e0b' : '#b45309'}
            fillOpacity={weldOpacity * 0.55}
            className="cursor-pointer"
            onClick={() => onSelectZone('haz')}
          />
          {/* Top Edge Weld Bead */}
          <path
            d="M 106,72 Q 146,44 186,72 Q 166,86 146,88 Q 126,86 106,72 Z"
            fill={isSelected('weld_metal') ? '#fb923c' : '#e2e8f0'}
            fillOpacity={weldOpacity}
            stroke={isSelected('weld_metal') ? '#f97316' : '#cbd5e1'}
            strokeWidth={isSelected('weld_metal') ? 2.5 : 1}
            className="cursor-pointer"
            onClick={() => onSelectZone('weld_metal')}
          />
          <circle
            cx="146"
            cy="88"
            r="7"
            fill="#0f172a"
            stroke="#38bdf8"
            strokeWidth={isSelected('weld_root') ? 3 : 1.5}
            className="cursor-pointer"
            onClick={() => onSelectZone('weld_root')}
          />
          <circle
            cx="186"
            cy="72"
            r="7"
            fill="#0f172a"
            stroke="#fb7185"
            strokeWidth={isSelected('weld_toe') ? 3 : 1.5}
            className="cursor-pointer"
            onClick={() => onSelectZone('weld_toe')}
          />
        </g>
      )}

      {/* Legend strip at bottom of SVG */}
      <g transform="translate(16, 198)" className="text-[10px]">
        <rect x="0" y="0" width="10" height="10" rx="2" fill="#e2e8f0" />
        <text x="15" y="9" fill="#cbd5e1" fontSize="10">Оёо</text>
        <rect x="48" y="0" width="10" height="10" rx="2" fill="#b45309" />
        <text x="63" y="9" fill="#cbd5e1" fontSize="10">ДНБ</text>
        <circle cx="105" cy="5" r="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
        <text x="114" y="9" fill="#cbd5e1" fontSize="10">Уг</text>
        <circle cx="144" cy="5" r="4" fill="#0f172a" stroke="#fb7185" strokeWidth="1.5" />
        <text x="153" y="9" fill="#cbd5e1" fontSize="10">Хөл (Зааг)</text>
      </g>
    </svg>
  );
};
