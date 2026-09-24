import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  User, GraduationCap, Calendar, CheckCircle2, LogOut, Shield, BookOpen,
  Trophy, LockKeyhole, Brain, Sparkles, Medal, Target, CircleCheck,
} from "lucide-react";
import { toast } from "sonner";

const optionLetters = ["A", "B", "C", "D"];

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const { data: user, isLoading } = trpc.auth.me.useQuery();
  const { data: profile, isLoading: profileLoading } = trpc.gamification.profile.useQuery(undefined, { enabled: !!user });
  const { data: challenge, isLoading: challengeLoading } = trpc.gamification.todayChallenge.useQuery(undefined, { enabled: !!user });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success("Você saiu da conta.");
      setLocation("/");
    },
  });

  const answerChallengeMutation = trpc.gamification.answerChallenge.useMutation({
    onSuccess: result => {
      setSelectedOption(null);
      utils.gamification.todayChallenge.invalidate();
      utils.gamification.profile.invalidate();
      utils.auth.me.invalidate();
      if (result.correct) {
        toast.success(result.alreadyAnswered ? "Você já respondeu este desafio." : "Resposta correta! +30 XP");
      } else {
        toast.error("Resposta incorreta. Continue estudando!");
      }
      if (result.leveledUp) toast.success(`Você subiu para o nível ${result.level}! Patente: ${result.rank}`);
    },
    onError: error => toast.error(error.message || "Não foi possível responder ao desafio."),
  });

  if (isLoading) {
    return <div className="min-h-screen flex flex-col bg-slate-50"><Navbar /><div className="flex-1 max-w-3xl mx-auto w-full p-8 space-y-4"><div className="h-40 bg-slate-200 animate-pulse rounded-3xl" /><div className="h-64 bg-slate-200 animate-pulse rounded-3xl" /></div><Footer /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto flex flex-col items-center justify-center p-6 text-center">
          <User className="w-16 h-16 text-slate-300 mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Acesso ao Perfil</h1>
          <p className="text-slate-500 text-sm mt-2 mb-6">Você precisa estar conectado à sua conta para visualizar seus dados de aluno e histórico.</p>
          <div className="flex gap-3"><Link href="/login"><Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">Entrar</Button></Link><Link href="/cadastro"><Button variant="outline" className="rounded-xl">Cadastrar</Button></Link></div>
        </div>
        <Footer />
      </div>
    );
  }

  const lessonsCompleted = profile?.lessonsCompleted ?? user.watchedCount ?? 0;
  const totalLessons = profile?.totalLessons ?? 0;
  const progressPercent = profile?.progressPercent ?? 0;
  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const rank = profile?.rank ?? "Iniciante";
  const xpIntoLevel = profile?.xpIntoLevel ?? xp % 100;
  const xpForNextLevel = profile?.xpForNextLevel ?? level * 100;
  const achievements = profile?.achievements ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-green-500 to-amber-500" />
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-7 border-b border-slate-100">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center font-extrabold text-3xl shadow-lg shadow-emerald-600/20 shrink-0">{user.name.charAt(0).toUpperCase()}</div>
              <div className="text-center sm:text-left space-y-2 flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{user.name}</h1>
                  <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300">{user.isGeneralAdmin ? "Administrador Geral" : user.role === "admin" ? "Administrador" : "Aluno"}</span>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm">
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">ID: {user.studentCode}</span>
                  <span className="text-slate-400 hidden sm:inline">•</span>
                  <span className="text-slate-500 text-xs flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Membro desde: {new Date(user.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
            </div>

            <div className="mt-7 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center"><Medal className="w-6 h-6" /></div><div><p className="text-xs uppercase font-bold tracking-wide text-emerald-700">Patente atual</p><h2 className="text-xl font-black text-slate-900">{rank}</h2></div></div>
                <div className="text-left sm:text-right"><p className="text-sm font-bold text-slate-800">Nível {level}</p><p className="text-xs text-slate-500">{xp} XP total</p></div>
              </div>
              <div className="mt-5"><div className="flex justify-between text-xs font-semibold text-slate-600 mb-2"><span>Progresso para o nível {level + 1}</span><span>{xpIntoLevel} / 100 XP</span></div><div className="h-3 rounded-full bg-emerald-100 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all" style={{ width: `${Math.min(100, xpIntoLevel)}%` }} /></div><p className="mt-2 text-[11px] text-slate-500">Próximo nível em {Math.max(0, xpForNextLevel - xp)} XP</p></div>
            </div>

            <div className="py-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-100 flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0"><CheckCircle2 className="w-6 h-6" /></div><div><span className="text-2xl font-black text-slate-900">{lessonsCompleted}</span><p className="text-xs text-slate-600 font-semibold">Aulas concluídas</p></div></div>
              <div className="bg-amber-50/60 rounded-2xl p-5 border border-amber-100 flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0"><Target className="w-6 h-6" /></div><div><span className="text-2xl font-black text-slate-900">{progressPercent}%</span><p className="text-xs text-slate-600 font-semibold">Progresso geral</p></div></div>
              <div className="bg-green-50/60 rounded-2xl p-5 border border-green-100 flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-green-600 text-white flex items-center justify-center shrink-0"><Trophy className="w-6 h-6" /></div><div><span className="text-2xl font-black text-slate-900">{achievements.filter(item => item.unlocked).length}</span><p className="text-xs text-slate-600 font-semibold">Conquistas desbloqueadas</p></div></div>
            </div>
            <div className="mb-7"><div className="flex justify-between text-sm font-bold text-slate-700 mb-2"><span>Progresso das aulas</span><span>{lessonsCompleted} de {totalLessons}</span></div><div className="h-3 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: `${progressPercent}%` }} /></div></div>

            {profile?.lessonsBySubject && Object.keys(profile.lessonsBySubject).length > 0 && <div className="border-t border-slate-100 pt-6"><h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4 text-emerald-600" /> Progresso por matéria</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{Object.entries(profile.lessonsBySubject).map(([subject, count]) => <div key={subject} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span className="text-sm font-semibold text-slate-700">{subject}</span><span className="text-xs font-bold text-emerald-700">{count} aula{count === 1 ? "" : "s"}</span></div>)}</div></div>}

            <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3"><Link href="/videos" className="w-full sm:w-auto"><Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"><BookOpen className="w-4 h-4 mr-2" /> Explorar videoaulas</Button></Link><div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">{(user.role === "admin" || user.role === "superadmin") && <Link href="/admin" className="w-full sm:w-auto"><Button variant="outline" className="w-full border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl font-semibold"><Shield className="w-4 h-4 mr-2 text-amber-600" /> Painel Admin</Button></Link>}<Button onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending} variant="outline" className="w-full sm:w-auto border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl font-semibold"><LogOut className="w-4 h-4 mr-2" /> Sair da Conta</Button></div></div>
          </div>

          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-indigo-100 shadow-sm"><div className="flex items-start justify-between gap-4 mb-5"><div><span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-indigo-700"><Brain className="w-4 h-4" /> Desafio do Dia</span><h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Teste seus conhecimentos</h2></div><Sparkles className="w-7 h-7 text-amber-400 shrink-0" /></div>{challengeLoading ? <div className="h-28 rounded-2xl bg-slate-100 animate-pulse" /> : challenge ? <div><p className="text-slate-800 font-semibold leading-relaxed mb-4">{challenge.question}</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{challenge.options.map((option, index) => <button key={index} disabled={challenge.answered || answerChallengeMutation.isPending} onClick={() => setSelectedOption(index)} className={`text-left rounded-xl border p-3 text-sm transition-colors ${selectedOption === index ? "border-indigo-500 bg-indigo-50 text-indigo-900" : "border-slate-200 hover:border-indigo-300 bg-white"} ${challenge.answered ? "opacity-70 cursor-not-allowed" : ""}`}><span className="font-black mr-2">{optionLetters[index]}.</span>{option}</button>)}</div><div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">{!challenge.answered && <Button disabled={selectedOption === null || answerChallengeMutation.isPending} onClick={() => selectedOption !== null && answerChallengeMutation.mutate({ challengeId: challenge.id, selectedOption })} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">Responder desafio</Button>}{challenge.answered && <p className={`text-sm font-bold ${challenge.answer?.isCorrect ? "text-emerald-700" : "text-rose-700"}`}>{challenge.answer?.isCorrect ? "🎉 Resposta correta! Você ganhou XP." : "❌ Resposta incorreta. Continue estudando!"}</p>}</div></div> : <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-200 p-5 text-sm text-slate-600">O desafio de hoje ainda não foi publicado. Volte mais tarde!</div>}</section>

          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-sm"><div className="flex items-center gap-2 mb-5"><Trophy className="w-5 h-5 text-amber-500" /><h2 className="text-xl font-black text-slate-900">Minhas Conquistas</h2></div>{profileLoading ? <div className="h-24 bg-slate-100 animate-pulse rounded-2xl" /> : <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{achievements.map(achievement => <div key={achievement.id} className={`rounded-2xl border p-4 flex items-center gap-3 ${achievement.unlocked ? "border-amber-200 bg-amber-50/60" : "border-slate-200 bg-slate-50 opacity-65"}`}>{achievement.unlocked ? <CircleCheck className="w-6 h-6 text-amber-600 shrink-0" /> : <LockKeyhole className="w-5 h-5 text-slate-400 shrink-0" />}<div><p className="font-bold text-sm text-slate-900">{achievement.name}</p><p className="text-xs text-slate-600">{achievement.description}</p></div></div>)}</div>}</section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
