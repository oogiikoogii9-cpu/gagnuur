import React, { useState } from 'react';
import {
  CheckCircle2,
  ClipboardCheck,
  HelpCircle,
  RotateCcw,
  Wrench,
  XCircle,
} from 'lucide-react';
import {
  PRACTICAL_SCENARIOS,
  QUIZ_QUESTIONS,
  WELD_JOINTS,
  WELD_POSITIONS,
  type GrooveTypeId,
  type JointId,
  type QuizQuestion,
  type WeldPositionId,
} from '../data/weldingData';

interface AssessmentWorkshopProps {
  bestQuizScore: number | null;
  onSaveQuizScore: (score: number) => void;
  solvedScenarios: string[];
  onSolveScenario: (id: string) => void;
  onNavigateStage: (stage: 1 | 2 | 3 | 4) => void;
}

type AssessmentTab = 'quiz' | 'practical';

export const AssessmentWorkshop: React.FC<AssessmentWorkshopProps> = ({
  bestQuizScore,
  onSaveQuizScore,
  solvedScenarios,
  onSolveScenario,
  onNavigateStage,
}) => {
  const [tab, setTab] = useState<AssessmentTab>('quiz');

  // Quiz State
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Practical Challenge State
  const [scenarioIdx, setScenarioIdx] = useState<number>(0);
  const [pickedJoint, setPickedJoint] = useState<JointId>('butt');
  const [pickedGroove, setPickedGroove] = useState<GrooveTypeId | 'fillet'>('single_v');
  const [pickedPos, setPickedPos] = useState<WeldPositionId>('PA');
  const [scenarioFeedback, setScenarioFeedback] = useState<{
    passed: boolean;
    message: string;
  } | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  const currentQuestion = QUIZ_QUESTIONS[currentIdx];
  const selectedOption = answers[currentQuestion.id];
  const isAnswered = selectedOption !== undefined;

  const totalCorrect = QUIZ_QUESTIONS.reduce(
    (acc, q) => (answers[q.id] === q.correctIndex ? acc + 1 : acc),
    0
  );

  const handleSelectOption = (optionIdx: number) => {
    if (isAnswered) return;
    const nextAnswers = { ...answers, [currentQuestion.id]: optionIdx };
    setAnswers(nextAnswers);
    if (currentIdx === QUIZ_QUESTIONS.length - 1) {
      const finalScore = QUIZ_QUESTIONS.reduce(
        (acc, q) => (nextAnswers[q.id] === q.correctIndex ? acc + 1 : acc),
        0
      );
      onSaveQuizScore(finalScore);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      onSaveQuizScore(totalCorrect);
      setQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setAnswers({});
    setCurrentIdx(0);
    setQuizFinished(false);
  };

  const scenario = PRACTICAL_SCENARIOS[scenarioIdx];

  const handleCheckScenario = () => {
    const jointOk = pickedJoint === scenario.expectedJoint;
    const grooveOk = pickedGroove === scenario.expectedGroove;
    const posOk = pickedPos === scenario.expectedPosition;

    if (jointOk && grooveOk && posOk) {
      setScenarioFeedback({
        passed: true,
        message: scenario.successNote,
      });
      onSolveScenario(scenario.id);
    } else {
      const issues: string[] = [];
      if (!jointOk) issues.push('Холболтын төрөл буруу байна');
      if (!grooveOk) issues.push('Оёо/ирмэг заслын хэлбэр тохирохгүй байна');
      if (!posOk) issues.push('Орон зайн байрлал таарахгүй байна');
      setScenarioFeedback({
        passed: false,
        message: `Шалгалт амжилтгүй: ${issues.join(' · ')}. Өгөгдсөн нөхцөлийг дахин нягтална уу.`,
      });
    }
  };

  const handleSwitchScenario = (idx: number) => {
    setScenarioIdx(idx);
    setScenarioFeedback(null);
    setShowHint(false);
  };

  return (
    <section aria-labelledby="stage4-heading" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-medium text-amber-700 tracking-wide">
            04-р үе шат · Мэдлэг шалгах ба Дадлага
          </p>
          <h2
            id="stage4-heading"
            className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-slate-900 text-balance"
          >
            Зургийн сорил ба инженерийн практик даалгавар
          </h2>
        </div>

        <div
          role="tablist"
          aria-label="Шалгалтын төрөл"
          className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-200/80 self-start md:self-auto"
        >
          <button
            role="tab"
            aria-selected={tab === 'quiz'}
            onClick={() => setTab('quiz')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              tab === 'quiz'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            Зургийн сорил (10 асуулт)
          </button>
          <button
            role="tab"
            aria-selected={tab === 'practical'}
            onClick={() => setTab('practical')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              tab === 'practical'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Практик даалгавар ({solvedScenarios.length}/{PRACTICAL_SCENARIOS.length})
          </button>
        </div>
      </div>

      {tab === 'quiz' ? (
        !quizFinished ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Diagram + Question Progress */}
            <div className="lg:col-span-5 flex flex-col rounded-xl border border-slate-200 bg-slate-950 text-slate-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 bg-slate-900 flex items-center justify-between text-xs">
                <span className="text-slate-300">{currentQuestion.category}</span>
                <span className="font-mono tabular-nums text-amber-400">
                  Асуулт {currentIdx + 1} / {QUIZ_QUESTIONS.length}
                </span>
              </div>

              <div className="flex-1 blueprint-grid p-6 flex items-center justify-center min-h-[260px]">
                <QuizDiagramSvg type={currentQuestion.diagramType} />
              </div>

              {/* Progress Dots Bar */}
              <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {QUIZ_QUESTIONS.map((q, idx) => {
                    const ans = answers[q.id];
                    let color = 'bg-slate-700';
                    if (ans !== undefined) {
                      color = ans === q.correctIndex ? 'bg-emerald-500' : 'bg-rose-500';
                    } else if (idx === currentIdx) {
                      color = 'bg-amber-500';
                    }
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIdx(idx)}
                        aria-label={`Асуулт ${idx + 1}`}
                        className={`w-6 h-2 rounded-sm transition-colors ${color}`}
                      />
                    );
                  })}
                </div>
                {bestQuizScore !== null && (
                  <span className="text-xs font-mono tabular-nums text-slate-400 whitespace-nowrap">
                    Дээд оноо: {bestQuizScore}/10
                  </span>
                )}
              </div>
            </div>

            {/* Right Question & Options */}
            <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 md:p-6 space-y-5">
              <div className="space-y-4">
                <h3 className="text-lg md:text-xl font-bold text-slate-900 leading-snug">
                  {currentQuestion.prompt}
                </h3>

                <div className="space-y-2.5">
                  {currentQuestion.options.map((opt, idx) => {
                    const isPicked = selectedOption === idx;
                    const isRight = idx === currentQuestion.correctIndex;

                    let style =
                      'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50';
                    if (isAnswered) {
                      if (isRight) {
                        style = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium';
                      } else if (isPicked && !isRight) {
                        style = 'bg-rose-50 border-rose-400 text-rose-950';
                      } else {
                        style = 'bg-slate-50 border-slate-200 text-slate-500';
                      }
                    }

                    return (
                      <button
                        key={opt}
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(idx)}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg border text-left text-sm transition-colors ${style}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-semibold text-slate-500 w-5">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isAnswered && isRight && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        {isAnswered && isPicked && !isRight && (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Immediate Explanation */}
                {isAnswered && (
                  <div
                    className={`rounded-lg border p-4 ${
                      selectedOption === currentQuestion.correctIndex
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        : 'bg-amber-50/70 border-amber-200 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold">
                        {selectedOption === currentQuestion.correctIndex
                          ? 'Зөв хариуллаа'
                          : 'Тайлбар ба зөвлөмж'}
                      </span>
                      <button
                        onClick={() => onNavigateStage(currentQuestion.relatedStage)}
                        className="text-xs font-medium underline hover:no-underline"
                      >
                        {currentQuestion.relatedStage}-р шатаас дахин харах
                      </button>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
                  disabled={currentIdx === 0}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  Өмнөх асуулт
                </button>
                <button
                  onClick={handleNextQuestion}
                  disabled={!isAnswered}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-semibold transition-colors"
                >
                  {currentIdx < QUIZ_QUESTIONS.length - 1 ? 'Дараагийн асуулт' : 'Дүнгээ харах'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Quiz Summary Card */
          <div className="rounded-xl border border-slate-200 bg-white p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
              <div>
                <p className="text-xs font-medium text-amber-700">Сорилын нэгдсэн дүн</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900 font-mono tabular-nums">
                  {totalCorrect} / {QUIZ_QUESTIONS.length} оноо ({Math.round((totalCorrect / QUIZ_QUESTIONS.length) * 100)}%)
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {totalCorrect >= 8
                    ? 'Маш сайн! Та гагнуурын холболт, оёоны огтлол ба тэмдэглэгээний үндсийг бүрэн эзэмшсэн байна.'
                    : 'Сайн оролдлого! Алдсан сэдвүүдээр симуляторыг дахин туршаад сорилоо давтан өгөөрэй.'}
                </p>
              </div>
              <button
                onClick={handleRestartQuiz}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold self-start whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Дахин сорил өгөх
              </button>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(
                [
                  { cat: 'Холболтын төрөл', stage: 1 },
                  { cat: 'Ирмэг засал ба Огтлол', stage: 2 },
                  { cat: 'Байрлал', stage: 3 },
                  { cat: 'Зургийн тэмдэглэгээ', stage: 3 },
                ] as const
              ).map((group) => {
                const qs = QUIZ_QUESTIONS.filter((q) => q.category === group.cat);
                const right = qs.filter((q) => answers[q.id] === q.correctIndex).length;
                return (
                  <div
                    key={group.cat}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xs text-slate-500">{group.cat}</div>
                      <div className="mt-1 text-lg font-bold font-mono tabular-nums text-slate-900">
                        {right} / {qs.length} зөв
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigateStage(group.stage)}
                      className="mt-3 text-left text-xs font-medium text-sky-700 hover:text-sky-800"
                    >
                      Симулятор руу орох →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )
      ) : (
        /* ---------- PRACTICAL WORKBENCH SCENARIOS ---------- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Scenario Picker & Prompt */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 md:p-6 space-y-5">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {PRACTICAL_SCENARIOS.map((sc, idx) => {
                  const active = idx === scenarioIdx;
                  const solved = solvedScenarios.includes(sc.id);
                  return (
                    <button
                      key={sc.id}
                      onClick={() => handleSwitchScenario(idx)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                        active
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>Даалгавар 0{idx + 1}</span>
                      {solved && (
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${
                            active ? 'text-emerald-400' : 'text-emerald-600'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">{scenario.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {scenario.taskDescription}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5 space-y-1.5">
                <div className="text-xs font-semibold text-slate-800">Техникийн нөхцөл:</div>
                {scenario.constraints.map((c) => (
                  <div key={c} className="text-xs text-slate-700 font-mono">
                    — {c}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <button
                onClick={() => setShowHint((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700 hover:text-sky-800"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {showHint ? 'Зөвлөмжийг нуух' : 'Багшийн зөвлөмж харах'}
              </button>
              {showHint && (
                <p className="mt-2 rounded-lg bg-sky-50 border border-sky-200 p-3 text-xs text-sky-950 leading-relaxed">
                  {scenario.hint}
                </p>
              )}
            </div>
          </div>

          {/* Right Configuration Workbench */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 md:p-6 space-y-5">
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Технологийн карт бүрдүүлэх
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Дээрх нөхцөлд тохирох холболт, оёоны хэлбэр ба байрлалыг сонгоод шалгуулна уу.
                </p>
              </div>

              {/* 1. Pick Joint */}
              <div>
                <div className="text-xs font-semibold text-slate-700 mb-1.5">
                  1. Холболтын төрөл
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {WELD_JOINTS.map((j) => (
                    <button
                      key={j.id}
                      onClick={() => {
                        setPickedJoint(j.id);
                        setScenarioFeedback(null);
                      }}
                      className={`px-3 py-2 rounded-lg border text-xs font-medium text-left transition-colors ${
                        pickedJoint === j.id
                          ? 'bg-amber-600 border-amber-600 text-white'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {j.nameMn}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Pick Groove / Fillet */}
              <div>
                <div className="text-xs font-semibold text-slate-700 mb-1.5">
                  2. Оёоны хэлбэр / Ирмэг засал
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { id: 'square', label: 'I-хэлбэр (Шулуун)' },
                      { id: 'single_v', label: 'V-хэлбэр' },
                      { id: 'double_v', label: 'X-хэлбэр' },
                      { id: 'fillet', label: 'Булангийн оёо' },
                    ] as const
                  ).map((g) => (
                    <button
                      key={g.id}
                      onClick={() => {
                        setPickedGroove(g.id);
                        setScenarioFeedback(null);
                      }}
                      className={`px-3 py-2 rounded-lg border text-xs font-medium text-left transition-colors ${
                        pickedGroove === g.id
                          ? 'bg-amber-600 border-amber-600 text-white'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Pick Position */}
              <div>
                <div className="text-xs font-semibold text-slate-700 mb-1.5">
                  3. Гагнуурын байрлал
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {WELD_POSITIONS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setPickedPos(p.id);
                        setScenarioFeedback(null);
                      }}
                      className={`px-2.5 py-2 rounded-lg border text-xs font-mono font-semibold text-center transition-colors ${
                        pickedPos === p.id
                          ? 'bg-amber-600 border-amber-600 text-white'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {p.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              {scenarioFeedback && (
                <div
                  className={`flex items-start gap-2.5 rounded-lg border p-3.5 ${
                    scenarioFeedback.passed
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50 border-rose-300 text-rose-950'
                  }`}
                >
                  {scenarioFeedback.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <p className="text-xs leading-relaxed">{scenarioFeedback.message}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={handleCheckScenario}
                className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                Чанарын хяналтаар шалгах
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

/* ---------- Quiz Embedded Technical Diagrams ---------- */

const QuizDiagramSvg: React.FC<{ type: QuizQuestion['diagramType'] }> = ({ type }) => {
  return (
    <svg viewBox="0 0 280 180" className="w-full max-w-[300px] h-auto select-none">
      {type === 'joint_butt' && (
        <g>
          <rect x="28" y="72" width="98" height="36" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="154" y="72" width="98" height="36" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          <path d="M 122,72 Q 140,60 158,72 L 148,108 L 132,108 Z" fill="#fb923c" />
        </g>
      )}
      {type === 'joint_edge' && (
        <g>
          <rect x="102" y="48" width="34" height="96" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="142" y="48" width="34" height="96" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          <path d="M 102,48 Q 139,24 176,48 L 156,64 L 122,64 Z" fill="#fb923c" />
        </g>
      )}
      {type === 'joint_tee' && (
        <g>
          <rect x="44" y="114" width="192" height="30" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="124" y="34" width="32" height="80" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          <polygon points="124,86 96,114 124,114" fill="#fb923c" />
          <polygon points="156,86 184,114 156,114" fill="#fb923c" />
        </g>
      )}
      {type === 'joint_lap' && (
        <g>
          <rect x="86" y="102" width="150" height="30" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="40" y="70" width="144" height="30" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          <polygon points="184,72 214,102 184,102" fill="#fb923c" />
        </g>
      )}
      {type === 'joint_corner' && (
        <g>
          <rect x="76" y="36" width="32" height="104" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="108" y="108" width="108" height="32" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          <polygon points="108,82 134,108 108,108" fill="#fb923c" />
        </g>
      )}
      {type === 'groove_x' && (
        <g>
          <polygon points="34,42 114,42 134,86 134,94 114,138 34,138" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          <polygon points="166,42 246,42 246,138 166,138 146,94 146,86" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          <polygon points="114,42 166,42 146,90 166,138 114,138 134,90" fill="#fb923c" fillOpacity="0.85" />
          <text x="140" y="160" textAnchor="middle" fill="#cbd5e1" fontSize="11" fontFamily="JetBrains Mono">
            s = 20 мм
          </text>
        </g>
      )}
      {type === 'groove_v' && (
        <g>
          <polygon points="34,54 116,54 136,118 136,126 34,126" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          <polygon points="164,54 246,54 246,126 144,126 144,118" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          <path d="M 116,54 L 164,54 L 146,96 L 134,96 Z" fill="#fb923c" />
          <rect x="136" y="96" width="8" height="30" fill="#020617" stroke="#fbbf24" strokeDasharray="2 2" />
          <text x="140" y="152" textAnchor="middle" fill="#fbbf24" fontSize="11">
            Ёроолд хүрээгүй бүс
          </text>
        </g>
      )}
      {type === 'fillet_throat' && (
        <g>
          <rect x="82" y="34" width="28" height="106" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="44" y="140" width="180" height="26" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          <polygon points="110,72 178,140 110,140" fill="#fb923c" />
          <line x1="110" y1="140" x2="144" y2="106" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="4 2" />
          <text x="150" y="102" fill="#38bdf8" fontSize="12" fontFamily="JetBrains Mono">a = ?</text>
          <text x="144" y="158" textAnchor="middle" fill="#fbbf24" fontSize="11" fontFamily="JetBrains Mono">K = 10 мм</text>
        </g>
      )}
      {type === 'symbol_fillet_both' && (
        <g>
          <line x1="34" y1="142" x2="88" y2="88" stroke="#e2e8f0" strokeWidth="2" />
          <polygon points="30,146 43,141 35,133" fill="#e2e8f0" />
          <line x1="88" y1="88" x2="226" y2="88" stroke="#e2e8f0" strokeWidth="2.5" />
          {/* Top & Bottom Fillet Triangles */}
          <polygon points="146,88 146,60 174,88" fill="none" stroke="#fbbf24" strokeWidth="2.2" />
          <polygon points="146,88 146,116 174,88" fill="none" stroke="#fbbf24" strokeWidth="2.2" />
          <text x="134" y="82" textAnchor="end" fill="#e2e8f0" fontSize="12" fontFamily="JetBrains Mono">z6</text>
          <text x="134" y="108" textAnchor="end" fill="#e2e8f0" fontSize="12" fontFamily="JetBrains Mono">z6</text>
        </g>
      )}
      {type === 'position_pe' && (
        <g>
          <rect x="48" y="42" width="88" height="24" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="144" y="42" width="88" height="24" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          <path d="M 124,66 Q 140,82 156,66 L 146,42 L 134,42 Z" fill="#fb923c" />
          <line x1="140" y1="78" x2="120" y2="146" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
          <circle cx="140" cy="74" r="8" fill="#fef08a" fillOpacity="0.7" />
          <text x="140" y="166" textAnchor="middle" fill="#cbd5e1" fontSize="11">Доороос дээш гагнах</text>
        </g>
      )}
    </svg>
  );
};
