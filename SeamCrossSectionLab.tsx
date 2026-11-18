import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Ruler,
  Sliders,
  XOctagon,
} from 'lucide-react';
import {
  FILLET_PROFILES,
  GROOVE_TYPES,
  type FilletProfileId,
  type GrooveTypeId,
} from '../data/weldingData';

interface SeamCrossSectionLabProps {
  onCompleteLab: () => void;
  onGoNextStage: () => void;
}

type LabMode = 'groove' | 'fillet';

export const SeamCrossSectionLab: React.FC<SeamCrossSectionLabProps> = ({
  onCompleteLab,
  onGoNextStage,
}) => {
  const [labMode, setLabMode] = useState<LabMode>('groove');

  // Groove parameters
  const [grooveType, setGrooveType] = useState<GrooveTypeId>('single_v');
  const [thickness, setThickness] = useState<number>(12);
  const [bevelAngle, setBevelAngle] = useState<number>(60);
  const [rootGap, setRootGap] = useState<number>(2.0);
  const [rootFace, setRootFace] = useState<number>(1.5);
  const [currentAmp, setCurrentAmp] = useState<number>(135);
  const [showWeldFill, setShowWeldFill] = useState<boolean>(true);
  const [useBacking, setUseBacking] = useState<boolean>(false);

  // Fillet parameters
  const [filletProfile, setFilletProfile] = useState<FilletProfileId>('flat');
  const [legSize, setLegSize] = useState<number>(8);
  const [showGauge, setShowGauge] = useState<boolean>(true);

  const activeGroove = GROOVE_TYPES.find((g) => g.id === grooveType) || GROOVE_TYPES[1];
  const activeFillet =
    FILLET_PROFILES.find((f) => f.id === filletProfile) || FILLET_PROFILES[0];

  const handleSelectGroove = (id: GrooveTypeId) => {
    setGrooveType(id);
    onCompleteLab();
    const g = GROOVE_TYPES.find((item) => item.id === id);
    if (g) {
      setBevelAngle(g.defaultAngle);
      setRootGap(g.defaultGap);
      setRootFace(g.defaultRootFace);
      if (id === 'square') {
        setThickness(4);
        setCurrentAmp(95);
      } else if (id === 'double_v') {
        setThickness(20);
        setCurrentAmp(165);
      } else if (id === 'single_u') {
        setThickness(22);
        setCurrentAmp(175);
      } else {
        setThickness(12);
        setCurrentAmp(135);
      }
    }
  };

  // Physics / Engineering estimation for Groove Weld
  const grooveMetrics = useMemo(() => {
    const effectiveAngle = grooveType === 'square' ? 0 : bevelAngle;
    const rad = ((effectiveAngle / 2) * Math.PI) / 180;

    // Cross-sectional area estimate (mm^2)
    let area = 0;
    if (grooveType === 'square') {
      area = thickness * rootGap + 3.5;
    } else if (grooveType === 'single_v') {
      const h = Math.max(0, thickness - rootFace);
      area = thickness * rootGap + h * h * Math.tan(rad) + 6;
    } else if (grooveType === 'double_v') {
      const hHalf = Math.max(0, (thickness - rootFace) / 2);
      area = thickness * rootGap + 2 * (hHalf * hHalf * Math.tan(rad)) + 10;
    } else if (grooveType === 'single_u') {
      const h = Math.max(0, thickness - rootFace);
      area = thickness * (rootGap + 3.5) + h * h * Math.tan((12 * Math.PI) / 180) + 8;
    } else if (grooveType === 'bevel') {
      const h = Math.max(0, thickness - rootFace);
      area = thickness * rootGap + 0.5 * h * h * Math.tan((effectiveAngle * Math.PI) / 180) + 6;
    }

    // Penetration model: depends on current, thickness, bevel preparation, and gap
    const requiredAmp =
      grooveType === 'square'
        ? thickness * 24
        : grooveType === 'double_v'
          ? thickness * 7.2
          : thickness * 10.5;

    const bevelBonus = grooveType === 'square' ? 0 : Math.min(35, effectiveAngle * 0.48);
    const gapBonus = rootGap * 7;
    const rawPenetration =
      ((currentAmp / Math.max(40, requiredAmp)) * 78 + bevelBonus * 0.45 + gapBonus) *
      (grooveType === 'square' && thickness > 6 ? 0.55 : 1);

    const penetrationPct = Math.max(25, Math.min(108, Math.round(rawPenetration)));
    const recommendedPasses =
      thickness <= 5 ? 1 : thickness <= 12 ? 2 : thickness <= 20 ? 3 : 5;

    let status: 'nominal' | 'underfill' | 'burnthrough' = 'nominal';
    let statusTitle = 'Хэвийн — Бүрэн нэвчилттэй чанартай оёо';
    let statusDetail =
      'Ирмэг засал, завсар болон гүйдлийн хүч хавтангийн зузаантай зөв уялдсан байна.';

    if (thickness <= 4 && currentAmp > 145 && !useBacking) {
      status = 'burnthrough';
      statusDetail =
        'Нимгэн хуудсанд гүйдэл хэт их байна. Гүйдлийг 80–115 А болгох эсвэл дэвсгэр хавтан ашиглана уу.';
      statusTitle = 'Аюул — Цоорч урсах эрсдэл (Burn-through)';
    } else if (grooveType === 'square' && thickness > 6) {
      status = 'underfill';
      statusTitle = 'Анхаар — Дутуу нэвчилт (Incomplete Penetration)';
      statusDetail =
        '6 мм-ээс зузаан хавтанд I-хэлбэр (шулуун ирмэг) тохиромжгүй. V эсвэл X ирмэг засал сонгоно уу.';
    } else if (penetrationPct < 88) {
      status = 'underfill';
      statusTitle = 'Анхаар — Ёроолд хүрэхгүй дутуу нэвчилт';
      statusDetail =
        'Гүйдлийн хүч эсвэл угийн завсрыг (b) бага зэрэг нэмэх шаардлагатай байна.';
    } else if (rootGap > 3.8 && !useBacking) {
      status = 'burnthrough';
      statusTitle = 'Аюул — Завсар хэт өргөн (Урсах эрсдэл)';
      statusDetail =
        'Завсар 3.8 мм-ээс хэтэрвэл шингэн металл доош гоожно. Дэвсгэр хавтан тавих эсвэл завсрыг 1.5–3 мм болго.';
    }

    return {
      area: Math.round(area),
      penetrationPct: Math.min(100, penetrationPct),
      recommendedPasses,
      status,
      statusTitle,
      statusDetail,
    };
  }, [grooveType, thickness, bevelAngle, rootGap, rootFace, currentAmp, useBacking]);

  // Fillet calculations
  const filletMetrics = useMemo(() => {
    const nominalThroat = +(legSize * 0.707).toFixed(1);
    const effectiveThroat =
      filletProfile === 'concave'
        ? +(nominalThroat * 0.94).toFixed(1)
        : filletProfile === 'convex'
          ? +(nominalThroat * 1.12).toFixed(1)
          : nominalThroat;
    const area =
      filletProfile === 'convex'
        ? Math.round(0.5 * legSize * legSize * 1.28)
        : filletProfile === 'concave'
          ? Math.round(0.5 * legSize * legSize * 0.92)
          : Math.round(0.5 * legSize * legSize);

    return { nominalThroat, effectiveThroat, area };
  }, [legSize, filletProfile]);

  return (
    <section aria-labelledby="stage2-heading" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-medium text-amber-700 tracking-wide">
            02-р үе шат · Параметрийн симулятор
          </p>
          <h2
            id="stage2-heading"
            className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-slate-900 text-balance"
          >
            Ирмэг засал ба оёоны хэлбэрийн лаборатори
          </h2>
        </div>

        {/* Segmented Lab Mode Switch */}
        <div
          role="tablist"
          aria-label="Оёоны лабораторийн горим"
          className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-200/80 self-start md:self-auto"
        >
          <button
            role="tab"
            aria-selected={labMode === 'groove'}
            onClick={() => {
              setLabMode('groove');
              onCompleteLab();
            }}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              labMode === 'groove'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ховилын оёо (Ирмэг засал)
          </button>
          <button
            role="tab"
            aria-selected={labMode === 'fillet'}
            onClick={() => {
              setLabMode('fillet');
              onCompleteLab();
            }}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              labMode === 'fillet'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Булангийн оёо (Fillet)
          </button>
        </div>
      </div>

      {labMode === 'groove' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Interactive Groove Canvas */}
          <div className="lg:col-span-7 flex flex-col rounded-xl border border-slate-200 bg-slate-950 text-slate-100 overflow-hidden">
            {/* Groove Shape Selector */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900">
              <div className="flex flex-wrap items-center gap-1.5">
                {GROOVE_TYPES.map((g) => {
                  const active = g.id === grooveType;
                  return (
                    <button
                      key={g.id}
                      onClick={() => handleSelectGroove(g.id)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {g.code}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 text-xs">
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={showWeldFill}
                    onChange={(e) => setShowWeldFill(e.target.checked)}
                    className="rounded border-slate-600 accent-amber-500"
                  />
                  <span>Оёог дүүргэх</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={useBacking}
                    onChange={(e) => setUseBacking(e.target.checked)}
                    className="rounded border-slate-600 accent-sky-500"
                  />
                  <span>Дэвсгэр</span>
                </label>
              </div>
            </div>

            {/* Live Dynamic Cross-Section SVG */}
            <div className="flex-1 blueprint-grid p-4 md:p-6 flex flex-col items-center justify-center min-h-[340px]">
              <GrooveCrossSectionSvg
                grooveType={grooveType}
                thickness={thickness}
                bevelAngle={bevelAngle}
                rootGap={rootGap}
                rootFace={rootFace}
                penetrationPct={grooveMetrics.penetrationPct}
                showWeldFill={showWeldFill}
                useBacking={useBacking}
                status={grooveMetrics.status}
              />
            </div>

            {/* Real-time Engineering Readout + Quality Diagnosis */}
            <div className="border-t border-slate-800 bg-slate-900/95 p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3 text-center sm:text-left">
                <div className="rounded-lg bg-slate-950/70 border border-slate-800 px-3 py-2">
                  <div className="text-[11px] text-slate-400">Нэвчилтийн гүн</div>
                  <div className="text-base font-bold font-mono tabular-nums text-white">
                    {grooveMetrics.penetrationPct}%
                  </div>
                </div>
                <div className="rounded-lg bg-slate-950/70 border border-slate-800 px-3 py-2">
                  <div className="text-[11px] text-slate-400">Оёоны талбай</div>
                  <div className="text-base font-bold font-mono tabular-nums text-white">
                    {grooveMetrics.area} мм²
                  </div>
                </div>
                <div className="rounded-lg bg-slate-950/70 border border-slate-800 px-3 py-2">
                  <div className="text-[11px] text-slate-400">Санал болгох үе</div>
                  <div className="text-base font-bold font-mono tabular-nums text-white">
                    {grooveMetrics.recommendedPasses} үе
                  </div>
                </div>
              </div>

              {/* Dual-coded status alert */}
              <div
                className={`flex items-start gap-2.5 rounded-lg border p-3 ${
                  grooveMetrics.status === 'nominal'
                    ? 'bg-emerald-950/50 border-emerald-700/60 text-emerald-100'
                    : grooveMetrics.status === 'underfill'
                      ? 'bg-amber-950/50 border-amber-700/60 text-amber-100'
                      : 'bg-rose-950/50 border-rose-700/60 text-rose-100'
                }`}
              >
                {grooveMetrics.status === 'nominal' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : grooveMetrics.status === 'underfill' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <XOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-xs font-semibold">{grooveMetrics.statusTitle}</div>
                  <p className="mt-0.5 text-xs opacity-90 leading-relaxed">
                    {grooveMetrics.statusDetail}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Controls & Explanation Deck */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 md:p-6 space-y-5">
            <div className="space-y-5">
              <div>
                <div className="text-xs text-slate-500">
                  {activeGroove.nameEn} · Тохирох зузаан: {activeGroove.recommendedThickness}
                </div>
                <h3 className="mt-1 text-xl font-bold text-slate-900">{activeGroove.nameMn}</h3>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                  {activeGroove.description}
                </p>
              </div>

              {/* Parameter Sliders */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Sliders className="w-3.5 h-3.5 text-amber-600" />
                  Геометр ба горимын тохируулга
                </div>

                {/* Thickness s */}
                <SliderControl
                  id="slider-thickness"
                  label="Хавтангийн зузаан (s)"
                  value={thickness}
                  unit="мм"
                  min={2}
                  max={30}
                  step={1}
                  onChange={(v) => {
                    setThickness(v);
                    onCompleteLab();
                  }}
                />

                {/* Bevel Angle alpha */}
                <SliderControl
                  id="slider-angle"
                  label="Налуугийн өнцөг (α)"
                  value={grooveType === 'square' ? 0 : bevelAngle}
                  unit="°"
                  min={20}
                  max={75}
                  step={5}
                  disabled={grooveType === 'square'}
                  onChange={(v) => {
                    setBevelAngle(v);
                    onCompleteLab();
                  }}
                />

                {/* Root Gap b */}
                <SliderControl
                  id="slider-gap"
                  label="Угийн завсар (b)"
                  value={rootGap}
                  unit="мм"
                  min={0}
                  max={5}
                  step={0.5}
                  onChange={(v) => {
                    setRootGap(v);
                    onCompleteLab();
                  }}
                />

                {/* Root Face c */}
                <SliderControl
                  id="slider-face"
                  label="Угийн мохоолт (c)"
                  value={grooveType === 'square' ? 0 : rootFace}
                  unit="мм"
                  min={0}
                  max={4}
                  step={0.5}
                  disabled={grooveType === 'square'}
                  onChange={(v) => {
                    setRootFace(v);
                    onCompleteLab();
                  }}
                />

                {/* Welding Current I */}
                <SliderControl
                  id="slider-current"
                  label="Гагнуурын гүйдэл (I)"
                  value={currentAmp}
                  unit="А"
                  min={60}
                  max={240}
                  step={5}
                  onChange={(v) => {
                    setCurrentAmp(v);
                    onCompleteLab();
                  }}
                />
              </div>

              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-700 leading-relaxed">
                <span className="font-semibold text-slate-900">Хэрэглээний зөвлөмж: </span>
                {activeGroove.applicationNote}
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-200">
              <button
                onClick={onGoNextStage}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                3-р шат: Байрлал ба Тэмдэг <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ---------- FILLET WELD LAB ---------- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 flex flex-col rounded-xl border border-slate-200 bg-slate-950 text-slate-100 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900">
              <div className="flex items-center gap-1.5">
                {FILLET_PROFILES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setFilletProfile(p.id);
                      onCompleteLab();
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      p.id === filletProfile
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {p.nameMn.split(' ')[0]}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowGauge((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                  showGauge
                    ? 'bg-sky-600 border-sky-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <Ruler className="w-3.5 h-3.5" />
                Хэмжигч шаблон
              </button>
            </div>

            <div className="flex-1 blueprint-grid p-4 md:p-6 flex items-center justify-center min-h-[340px]">
              <FilletProfileSvg
                profile={filletProfile}
                legSize={legSize}
                throat={filletMetrics.nominalThroat}
                showGauge={showGauge}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 border-t border-slate-800 bg-slate-900/95">
              <div className="rounded-lg bg-slate-950/70 border border-slate-800 px-3 py-2">
                <div className="text-[11px] text-slate-400">Оёоны катет (K)</div>
                <div className="text-base font-bold font-mono tabular-nums text-white">
                  {legSize} мм
                </div>
              </div>
              <div className="rounded-lg bg-slate-950/70 border border-slate-800 px-3 py-2">
                <div className="text-[11px] text-slate-400">Тооцоот өндөр (a)</div>
                <div className="text-base font-bold font-mono tabular-nums text-amber-400">
                  {filletMetrics.effectiveThroat} мм
                </div>
              </div>
              <div className="rounded-lg bg-slate-950/70 border border-slate-800 px-3 py-2">
                <div className="text-[11px] text-slate-400">Металл зарцуулалт</div>
                <div className="text-base font-bold font-mono tabular-nums text-white">
                  {filletMetrics.area} мм²
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 md:p-6 space-y-5">
            <div className="space-y-4">
              <div>
                <div className="text-xs text-slate-500">
                  {activeFillet.nameEn} · Томьёо: a = 0.707 × K
                </div>
                <h3 className="mt-1 text-xl font-bold text-slate-900">{activeFillet.nameMn}</h3>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                  {activeFillet.stressBehavior}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <SliderControl
                  id="slider-leg"
                  label="Булангийн оёоны катет (K)"
                  value={legSize}
                  unit="мм"
                  min={3}
                  max={14}
                  step={1}
                  onChange={(v) => {
                    setLegSize(v);
                    onCompleteLab();
                  }}
                />
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="rounded-lg bg-emerald-50/70 border border-emerald-200 p-3">
                  <div className="text-xs font-semibold text-emerald-900">Тохиромжтой хэрэглээ</div>
                  <p className="mt-1 text-xs text-emerald-950/90 leading-relaxed">
                    {activeFillet.bestUse}
                  </p>
                </div>
                <div className="rounded-lg bg-amber-50/70 border border-amber-200 p-3">
                  <div className="text-xs font-semibold text-amber-900">Шалгах үзүүлэлт</div>
                  <p className="mt-1 text-xs text-amber-950/90 leading-relaxed">
                    {activeFillet.caution}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-200">
              <button
                onClick={onGoNextStage}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                3-р шат: Байрлал ба Тэмдэг <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

/* ---------- Reusable Slider Component ---------- */

interface SliderControlProps {
  id: string;
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  onChange: (val: number) => void;
}

const SliderControl: React.FC<SliderControlProps> = ({
  id,
  label,
  value,
  unit,
  min,
  max,
  step,
  disabled = false,
  onChange,
}) => (
  <div className={disabled ? 'opacity-45 pointer-events-none' : ''}>
    <div className="flex items-center justify-between text-xs mb-1.5">
      <label htmlFor={id} className="font-medium text-slate-700">
        {label}
      </label>
      <span className="font-mono font-semibold tabular-nums text-slate-900">
        {value} {unit}
      </span>
    </div>
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="weld-slider w-full"
    />
  </div>
);

/* ---------- Dynamic Groove Cross-Section SVG ---------- */

interface GrooveCrossSectionSvgProps {
  grooveType: GrooveTypeId;
  thickness: number;
  bevelAngle: number;
  rootGap: number;
  rootFace: number;
  penetrationPct: number;
  showWeldFill: boolean;
  useBacking: boolean;
  status: 'nominal' | 'underfill' | 'burnthrough';
}

const GrooveCrossSectionSvg: React.FC<GrooveCrossSectionSvgProps> = ({
  grooveType,
  thickness,
  bevelAngle,
  rootGap,
  rootFace,
  penetrationPct,
  showWeldFill,
  useBacking,
  status,
}) => {
  const cx = 210;
  const topY = 74;
  // Scale thickness (2..30 mm) to visual pixel height (24..115 px)
  const h = 22 + ((thickness - 2) / 28) * 90;
  const botY = topY + h;
  const gapPx = rootGap * 5.2;
  const halfGap = gapPx / 2;
  const facePx = Math.min(h * 0.45, rootFace * 4.5);

  const effectiveAngle = grooveType === 'square' ? 0 : bevelAngle;
  const tanHalf = Math.tan(((effectiveAngle / 2) * Math.PI) / 180);
  const tanFull = Math.tan((effectiveAngle * Math.PI) / 180);

  let leftPoly = '';
  let rightPoly = '';
  let weldPoly = '';
  let topOpeningHalf = halfGap;

  if (grooveType === 'square') {
    leftPoly = `36,${topY} ${cx - halfGap},${topY} ${cx - halfGap},${botY} 36,${botY}`;
    rightPoly = `${cx + halfGap},${topY} 384,${topY} 384,${botY} ${cx + halfGap},${botY}`;
  } else if (grooveType === 'single_v') {
    const bevelH = Math.max(8, h - facePx);
    const bevelOffset = Math.min(82, bevelH * tanHalf);
    topOpeningHalf = halfGap + bevelOffset;
    leftPoly = `36,${topY} ${cx - topOpeningHalf},${topY} ${cx - halfGap},${botY - facePx} ${cx - halfGap},${botY} 36,${botY}`;
    rightPoly = `${cx + topOpeningHalf},${topY} 384,${topY} 384,${botY} ${cx + halfGap},${botY} ${cx + halfGap},${botY - facePx}`;
  } else if (grooveType === 'double_v') {
    const midY = topY + h / 2;
    const halfFace = facePx / 2;
    const bevelH = Math.max(6, h / 2 - halfFace);
    const bevelOffset = Math.min(72, bevelH * tanHalf);
    topOpeningHalf = halfGap + bevelOffset;
    leftPoly = `36,${topY} ${cx - topOpeningHalf},${topY} ${cx - halfGap},${midY - halfFace} ${cx - halfGap},${midY + halfFace} ${cx - topOpeningHalf},${botY} 36,${botY}`;
    rightPoly = `${cx + topOpeningHalf},${topY} 384,${topY} 384,${botY} ${cx + topOpeningHalf},${botY} ${cx + halfGap},${midY + halfFace} ${cx + halfGap},${midY - halfFace}`;
  } else if (grooveType === 'single_u') {
    const bevelOffset = Math.min(60, h * 0.48);
    topOpeningHalf = halfGap + bevelOffset;
    leftPoly = `36,${topY} ${cx - topOpeningHalf},${topY} ${cx - halfGap - 10},${botY - facePx - 14} ${cx - halfGap},${botY - facePx} ${cx - halfGap},${botY} 36,${botY}`;
    rightPoly = `${cx + topOpeningHalf},${topY} 384,${topY} 384,${botY} ${cx + halfGap},${botY} ${cx + halfGap},${botY - facePx} ${cx + halfGap + 10},${botY - facePx - 14}`;
  } else if (grooveType === 'bevel') {
    const bevelH = Math.max(8, h - facePx);
    const bevelOffset = Math.min(88, bevelH * tanFull * 0.65);
    topOpeningHalf = halfGap + bevelOffset;
    leftPoly = `36,${topY} ${cx - halfGap},${topY} ${cx - halfGap},${botY} 36,${botY}`;
    rightPoly = `${cx + topOpeningHalf},${topY} 384,${topY} 384,${botY} ${cx + halfGap},${botY} ${cx + halfGap},${botY - facePx}`;
  }

  // Penetration depth visual
  const penDepthY = topY + (h * penetrationPct) / 100;
  const crownSag = status === 'burnthrough' ? 14 : 6;

  if (grooveType === 'bevel') {
    weldPoly = `M ${cx - halfGap - 6},${topY} Q ${cx + bevelOffsetSafe(topOpeningHalf) * 0.45},${topY - 12} ${cx + topOpeningHalf + 6},${topY} L ${cx + halfGap + 3},${penDepthY} Q ${cx},${penDepthY + crownSag} ${cx - halfGap - 3},${penDepthY} Z`;
  } else {
    weldPoly = `M ${cx - topOpeningHalf - 7},${topY} Q ${cx},${topY - 13} ${cx + topOpeningHalf + 7},${topY} L ${cx + halfGap + 4},${penDepthY} Q ${cx},${penDepthY + crownSag} ${cx - halfGap - 4},${penDepthY} Z`;
  }

  const weldColor =
    status === 'nominal'
      ? '#fb923c'
      : status === 'underfill'
        ? '#f59e0b'
        : '#f43f5e';

  return (
    <svg
      viewBox="0 0 420 260"
      className="w-full max-w-[480px] h-auto select-none"
      role="img"
      aria-label="Ирмэг заслын динамик огтлол"
    >
      {/* HAZ Halo behind weld */}
      {showWeldFill && (
        <path
          d={weldPoly}
          fill="none"
          stroke="#d97706"
          strokeOpacity="0.32"
          strokeWidth="14"
          strokeLinejoin="round"
        />
      )}

      {/* Left & Right Steel Plates */}
      <polygon points={leftPoly} fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
      <polygon points={rightPoly} fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />

      {/* Backing Bar if enabled */}
      {useBacking && (
        <g>
          <rect
            x={cx - 48}
            y={botY + 1}
            width="96"
            height="14"
            rx="2"
            fill="#334155"
            stroke="#38bdf8"
            strokeWidth="1.5"
          />
          <text x={cx} y={botY + 28} textAnchor="middle" fill="#38bdf8" fontSize="11">
            Дэвсгэр хавтан
          </text>
        </g>
      )}

      {/* Weld Fill Bead */}
      {showWeldFill && (
        <g>
          <path
            d={weldPoly}
            fill={weldColor}
            fillOpacity="0.88"
            stroke="#fed7aa"
            strokeWidth="1.5"
          />
          {/* Lack of penetration dark void if underfill */}
          {penetrationPct < 90 && (
            <rect
              x={cx - Math.max(2, halfGap)}
              y={penDepthY}
              width={Math.max(4, halfGap * 2)}
              height={Math.max(4, botY - penDepthY)}
              fill="#020617"
              stroke="#fbbf24"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          )}
        </g>
      )}

      {/* Dimension Callout: Thickness (s) */}
      <g stroke="#94a3b8" strokeWidth="1">
        <line x1="24" y1={topY} x2="24" y2={botY} />
        <line x1="19" y1={topY} x2="29" y2={topY} />
        <line x1="19" y1={botY} x2="29" y2={botY} />
      </g>
      <text
        x="18"
        y={(topY + botY) / 2 + 4}
        textAnchor="end"
        fill="#e2e8f0"
        fontSize="11"
        fontFamily="JetBrains Mono, monospace"
      >
        s={thickness}
      </text>

      {/* Dimension Callout: Angle (alpha) */}
      {grooveType !== 'square' && (
        <g>
          <path
            d={`M ${cx - 24},${topY - 24} A 34 34 0 0 1 ${cx + 24},${topY - 24}`}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.2"
          />
          <text
            x={cx}
            y={topY - 32}
            textAnchor="middle"
            fill="#38bdf8"
            fontSize="12"
            fontFamily="JetBrains Mono, monospace"
          >
            α = {bevelAngle}°
          </text>
        </g>
      )}

      {/* Dimension Callout: Root Gap (b) */}
      <g>
        <line x1={cx - halfGap} y1={botY + 34} x2={cx + halfGap} y2={botY + 34} stroke="#fbbf24" strokeWidth="1.5" />
        <text
          x={cx}
          y={botY + 50}
          textAnchor="middle"
          fill="#fbbf24"
          fontSize="11"
          fontFamily="JetBrains Mono, monospace"
        >
          завсар b = {rootGap} мм
        </text>
      </g>
    </svg>
  );
};

function bevelOffsetSafe(val: number): number {
  return Number.isFinite(val) ? val : 20;
}

/* ---------- Dynamic Fillet Profile & Gauge SVG ---------- */

interface FilletProfileSvgProps {
  profile: FilletProfileId;
  legSize: number;
  throat: number;
  showGauge: boolean;
}

const FilletProfileSvg: React.FC<FilletProfileSvgProps> = ({
  profile,
  legSize,
  throat,
  showGauge,
}) => {
  const originX = 150;
  const originY = 175;
  // Scale legSize (3..14 mm) to px (36..115 px)
  const kPx = 30 + ((legSize - 3) / 11) * 76;

  // Fillet hypotenuse curve control point
  const midX = originX + kPx * 0.5;
  const midY = originY - kPx * 0.5;
  const ctrlOffset = profile === 'convex' ? 24 : profile === 'concave' ? -20 : 0;
  const ctrlX = midX + ctrlOffset;
  const ctrlY = midY - ctrlOffset;

  const weldPath = `M ${originX},${originY - kPx} Q ${ctrlX},${ctrlY} ${originX + kPx},${originY} L ${originX},${originY} Z`;

  return (
    <svg
      viewBox="0 0 380 245"
      className="w-full max-w-[440px] h-auto select-none"
      role="img"
      aria-label="Булангийн оёоны профиль ба катетын хэмжээ"
    >
      {/* Vertical Stem Plate */}
      <rect x="114" y="28" width="36" height="147" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
      {/* Horizontal Base Plate */}
      <rect x="52" y="175" width="276" height="36" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />

      {/* Fillet Weld Metal */}
      <path d={weldPath} fill="#fb923c" fillOpacity="0.88" stroke="#fed7aa" strokeWidth="1.5" />

      {/* Throat thickness line (a) */}
      <line
        x1={originX}
        y1={originY}
        x2={midX + ctrlOffset * 0.5}
        y2={midY - ctrlOffset * 0.5}
        stroke="#38bdf8"
        strokeWidth="2"
        strokeDasharray="4 3"
      />
      <text
        x={midX + ctrlOffset * 0.5 + 10}
        y={midY - ctrlOffset * 0.5 - 6}
        fill="#38bdf8"
        fontSize="11"
        fontFamily="JetBrains Mono, monospace"
      >
        a = {throat} мм
      </text>

      {/* Leg K Callouts */}
      <line x1={originX} y1={originY + 22} x2={originX + kPx} y2={originY + 22} stroke="#fbbf24" strokeWidth="1.5" />
      <text
        x={originX + kPx / 2}
        y={originY + 35}
        textAnchor="middle"
        fill="#fbbf24"
        fontSize="11"
        fontFamily="JetBrains Mono, monospace"
      >
        K = {legSize} мм
      </text>

      <line x1={96} y1={originY - kPx} x2={96} y2={originY} stroke="#fbbf24" strokeWidth="1.5" />
      <text
        x={90}
        y={originY - kPx / 2 + 4}
        textAnchor="end"
        fill="#fbbf24"
        fontSize="11"
        fontFamily="JetBrains Mono, monospace"
      >
        K={legSize}
      </text>

      {/* Optional Fillet Weld Gauge Overlay */}
      {showGauge && (
        <g opacity="0.88">
          <polygon
            points={`${originX},${originY - kPx - 28} ${originX + kPx + 28},${originY} ${originX + kPx + 42},${originY - 14} ${originX + 14},${originY - kPx - 42}`}
            fill="#0284c7"
            fillOpacity="0.22"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="5 3"
          />
          <text
            x={originX + kPx + 18}
            y={originY - kPx + 4}
            fill="#7dd3fc"
            fontSize="11"
          >
            Хэмжигч шаблон
          </text>
        </g>
      )}
    </svg>
  );
};
