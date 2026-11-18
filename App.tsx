import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Flame } from 'lucide-react';
import { JointExplorerStage } from './components/JointExplorerStage';
import { SeamCrossSectionLab } from './components/SeamCrossSectionLab';
import { PositionsAndSymbolsLab } from './components/PositionsAndSymbolsLab';
import { AssessmentWorkshop } from './components/AssessmentWorkshop';
import { PRACTICAL_SCENARIOS, WELD_JOINTS, type JointId } from './data/weldingData';

type LessonStage = 1 | 2 | 3 | 4;

interface SavedProgress {
  exploredJoints: JointId[];
  stage2Visited: boolean;
  stage3Visited: boolean;
  bestQuizScore: number | null;
  solvedScenarios: string[];
}

const STORAGE_KEY = 'welding_joints_lesson_progress_v1';

const DEFAULT_PROGRESS: SavedProgress = {
  exploredJoints: ['butt'],
  stage2Visited: false,
  stage3Visited: false,
  bestQuizScore: null,
  solvedScenarios: [],
};

export default function App() {
  const [activeStage, setActiveStage] = useState<LessonStage>(1);
  const [selectedJoint, setSelectedJoint] = useState<JointId>('butt');
  const [heroImgError, setHeroImgError] = useState<boolean>(false);
  const [progress, setProgress] = useState<SavedProgress>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
      }
    } catch {
      // Ignore storage errors
    }
    return DEFAULT_PROGRESS;
  });

  const workspaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage errors
    }
  }, [progress]);

  const handleMarkExplored = useCallback((id: JointId) => {
    setProgress((prev) => {
      if (prev.exploredJoints.includes(id)) return prev;
      return { ...prev, exploredJoints: [...prev.exploredJoints, id] };
    });
  }, []);

  const handleCompleteLab2 = useCallback(() => {
    setProgress((prev) => (prev.stage2Visited ? prev : { ...prev, stage2Visited: true }));
  }, []);

  const handleCompleteStage3 = useCallback(() => {
    setProgress((prev) => (prev.stage3Visited ? prev : { ...prev, stage3Visited: true }));
  }, []);

  const handleSaveQuizScore = useCallback((score: number) => {
    setProgress((prev) => ({
      ...prev,
      bestQuizScore: prev.bestQuizScore === null ? score : Math.max(prev.bestQuizScore, score),
    }));
  }, []);

  const handleSolveScenario = useCallback((id: string) => {
    setProgress((prev) =>
      prev.solvedScenarios.includes(id)
        ? prev
        : { ...prev, solvedScenarios: [...prev.solvedScenarios, id] }
    );
  }, []);

  const jumpToStage = (stage: LessonStage) => {
    setActiveStage(stage);
    if (stage === 2) handleCompleteLab2();
    if (stage === 3) handleCompleteStage3();
    workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleResetProgress = () => {
    setProgress(DEFAULT_PROGRESS);
    setSelectedJoint('butt');
    setActiveStage(1);
  };

  const completedUnits =
    (progress.exploredJoints.length >= WELD_JOINTS.length ? 1 : 0) +
    (progress.stage2Visited ? 1 : 0) +
    (progress.stage3Visited ? 1 : 0) +
    (progress.bestQuizScore !== null && progress.bestQuizScore >= 7 ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar: Strictly 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            Гагнуурын Оёо
          </a>

          {/* Zone 2: 4 concise single-line text nav links */}
          <nav
            aria-label="Хичээлийн үндсэн цэс"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <button
              onClick={() => jumpToStage(1)}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeStage === 1
                  ? 'border-amber-600 text-slate-950 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              Үндсэн холболт
            </button>
            <button
              onClick={() => jumpToStage(2)}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeStage === 2
                  ? 'border-amber-600 text-slate-950 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              Оёоны симулятор
            </button>
            <button
              onClick={() => jumpToStage(3)}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeStage === 3
                  ? 'border-amber-600 text-slate-950 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              Байрлал ба Тэмдэг
            </button>
            <button
              onClick={() => jumpToStage(4)}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeStage === 4
                  ? 'border-amber-600 text-slate-950 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              Мэдлэг шалгах
            </button>
          </nav>

          {/* Zone 3: 1 Primary CTA */}
          <div className="shrink-0">
            <button
              onClick={() => jumpToStage(4)}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-sky-600"
            >
              Шалгалт өгөх
            </button>
          </div>
        </div>
      </header>

      {/* Hero Overview Split */}
      <section id="top" className="border-b border-slate-200 bg-white blueprint-grid-subtle">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Editorial Intro */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-medium text-amber-700">Металл гагнуурын сургалт</span>
                  <span aria-hidden="true">·</span>
                  <span>ISO 2553 / ISO 9692</span>
                  <span aria-hidden="true">·</span>
                  <span>4 интерактив үе шат</span>
                </div>

                <h1 className="mt-3 text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-slate-900 leading-[1.15] text-balance">
                  Гагнуурын оёоны төрөл, огтлол ба тэмдэглэгээг туршиж сурцгаая
                </h1>

                <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-2xl">
                  Хоёр металл эд ангийг холбох үндсэн 5 холболт, зузаанаас хамаарсан ирмэг засал,
                  булангийн оёоны катет, орон зайн байрлал болон техникийн зургийн тэмдэглэгээг
                  бодит цагийн симулятор дээр өөрөө тохируулж эзэмшээрэй.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => jumpToStage(1)}
                  className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-sky-600"
                >
                  Хичээл эхлүүлэх
                </button>
                <div className="text-xs text-slate-600 font-mono tabular-nums">
                  Ахиц: {completedUnits}/4 бүлэг · Даалгавар {progress.solvedScenarios.length}/
                  {PRACTICAL_SCENARIOS.length}
                </div>
              </div>
            </div>

            {/* Right Editorial Hero Visual */}
            <div className="lg:col-span-5">
              <div className="relative h-56 sm:h-64 lg:h-full min-h-[240px] rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                {!heroImgError ? (
                  <img
                    src="/src/assets/images/hero_welding_arc_1794982486242.jpg"
                    alt="Ган хавтангуудын тулгасан, таврын ба булангийн гагнуурын оёоны жишээ"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-slate-200 p-6 text-center">
                    <Flame className="w-10 h-10 text-amber-500 mb-2" />
                    <span className="text-sm font-semibold">Гагнуурын оёоны дадлагын орчин</span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-4">
                  <p className="text-xs font-medium text-slate-100">
                    Таврын, булангийн ба тулгасан холболтын бодит гагнуурын оёо
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Stage Curriculum Stepper Row */}
          <div
            role="tablist"
            aria-label="Хичээлийн үе шатууд"
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
          >
            {(
              [
                {
                  step: 1 as const,
                  title: '01. Үндсэн 5 холболт',
                  meta: `${progress.exploredJoints.length}/${WELD_JOINTS.length} төрөл судалсан`,
                  done: progress.exploredJoints.length >= WELD_JOINTS.length,
                },
                {
                  step: 2 as const,
                  title: '02. Ирмэг засал ба Огтлол',
                  meta: 'I, V, X, U ховил ба катет',
                  done: progress.stage2Visited,
                },
                {
                  step: 3 as const,
                  title: '03. Байрлал ба ISO 2553',
                  meta: 'PA–PE ба зургийн тэмдэг',
                  done: progress.stage3Visited,
                },
                {
                  step: 4 as const,
                  title: '04. Сорил ба Даалгавар',
                  meta:
                    progress.bestQuizScore !== null
                      ? `Дээд оноо: ${progress.bestQuizScore}/10`
                      : '10 асуулт + 4 даалгавар',
                  done: progress.bestQuizScore !== null && progress.bestQuizScore >= 7,
                },
              ] as const
            ).map((item) => {
              const isCurrent = activeStage === item.step;
              return (
                <button
                  key={item.step}
                  role="tab"
                  aria-selected={isCurrent}
                  onClick={() => jumpToStage(item.step)}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg border text-left transition-colors ${
                    isCurrent
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{item.title}</div>
                    <div
                      className={`text-xs truncate ${
                        isCurrent ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {item.meta}
                    </div>
                  </div>
                  {item.done && (
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        isCurrent ? 'text-emerald-400' : 'text-emerald-600'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Interactive Lesson Stage */}
      <main
        ref={workspaceRef}
        className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-8 md:py-10"
      >
        {activeStage === 1 && (
          <JointExplorerStage
            selectedJoint={selectedJoint}
            onSelectJoint={setSelectedJoint}
            exploredJoints={progress.exploredJoints}
            onMarkExplored={handleMarkExplored}
            onGoNextStage={() => jumpToStage(2)}
          />
        )}

        {activeStage === 2 && (
          <SeamCrossSectionLab
            onCompleteLab={handleCompleteLab2}
            onGoNextStage={() => jumpToStage(3)}
          />
        )}

        {activeStage === 3 && (
          <PositionsAndSymbolsLab
            onCompleteStage={handleCompleteStage3}
            onGoNextStage={() => jumpToStage(4)}
          />
        )}

        {activeStage === 4 && (
          <AssessmentWorkshop
            bestQuizScore={progress.bestQuizScore}
            onSaveQuizScore={handleSaveQuizScore}
            solvedScenarios={progress.solvedScenarios}
            onSolveScenario={handleSolveScenario}
            onNavigateStage={jumpToStage}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Гагнуурын оёоны төрлүүд · Суралцагчдад зориулсан интерактив вэб хичээл
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => jumpToStage(1)}
              className="hover:text-slate-900 transition-colors"
            >
              Эхлэл
            </button>
            <button
              onClick={handleResetProgress}
              className="hover:text-slate-900 transition-colors"
            >
              Ахицыг тэглэх
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
