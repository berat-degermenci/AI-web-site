export interface QuizAnswer {
  questionId: number;
  optionId: string;
  weight: number;
}

export interface QuizQuestion {
  id: number;
  emoji: string;
  title: string;
  subtitle: string;
  options: {
    id: string;
    label: string;
    emoji: string;
    weight: number;
  }[];
}

export const questions: QuizQuestion[] = [
  {
    id: 1,
    emoji: '🧠',
    title: 'İş günün nasıl geçiyor?',
    subtitle: 'Bir gününü tanımlayan en yakın tabloyu seç',
    options: [
      { id: 'desk', label: 'Masamda oturur, ekranımı izlerim', emoji: '🖥️', weight: 85 },
      { id: 'creative', label: 'Yaratıcı fikirler üretirim, eskizler yaparım', emoji: '🎨', weight: 65 },
      { id: 'social', label: 'Sürekli insanlarla konuşurum', emoji: '🗣️', weight: 30 },
      { id: 'field', label: 'Sahada, fiziksel iş yaparım', emoji: '🔧', weight: 10 },
    ],
  },
  {
    id: 2,
    emoji: '⏱️',
    title: 'İşinin ne kadarı rutin?',
    subtitle: 'Tekrar eden görevlerin yüzdesi ne kadar?',
    options: [
      { id: 'high', label: '%80+ — Her gün aynı şeyler', emoji: '🔁', weight: 90 },
      { id: 'medium', label: '%50 civarı — Biraz rutin, biraz yeni', emoji: '⚖️', weight: 55 },
      { id: 'low', label: '%20 — Sürekli yeni sorunlar çözerim', emoji: '🧩', weight: 25 },
      { id: 'none', label: 'Neredeyse hiç rutin yok', emoji: '🌪️', weight: 15 },
    ],
  },
  {
    id: 3,
    emoji: '🤖',
    title: 'AI ile aran nasıl?',
    subtitle: 'Yapay zekâ araçlarını ne sıklıkla kullanıyorsun?',
    options: [
      { id: 'daily', label: 'Her gün kullanıyorum, bağımlıyım', emoji: '🚀', weight: 80 },
      { id: 'weekly', label: 'Haftada birkaç kez işimi hızlandırıyor', emoji: '⚡', weight: 60 },
      { id: 'rare', label: 'Az kullanıyorum, daha çok kendi yaparım', emoji: '🤷', weight: 45 },
      { id: 'never', label: 'Kullanmıyorum — tehlike görmedim', emoji: '🙈', weight: 70 },
    ],
  },
];

export interface RiskResult {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  profession: string;
  color: string;
  gradient: string;
  description: string;
}

const professions = [
  { profession: 'Veri Girişi Uzmanı', color: '#ef4444', gradient: 'from-red-500 to-rose-600' },
  { profession: 'Müşteri Hizmetleri Temsilcisi', color: '#f97316', gradient: 'from-orange-500 to-amber-600' },
  { profession: 'İçerik Yazarı', color: '#a855f7', gradient: 'from-purple-500 to-violet-600' },
  { profession: 'Grafik Tasarımcı', color: '#8b5cf6', gradient: 'from-violet-500 to-purple-600' },
  { profession: 'Veri Analisti', color: '#6366f1', gradient: 'from-indigo-500 to-blue-600' },
  { profession: 'Muhasebeci', color: '#3b82f6', gradient: 'from-blue-500 to-indigo-600' },
  { profession: 'Pazarlama Uzmanı', color: '#06b6d4', gradient: 'from-cyan-500 to-blue-500' },
  { profession: 'Saha Mühendisi', color: '#10b981', gradient: 'from-emerald-500 to-teal-600' },
];

const descriptions: Record<RiskResult['level'], string> = {
  low: 'İşin yapay zekâya karşı şimdilik dirençli. Fiziksel ve yaratıcı unsurlar seni koruyor — ama dikkatli ol, AI hızla gelişiyor.',
  medium: 'İşinin bir kısmı otomasyona açık. Yaratıcı ve stratejik becerilerini geliştirerek riski azaltabilirsin.',
  high: 'İşinin büyük bir kısmı yapay zekâ tarafından otomatikleştirilebilir. Hemen yeni beceriler edinmeye başla.',
  critical: 'İşin yapay zekânın en kolay ele geçirebileceği alanlardan biri. Acil durum: kendini yeniden icat et!',
};

export function calculateRisk(answers: QuizAnswer[]): RiskResult {
  const totalWeight = answers.reduce((sum, a) => sum + a.weight, 0);
  const avgWeight = totalWeight / answers.length;
  const score = Math.round(Math.min(98, Math.max(12, avgWeight + (answers.length > 0 ? (Math.random() * 8 - 4) : 0))));

  let level: RiskResult['level'] = 'low';
  if (score >= 75) level = 'critical';
  else if (score >= 55) level = 'high';
  else if (score >= 35) level = 'medium';

  const idx = Math.min(professions.length - 1, Math.floor(score / 13));
  const p = professions[idx];

  return {
    score,
    level,
    profession: p.profession,
    color: p.color,
    gradient: p.gradient,
    description: descriptions[level],
  };
}
