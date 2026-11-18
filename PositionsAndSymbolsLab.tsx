import React, { useState } from 'react';
import {
  ArrowDown,
  ChevronRight,
  Compass,
  FileCode2,
  Gauge,
} from 'lucide-react';
import { WELD_POSITIONS, type WeldPositionId } from '../data/weldingData';

interface PositionsAndSymbolsLabProps {
  onCompleteStage: () => void;
  onGoNextStage: () => void;
}

type Stage3Tab = 'positions' | 'symbols';
type SymbolWeldKind = 'fillet' | 'single_v' | 'double_v' | 'square';
type SymbolSide = 'arrow' | 'other' | 'both';
type SurfaceContour = 'none' | 'flat' | 'convex' | 'concave';

export const PositionsAndSymbolsLab: React.FC<PositionsAndSymbolsLabProps> = ({
  onCompleteStage,
  onGoNextStage,
}) => {
  const [activeTab, setActiveTab] = useState<Stage3Tab>('positions');

  // Position lab state
  const [selectedPos, setSelectedPos] = useState<WeldPositionId>('PA');
  const posInfo =
    WELD_POSITIONS.find((p) => p.id === selectedPos) || WELD_POSITIONS[0];

  // ISO 2553 Symbol builder state
  const [weldKind, setWeldKind] = useState<SymbolWeldKind>('fillet');
  const [symbolSide, setSymbolSide] = useState<SymbolSide>('arrow');
  const [legDimension, setLegDimension] = useState<number>(6);
  const [isIntermittent, setIsIntermittent] = useState<boolean>(false);
  const [allAround, setAllAround] = useState<boolean>(false);
  const [fieldWeld, setFieldWeld] = useState<boolean>(false);
  const [contour, setContour] = useState<SurfaceContour>('none');

  const handleSelectPos = (id: WeldPositionId) => {
    setSelectedPos(id);
    onCompleteStage();
  };

  const handleSymbolChange = <T,>(setter: React.Dispatch<React.SetStateAction<T>>, val: T) => {
    setter(val);
    onCompleteStage();
  };

  return (
    <section aria-labelledby="stage3-heading" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-medium text-amber-700 tracking-wide">
            03-р үе шат · Орон зай ба Стандарт зураг
          </p>
          <h2
            id="stage3-heading"
            className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-slate-900 text-balance"
          >
            Оёоны орон зайн байрлал ба ISO 2553 тэмдэглэгээ
          </h2>
        </div>

        {/* Sub-tab Switch */}
        <div
          role="tablist"
          aria-label="Байрлал ба Тэмдэглэгээ"
          className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-200/80 self-start md:self-auto"
        >
          <button
            role="tab"
            aria-selected={activeTab === 'positions'}
            onClick={() => setActiveTab('positions')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'positions'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Байрлал (PA – PE)
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'symbols'}
            onClick={() => setActiveTab('symbols')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'symbols'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            Зургийн тэмдэглэгээ
          </button>
        </div>
      </div>

      {activeTab === 'positions' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Interactive Spatial Position Stage */}
          <div className="lg:col-span-7 flex flex-col rounded-xl border border-slate-200 bg-slate-950 text-slate-100 overflow-hidden">
            {/* Position Selector Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 px-4 py-3 border-b border-slate-800 bg-slate-900">
              {WELD_POSITIONS.map((pos) => {
                const active = pos.id === selectedPos;
                return (
                  <button
                    key={pos.id}
                    onClick={() => handleSelectPos(pos.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span className="font-mono font-bold">{pos.id}</span> · {pos.awsCode}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 blueprint-grid p-5 md:p-6 flex flex-col items-center justify-center min-h-[360px]">
              <WeldPositionSpatialSvg position={selectedPos} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 border-t border-slate-800 bg-slate-900/95">
              <div className="rounded-lg bg-slate-950/70 border border-slate-800 px-3 py-2">
                <div className="text-[11px] text-slate-400">Стандарт код</div>
                <div className="text-sm font-bold font-mono text-white">
                  {posInfo.id} (AWS {posInfo.awsCode})
                </div>
              </div>
              <div className="rounded-lg bg-slate-950/70 border border-slate-800 px-3 py-2">
                <div className="text-[11px] text-slate-400">Хүндийн түвшин</div>
                <div className="text-sm font-bold text-amber-400">{posInfo.difficulty}</div>
              </div>
              <div className="rounded-lg bg-slate-950/70 border border-slate-800 px-3 py-2">
                <div className="text-[11px] text-slate-400">Гүйдлийн тохируулга</div>
                <div className="text-xs font-medium text-sky-300">{posInfo.currentAdjustment}</div>
              </div>
            </div>
          </div>

          {/* Right Concept Card */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 md:p-6 space-y-5">
            <div className="space-y-4">
              <div>
                <div className="text-xs text-slate-500">
                  {posInfo.nameEn} · ISO 6947: {posInfo.id}
                </div>
                <h3 className="mt-1 text-xl font-bold text-slate-900">{posInfo.nameMn}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {posInfo.description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                    <ArrowDown className="w-3.5 h-3.5 text-amber-600" />
                    Таталцлын хүчний нөлөө
                  </div>
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                    {posInfo.gravityEffect}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                    <Gauge className="w-3.5 h-3.5 text-sky-600" />
                    Электродын налуу өнцөг
                  </div>
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                    {posInfo.electrodeAngle}
                  </p>
                </div>

                <div className="rounded-lg bg-emerald-50/70 border border-emerald-200 p-3.5">
                  <div className="text-xs font-semibold text-emerald-900">Гагнуурчны арга барил</div>
                  <p className="mt-1 text-xs text-emerald-950/90 leading-relaxed">
                    {posInfo.techniqueTip}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setActiveTab('symbols')}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
              >
                Дараах: Зургийн тэмдэглэгээ
              </button>
              <button
                onClick={onGoNextStage}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                4-р шат: Шалгалт <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ---------- ISO 2553 SYMBOL BUILDER ---------- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Interactive Symbol + Physical Outcome Canvas */}
          <div className="lg:col-span-7 flex flex-col rounded-xl border border-slate-200 bg-slate-950 text-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-900 flex items-center justify-between text-xs text-slate-300">
              <span>Зураг дээрх тэмдэглэгээ → Бодит гүйцэтгэл</span>
              <span className="font-mono text-amber-400">ISO 2553 / AWS A2.4</span>
            </div>

            <div className="flex-1 blueprint-grid p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-center min-h-[360px]">
              {/* Technical Drawing Symbol */}
              <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4 flex flex-col items-center">
                <div className="w-full text-xs text-slate-400 mb-2">1. Техникийн зургийн тэмдэг</div>
                <IsoWeldSymbolSvg
                  weldKind={weldKind}
                  side={symbolSide}
                  dimension={legDimension}
                  intermittent={isIntermittent}
                  allAround={allAround}
                  fieldWeld={fieldWeld}
                  contour={contour}
                />
              </div>

              {/* Physical Resulting Weld */}
              <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4 flex flex-col items-center">
                <div className="w-full text-xs text-slate-400 mb-2">2. Бодит оёоны байрлал</div>
                <PhysicalSymbolResultSvg
                  weldKind={weldKind}
                  side={symbolSide}
                  contour={contour}
                />
              </div>
            </div>

            {/* Live Plain-Mongolian Translation of the Symbol */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/95">
              <div className="text-xs text-slate-400 mb-1">Тэмдэглэгээний уншилт:</div>
              <p className="text-sm font-medium text-white leading-relaxed">
                {describeSymbolInMongolian({
                  weldKind,
                  symbolSide,
                  legDimension,
                  isIntermittent,
                  allAround,
                  fieldWeld,
                  contour,
                })}
              </p>
            </div>
          </div>

          {/* Right Builder Controls */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 md:p-6 space-y-5">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Тэмдэглэгээ угсрах самбар</h3>
                <p className="mt-1 text-xs text-slate-600">
                  Доорх элементүүдийг сольж, инженерийн зургийн тэмдэг хэрхэн өөрчлөгдөхийг ажиглаарай.
                </p>
              </div>

              {/* Weld Kind */}
              <div>
                <div className="text-xs font-semibold text-slate-700 mb-1.5">Оёоны үндсэн тэмдэг</div>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: 'fillet', label: 'Булангийн (△)' },
                      { id: 'single_v', label: 'Тулгасан V' },
                      { id: 'double_v', label: 'Тулгасан X' },
                      { id: 'square', label: 'Шулуун (||)' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSymbolChange(setWeldKind, item.id)}
                      className={`px-3 py-2 rounded-lg border text-xs font-medium text-left transition-colors ${
                        weldKind === item.id
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Side Selection */}
              <div>
                <div className="text-xs font-semibold text-slate-700 mb-1.5">
                  Түлхүүр шугам дээрх байрлал
                </div>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-slate-100">
                  {(
                    [
                      { id: 'arrow', label: 'Сумын тал' },
                      { id: 'other', label: 'Эсрэг тал' },
                      { id: 'both', label: 'Хоёр тал' },
                    ] as const
                  ).map((s) => {
                    const disabled = weldKind === 'double_v' && s.id !== 'both';
                    const active = weldKind === 'double_v' ? s.id === 'both' : symbolSide === s.id;
                    return (
                      <button
                        key={s.id}
                        disabled={disabled}
                        onClick={() => handleSymbolChange(setSymbolSide, s.id)}
                        className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                          active
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size & Contour */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="symbol-dim"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    {weldKind === 'fillet' ? 'Катет z (мм)' : 'Гүн s (мм)'}
                  </label>
                  <input
                    id="symbol-dim"
                    type="number"
                    min={2}
                    max={24}
                    value={legDimension}
                    onChange={(e) =>
                      handleSymbolChange(
                        setLegDimension,
                        Math.max(2, Math.min(24, Number(e.target.value) || 6))
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-mono tabular-nums text-slate-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="symbol-contour"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Гадаргуугийн хэлбэр
                  </label>
                  <select
                    id="symbol-contour"
                    value={contour}
                    onChange={(e) =>
                      handleSymbolChange(setContour, e.target.value as SurfaceContour)
                    }
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 bg-white"
                  >
                    <option value="none">Энгийн (Заагаагүй)</option>
                    <option value="flat">Тэгш (—)</option>
                    <option value="convex">Гүдгэр (⌒)</option>
                    <option value="concave">Хотгор (⌣)</option>
                  </select>
                </div>
              </div>

              {/* Supplementary Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="text-xs font-semibold text-slate-700">Нэмэлт тэмдэглэгээ</div>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allAround}
                    onChange={(e) => handleSymbolChange(setAllAround, e.target.checked)}
                    className="rounded border-slate-300 accent-amber-600"
                  />
                  <span>Эргэн тойрон битүү гагнах (Тойрог ○)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fieldWeld}
                    onChange={(e) => handleSymbolChange(setFieldWeld, e.target.checked)}
                    className="rounded border-slate-300 accent-amber-600"
                  />
                  <span>Угсралтын талбайд гагнах (Дарцаг ⚑)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isIntermittent}
                    onChange={(e) => handleSymbolChange(setIsIntermittent, e.target.checked)}
                    className="rounded border-slate-300 accent-amber-600"
                  />
                  <span>Тасархай (алхамтай) оёо: 4 × 50 (100)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-200">
              <button
                onClick={onGoNextStage}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                4-р шат: Мэдлэг шалгах <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

/* ---------- Spatial Welding Position SVG ---------- */

const WeldPositionSpatialSvg: React.FC<{ position: WeldPositionId }> = ({ position }) => {
  return (
    <svg
      viewBox="0 0 380 250"
      className="w-full max-w-[440px] h-auto select-none"
      role="img"
      aria-label={`${position} гагнуурын байрлалын схем`}
    >
      {/* Gravity Vector always pointing down on right */}
      <g transform="translate(330, 48)">
        <line x1="0" y1="0" x2="0" y2="52" stroke="#38bdf8" strokeWidth="2" />
        <polygon points="-5,48 5,48 0,58" fill="#38bdf8" />
        <text x="0" y="-8" textAnchor="middle" fill="#38bdf8" fontSize="11" fontFamily="JetBrains Mono">
          Таталцал g
        </text>
      </g>

      {position === 'PA' && (
        <g>
          {/* Flat horizontal plates */}
          <rect x="65" y="152" width="110" height="24" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="183" y="152" width="110" height="24" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Molten Weld Bead on top */}
          <path d="M 164,152 Q 179,138 194,152 L 184,176 L 174,176 Z" fill="#fb923c" />
          {/* Torch from above */}
          <line x1="179" y1="138" x2="154" y2="70" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
          <circle cx="179" cy="142" r="9" fill="#fef08a" fillOpacity="0.65" />
          <text x="179" y="205" textAnchor="middle" fill="#e2e8f0" fontSize="12">
            Хэвтээ хавтгай · Дээрээс гагнах (PA / 1G)
          </text>
        </g>
      )}

      {position === 'PB' && (
        <g>
          {/* Horizontal plate + Vertical plate */}
          <rect x="75" y="160" width="195" height="24" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="135" y="56" width="24" height="104" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Fillet weld in corner */}
          <polygon points="159,130 189,160 159,160" fill="#fb923c" />
          {/* 45 deg torch */}
          <line x1="172" y1="146" x2="225" y2="92" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
          <circle cx="170" cy="148" r="9" fill="#fef08a" fillOpacity="0.65" />
          <text x="175" y="210" textAnchor="middle" fill="#e2e8f0" fontSize="12">
            Т-булан хэвтээгээр (PB / 2F) · Электрод 45°
          </text>
        </g>
      )}

      {position === 'PC' && (
        <g>
          {/* Vertical wall with horizontal seam across */}
          <rect x="110" y="38" width="140" height="72" fill="#475569" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="110" y="118" width="140" height="72" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Horizontal weld seam */}
          <rect x="110" y="108" width="140" height="12" fill="#fb923c" />
          {/* Horizontal travel arrow */}
          <line x1="130" y1="90" x2="225" y2="90" stroke="#fbbf24" strokeWidth="2" />
          <polygon points="222,85 234,90 222,95" fill="#fbbf24" />
          {/* Torch slightly upward */}
          <line x1="180" y1="114" x2="220" y2="144" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
          <circle cx="180" cy="114" r="8" fill="#fef08a" fillOpacity="0.65" />
          <text x="180" y="216" textAnchor="middle" fill="#e2e8f0" fontSize="12">
            Босоо хана дээр хөндлөн (PC / 2G)
          </text>
        </g>
      )}

      {(position === 'PF' || position === 'PG') && (
        <g>
          {/* Vertical plates side by side */}
          <rect x="108" y="36" width="64" height="156" fill="#475569" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="182" y="36" width="64" height="156" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="170" y="36" width="14" height="156" fill="#fb923c" />
          {/* Direction arrow: Up for PF, Down for PG */}
          {position === 'PF' ? (
            <g>
              <line x1="84" y1="170" x2="84" y2="62" stroke="#34d399" strokeWidth="2.5" />
              <polygon points="79,66 84,54 89,66" fill="#34d399" />
              <text x="72" y="120" textAnchor="end" fill="#34d399" fontSize="11">Дээш</text>
            </g>
          ) : (
            <g>
              <line x1="84" y1="58" x2="84" y2="166" stroke="#fbbf24" strokeWidth="2.5" />
              <polygon points="79,162 84,174 89,162" fill="#fbbf24" />
              <text x="72" y="120" textAnchor="end" fill="#fbbf24" fontSize="11">Доош</text>
            </g>
          )}
          {/* Torch */}
          <line x1="177" y1="114" x2="234" y2={position === 'PF' ? 142 : 84} stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
          <circle cx="177" cy="114" r="8" fill="#fef08a" fillOpacity="0.65" />
          <text x="177" y="218" textAnchor="middle" fill="#e2e8f0" fontSize="12">
            {position === 'PF'
              ? 'Босоо өгсөх (PF / 3G Up) — Гүн нэвчилт'
              : 'Босоо уруудах (PG / 3G Down) — Хурдан гүйцэтгэл'}
          </text>
        </g>
      )}

      {position === 'PE' && (
        <g>
          {/* Overhead ceiling plates */}
          <rect x="65" y="54" width="110" height="24" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="183" y="54" width="110" height="24" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Weld bead underneath */}
          <path d="M 164,78 Q 179,92 194,78 L 184,54 L 174,54 Z" fill="#fb923c" />
          {/* Torch pointing UP from below */}
          <line x1="179" y1="88" x2="156" y2="162" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
          <circle cx="179" cy="84" r="9" fill="#fef08a" fillOpacity="0.7" />
          {/* Small spark drops */}
          <circle cx="190" cy="112" r="2" fill="#fbbf24" />
          <circle cx="168" cy="126" r="1.8" fill="#fb923c" />
          <text x="179" y="205" textAnchor="middle" fill="#e2e8f0" fontSize="12">
            Таазны байрлал (PE / 4G) — Доороос дээш гагнах
          </text>
        </g>
      )}
    </svg>
  );
};

/* ---------- ISO 2553 Symbol Renderer SVG ---------- */

interface IsoWeldSymbolSvgProps {
  weldKind: SymbolWeldKind;
  side: SymbolSide;
  dimension: number;
  intermittent: boolean;
  allAround: boolean;
  fieldWeld: boolean;
  contour: SurfaceContour;
}

const IsoWeldSymbolSvg: React.FC<IsoWeldSymbolSvgProps> = ({
  weldKind,
  side,
  dimension,
  intermittent,
  allAround,
  fieldWeld,
  contour,
}) => {
  const effectiveSide: SymbolSide = weldKind === 'double_v' ? 'both' : side;
  const drawArrowSide = effectiveSide === 'arrow' || effectiveSide === 'both';
  const drawOtherSide = effectiveSide === 'other' || effectiveSide === 'both';

  const renderGlyph = (isTop: boolean) => {
    const baseY = isTop ? 92 : 92;
    const dir = isTop ? -1 : 1;

    if (weldKind === 'fillet') {
      return (
        <polygon
          points={`156,${baseY} 156,${baseY + 24 * dir} 180,${baseY}`}
          fill="none"
          stroke="#fbbf24"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      );
    }
    if (weldKind === 'single_v' || weldKind === 'double_v') {
      return (
        <polyline
          points={`154,${baseY + 22 * dir} 168,${baseY} 182,${baseY + 22 * dir}`}
          fill="none"
          stroke="#fbbf24"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      );
    }
    // square groove
    return (
      <g stroke="#fbbf24" strokeWidth="2.2">
        <line x1="162" y1={baseY} x2="162" y2={baseY + 22 * dir} />
        <line x1="174" y1={baseY} x2="174" y2={baseY + 22 * dir} />
      </g>
    );
  };

  const renderContour = (isTop: boolean) => {
    if (contour === 'none') return null;
    const y = isTop ? 62 : 122;
    if (contour === 'flat') {
      return <line x1="156" y1={y} x2="180" y2={y} stroke="#38bdf8" strokeWidth="2" />;
    }
    if (contour === 'convex') {
      return (
        <path
          d={`M 156,${y + (isTop ? 3 : -3)} Q 168,${y + (isTop ? -7 : 7)} 180,${y + (isTop ? 3 : -3)}`}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2"
        />
      );
    }
    return (
      <path
        d={`M 156,${y + (isTop ? -3 : 3)} Q 168,${y + (isTop ? 7 : -7)} 180,${y + (isTop ? -3 : 3)}`}
        fill="none"
        stroke="#38bdf8"
        strokeWidth="2"
      />
    );
  };

  return (
    <svg viewBox="0 0 260 175" className="w-full max-w-[260px] h-auto select-none">
      {/* Arrow line */}
      <line x1="40" y1="148" x2="96" y2="92" stroke="#e2e8f0" strokeWidth="2" />
      <polygon points="36,152 49,147 41,139" fill="#e2e8f0" />

      {/* Reference line */}
      <line x1="96" y1="92" x2="236" y2="92" stroke="#e2e8f0" strokeWidth="2.2" />
      {/* ISO dashed identification line */}
      <line x1="96" y1="100" x2="236" y2="100" stroke="#64748b" strokeWidth="1.2" strokeDasharray="5 4" />

      {/* All-around circle at elbow */}
      {allAround && (
        <circle cx="96" cy="92" r="7" fill="none" stroke="#38bdf8" strokeWidth="2" />
      )}

      {/* Field weld flag */}
      {fieldWeld && (
        <g>
          <line x1="96" y1="92" x2="96" y2="56" stroke="#34d399" strokeWidth="2" />
          <polygon points="96,56 118,64 96,72" fill="#34d399" />
        </g>
      )}

      {/* Arrow Side (ISO: above or below; using AWS/ISO standard placement where arrow side is solid line side) */}
      {drawArrowSide && (
        <g>
          {renderGlyph(true)}
          {renderContour(true)}
          <text
            x="146"
            y="84"
            textAnchor="end"
            fill="#e2e8f0"
            fontSize="12"
            fontFamily="JetBrains Mono"
          >
            {weldKind === 'fillet' ? `z${dimension}` : `s${dimension}`}
          </text>
          {intermittent && (
            <text x="188" y="84" fill="#fbbf24" fontSize="11" fontFamily="JetBrains Mono">
              4×50(100)
            </text>
          )}
        </g>
      )}

      {/* Other Side */}
      {drawOtherSide && (
        <g>
          {renderGlyph(false)}
          {renderContour(false)}
          <text
            x="146"
            y="120"
            textAnchor="end"
            fill="#e2e8f0"
            fontSize="12"
            fontFamily="JetBrains Mono"
          >
            {weldKind === 'fillet' ? `z${dimension}` : `s${dimension}`}
          </text>
          {intermittent && (
            <text x="188" y="120" fill="#fbbf24" fontSize="11" fontFamily="JetBrains Mono">
              4×50(100)
            </text>
          )}
        </g>
      )}
    </svg>
  );
};

/* ---------- Physical Result Preview for Symbol ---------- */

const PhysicalSymbolResultSvg: React.FC<{
  weldKind: SymbolWeldKind;
  side: SymbolSide;
  contour: SurfaceContour;
}> = ({ weldKind, side, contour }) => {
  const effectiveSide: SymbolSide = weldKind === 'double_v' ? 'both' : side;
  const hasArrow = effectiveSide === 'arrow' || effectiveSide === 'both';
  const hasOther = effectiveSide === 'other' || effectiveSide === 'both';

  return (
    <svg viewBox="0 0 240 175" className="w-full max-w-[240px] h-auto select-none">
      {weldKind === 'fillet' ? (
        <g>
          {/* T-Joint plates */}
          <rect x="45" y="122" width="150" height="24" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.2" />
          <rect x="108" y="42" width="24" height="80" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.2" />
          {/* Arrow indicator pointing to Left side */}
          <line x1="40" y1="88" x2="86" y2="118" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="34" y="80" fill="#38bdf8" fontSize="10">Сумын тал</text>

          {hasArrow && (
            <path
              d={
                contour === 'convex'
                  ? 'M 108,90 Q 88,100 76,122 L 108,122 Z'
                  : contour === 'concave'
                    ? 'M 108,90 Q 98,112 76,122 L 108,122 Z'
                    : 'M 108,90 L 76,122 L 108,122 Z'
              }
              fill="#fb923c"
              stroke="#fed7aa"
              strokeWidth="1.2"
            />
          )}
          {hasOther && (
            <path
              d={
                contour === 'convex'
                  ? 'M 132,90 Q 152,100 164,122 L 132,122 Z'
                  : contour === 'concave'
                    ? 'M 132,90 Q 142,112 164,122 L 132,122 Z'
                    : 'M 132,90 L 164,122 L 132,122 Z'
              }
              fill="#fb923c"
              stroke="#fed7aa"
              strokeWidth="1.2"
            />
          )}
        </g>
      ) : (
        <g>
          {/* Butt Joint plates */}
          <rect x="36" y="76" width="76" height="40" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.2" />
          <rect x="128" y="76" width="76" height="40" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.2" />
          <line x1="68" y1="42" x2="106" y2="72" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="42" y="36" fill="#38bdf8" fontSize="10">Сумын тал (Дээд)</text>

          {(hasArrow || weldKind === 'double_v') && (
            <path
              d={
                weldKind === 'square'
                  ? 'M 108,76 Q 120,66 132,76 L 128,108 L 112,108 Z'
                  : 'M 98,76 Q 120,64 142,76 L 126,112 L 114,112 Z'
              }
              fill="#fb923c"
              stroke="#fed7aa"
              strokeWidth="1.2"
            />
          )}
          {(hasOther || weldKind === 'double_v') && (
            <path
              d="M 114,96 L 126,96 L 142,116 Q 120,128 98,116 Z"
              fill="#fb923c"
              stroke="#fed7aa"
              strokeWidth="1.2"
            />
          )}
        </g>
      )}
    </svg>
  );
};

function describeSymbolInMongolian({
  weldKind,
  symbolSide,
  legDimension,
  isIntermittent,
  allAround,
  fieldWeld,
  contour,
}: {
  weldKind: SymbolWeldKind;
  symbolSide: SymbolSide;
  legDimension: number;
  isIntermittent: boolean;
  allAround: boolean;
  fieldWeld: boolean;
  contour: SurfaceContour;
}): string {
  const effectiveSide: SymbolSide = weldKind === 'double_v' ? 'both' : symbolSide;
  const sideText =
    effectiveSide === 'arrow'
      ? 'Зөвхөн сум заасан талд'
      : effectiveSide === 'other'
        ? 'Сумны эсрэг талд'
        : 'Хоёр талд хоёуланд нь';

  const kindText =
    weldKind === 'fillet'
      ? `${legDimension} мм катеттэй булангийн оёо`
      : weldKind === 'single_v'
        ? `${legDimension} мм гүнтэй V-хэлбэрийн тулгасан оёо`
        : weldKind === 'double_v'
          ? `${legDimension} мм гүнтэй X-хэлбэрийн хоёр талын оёо`
          : `${legDimension} мм шулуун ирмэгтэй I-оёо`;

  const contourText =
    contour === 'flat'
      ? ', гадаргууг тэгшилнэ'
      : contour === 'convex'
        ? ', гүдгэр хэлбэртэй'
        : contour === 'concave'
          ? ', хотгор хэлбэртэй'
          : '';

  const extra: string[] = [];
  if (isIntermittent) extra.push('50 мм урттай 4 ширхэг тасархай оёо (100 мм алхамтай)');
  if (allAround) extra.push('периметрийн дагуу эргэн тойрон битүү гагнана');
  if (fieldWeld) extra.push('угсралтын талбай дээр гүйцэтгэнэ');

  return `${sideText} ${kindText}${contourText}${extra.length ? ' · ' + extra.join(', ') : ''}.`;
}
