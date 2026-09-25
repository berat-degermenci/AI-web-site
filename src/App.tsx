import { useState, useCallback } from 'react';
import { Brain, Sparkles, Mail, Loader2, CheckCircle2, ArrowRight, RotateCcw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  questions,
  calculateRisk,
  type QuizAnswer,
  type RiskResult,
} from '@/lib/quiz';

type Stage = 'intro' | 'quiz' | 'form' | 'result';

export default function App() {
  const [stage, setStage] = useState<Stage>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RiskResult | null>(null);

  const handleSelect = useCallback(
    (optionId: string, weight: number) => {
      if (transitioning) return;
      setSelectedOption(optionId);
      setTransitioning(true);

      const newAnswers = [
        ...answers,
        { questionId: questions[currentQ].id, optionId, weight },
      ];
      setAnswers(newAnswers);

      setTimeout(() => {
        if (currentQ < questions.length - 1) {
          setCurrentQ((q) => q + 1);
          setSelectedOption(null);
        } else {
          setStage('form');
          setSelectedOption(null);
        }
        setTransitioning(false);
      }, 550);
    },
    [answers, currentQ, transitioning],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim() || !email.trim()) {
        setError('Lütfen adını ve e-posta adresini gir.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Geçerli bir e-posta adresi gir.');
        return;
      }
      setError(null);
      setSubmitting(true);

      const risk = calculateRisk(answers);
      setResult(risk);

      try {
        await supabase.from('leads').upsert(
          {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            risk_score: risk.score,
            profession: risk.profession,
            risk_level: risk.level,
          },
          { onConflict: 'email' },
        );
      } catch {
        // Result still shows even if save fails
      }

      setSubmitting(false);
      setStage('result');
    },
    [answers, name, email],
  );

  const restart = useCallback(() => {
    setStage('intro');
    setCurrentQ(0);
    setAnswers([]);
    setSelectedOption(null);
    setName('');
    setEmail('');
    setResult(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white overflow-hidden relative">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-700/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Mindflex<span className="text-purple-400"> AI</span>
            </span>
          </div>
          {stage !== 'intro' && (
            <span className="text-xs text-white/40 hidden sm:block">
              Yapay Zekâ Kariyer Risk Testi
            </span>
          )}
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-2xl">
            {stage === 'intro' && <Intro onStart={() => setStage('quiz')} />}

            {stage === 'quiz' && (
              <QuizScreen
                question={questions[currentQ]}
                index={currentQ}
                total={questions.length}
                selected={selectedOption}
                transitioning={transitioning}
                onSelect={handleSelect}
              />
            )}

            {stage === 'form' && (
              <FormScreen
                name={name}
                email={email}
                error={error}
                submitting={submitting}
                onName={setName}
                onEmail={setEmail}
                onSubmit={handleSubmit}
              />
            )}

            {stage === 'result' && result && (
              <ResultScreen result={result} name={name} onRestart={restart} />
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 text-center text-xs text-white/30 max-w-5xl mx-auto w-full">
          Mindflex AI — Yapay Zekâ Kariyer Risk Analizi · Sonuçlar tahminidir
        </footer>
      </div>
    </div>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="text-center animate-[fadeIn_0.6s_ease]">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <span className="text-xs font-medium text-purple-300">3 soruluk interaktif test</span>
      </div>

      <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
        Yapay zekâ seni
        <br />
        <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
          hangi meslekte
        </span>
        <br />
        işsiz bırakabilir?
      </h1>

      <p className="text-base sm:text-lg text-white/50 mb-10 max-w-md mx-auto leading-relaxed">
        3 eğlenceli soru, kişiselleştirilmiş risk skoru ve rengarenk grafik.
        Cevaplarını ver, sonucunu öğren.
      </p>

      <button
        onClick={onStart}
        className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-lg shadow-xl shadow-purple-600/30 hover:shadow-purple-500/40 transition-all hover:scale-[1.03] active:scale-[0.98]"
      >
        Teste Başla
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>

      <div className="mt-12 flex items-center justify-center gap-8 text-xs text-white/30">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-purple-400/60" />
          <span>30 saniye</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-purple-400/60" />
          <span>Tamamen ücretsiz</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-purple-400/60" />
          <span>Erken erişim</span>
        </div>
      </div>
    </div>
  );
}

function QuizScreen({
  question,
  index,
  total,
  selected,
  transitioning,
  onSelect,
}: {
  question: (typeof questions)[0];
  index: number;
  total: number;
  selected: string | null;
  transitioning: boolean;
  onSelect: (optionId: string, weight: number) => void;
}) {
  const progress = ((index + (selected ? 1 : 0)) / total) * 100;

  return (
    <div
      key={question.id}
      className="animate-[fadeIn_0.4s_ease]"
    >
      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-white/40">
            Soru {index + 1} / {total}
          </span>
          <div className="flex gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i <= index ? 'w-8 bg-purple-500' : 'w-4 bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="h-1 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">{question.emoji}</div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">{question.title}</h2>
        <p className="text-sm text-white/40">{question.subtitle}</p>
      </div>

      {/* Options */}
      <div className="grid gap-3 sm:grid-cols-2">
        {question.options.map((opt, i) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id, opt.weight)}
              disabled={transitioning}
              className={`group relative flex items-center gap-4 p-4 sm:p-5 rounded-2xl border text-left transition-all duration-300 ${
                isSelected
                  ? 'border-purple-500 bg-purple-500/15 scale-[1.02]'
                  : 'border-white/10 bg-white/[0.03] hover:border-purple-500/40 hover:bg-white/[0.06] hover:scale-[1.01]'
              } ${transitioning && !isSelected ? 'opacity-30' : ''}`}
              style={{
                animation: `fadeIn 0.4s ease ${i * 0.08}s both`,
              }}
            >
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                  isSelected
                    ? 'bg-purple-500/30 scale-110'
                    : 'bg-white/5 group-hover:bg-purple-500/10'
                }`}
              >
                {opt.emoji}
              </div>
              <span className="flex-1 text-sm sm:text-base font-medium leading-snug">
                {opt.label}
              </span>
              {isSelected && (
                <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FormScreen({
  name,
  email,
  error,
  submitting,
  onName,
  onEmail,
  onSubmit,
}: {
  name: string;
  email: string;
  error: string | null;
  submitting: boolean;
  onName: (v: string) => void;
  onEmail: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="text-center animate-[fadeIn_0.5s_ease]">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <span className="text-xs font-medium text-purple-300">Neredeyse tamam!</span>
      </div>

      <div className="text-5xl mb-4">🎯</div>

      <h2 className="text-2xl sm:text-3xl font-bold mb-4 leading-tight">
        Sonucunu hazırladık!
      </h2>
      <p className="text-white/50 mb-8 max-w-md mx-auto leading-relaxed">
        Kişiselleştirilmiş <span className="text-purple-300 font-medium">AI risk skoru</span>nu öğren
        ve Mindflex AI çıktığında <span className="text-purple-300 font-medium">erken erişim</span> kazan.
        Adını ve e-postanı gir.
      </p>

      <form onSubmit={onSubmit} className="max-w-md mx-auto space-y-4 text-left">
        <div>
          <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">
            Adın
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onName(e.target.value)}
            placeholder="Adını gir"
            className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-purple-500 focus:bg-white/[0.07] transition-all"
            autoComplete="name"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">
            E-posta Adresin
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25" />
            <input
              type="email"
              value={email}
              onChange={(e) => onEmail(e.target.value)}
              placeholder="ornek@email.com"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-purple-500 focus:bg-white/[0.07] transition-all"
              autoComplete="email"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 text-center pt-1">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="group w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow-xl shadow-purple-600/30 hover:shadow-purple-500/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Hesaplanıyor...
            </>
          ) : (
            <>
              Risk Skorumu Göster
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <p className="text-xs text-white/25 text-center pt-2">
          E-postanı kimseyle paylaşmıyoruz. Sadece erken erişim için.
        </p>
      </form>
    </div>
  );
}

function ResultScreen({
  result,
  name,
  onRestart,
}: {
  result: RiskResult;
  name: string;
  onRestart: () => void;
}) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const circumference = 2 * Math.PI * 80;

  // Animate score on mount
  useState(() => {
    let frame: number;
    const start = performance.now();
    const duration = 1400;
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(result.score * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  });

  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const levelLabels: Record<RiskResult['level'], string> = {
    low: 'Düşük Risk',
    medium: 'Orta Risk',
    high: 'Yüksek Risk',
    critical: 'Kritik Risk',
  };

  const levelColors: Record<RiskResult['level'], string> = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444',
  };

  const currentColor = levelColors[result.level];

  return (
    <div className="text-center animate-[fadeIn_0.6s_ease]">
      {/* Success badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
        <CheckCircle2 className="w-4 h-4 text-green-400" />
        <span className="text-xs font-medium text-green-300">Erken erişim listesine eklendin!</span>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold mb-1">
        {name ? `${name}, ` : ''}işte sonuçların
      </h2>
      <p className="text-white/40 text-sm mb-8">Kişiselleştirilmiş AI Kariyer Risk Analizi</p>

      {/* Circular progress */}
      <div className="relative w-56 h-56 mx-auto mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
          <circle
            cx="90"
            cy="90"
            r="80"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="10"
          />
          <circle
            cx="90"
            cy="90"
            r="80"
            fill="none"
            stroke={currentColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.1s linear',
              filter: `drop-shadow(0 0 8px ${currentColor}80)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-5xl font-bold tabular-nums"
            style={{ color: currentColor }}
          >
            {animatedScore}
          </span>
          <span className="text-xs text-white/40 uppercase tracking-widest mt-1">
            Risk Skoru
          </span>
        </div>
      </div>

      {/* Level badge */}
      <div
        className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold mb-6"
        style={{
          backgroundColor: `${currentColor}20`,
          color: currentColor,
          border: `1px solid ${currentColor}40`,
        }}
      >
        {levelLabels[result.level]}
      </div>

      {/* Profession card */}
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 mb-6 text-left max-w-md mx-auto">
        <p className="text-xs text-white/40 uppercase tracking-wider mb-2">
          En yüksek riskli mesleğin
        </p>
        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: result.color }}
          />
          {result.profession}
        </h3>
        <p className="text-sm text-white/60 leading-relaxed">{result.description}</p>
      </div>

      {/* Risk breakdown bar */}
      <div className="max-w-md mx-auto mb-8">
        <div className="flex items-center justify-between text-xs text-white/40 mb-2">
          <span>Güvenli</span>
          <span>Riskli</span>
        </div>
        <div className="relative h-3 rounded-full overflow-hidden bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500">
          <div
            className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-full shadow-lg transition-all duration-1000"
            style={{ left: `calc(${animatedScore}% - 2px)` }}
          />
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-2xl p-6 max-w-md mx-auto mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <span className="font-semibold text-purple-300">Mindflex AI</span>
        </div>
        <p className="text-sm text-white/60 mb-4">
          Yapay zekâya karşı korunmak için becerilerini geliştir.
          Mindflex AI çıktığında ilk haberdar olan sen ol.
        </p>
      </div>

      <button
        onClick={onRestart}
        className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Testi tekrar yap
      </button>
    </div>
  );
}
