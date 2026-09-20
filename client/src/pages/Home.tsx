import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Video,
  Lightbulb,
  Target,
  ArrowRight,
  PlayCircle,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Users,
  Search,
} from "lucide-react";

export default function Home() {
  const { data: user } = trpc.auth.me.useQuery();
  const { data: videos, isLoading: loadingVideos } = trpc.videos.list.useQuery();

  const recentVideos = videos ? videos.slice(0, 4) : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* Banner de Boas-vindas para Aluno Logado */}
        {user && (
          <div className="bg-emerald-50 border-b border-emerald-100 py-4 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Olá, {user.name}! Que bom ter você aqui.
                  </h2>
                  <p className="text-xs text-emerald-800 font-medium">
                    Seu ID de aluno:{" "}
                    <span className="font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                      {user.studentCode}
                    </span>{" "}
                    • Vídeos assistidos:{" "}
                    <span className="font-bold text-slate-900">{user.watchedCount}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/videos">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs">
                    Continuar Estudando
                  </Button>
                </Link>
                <Link href="/perfil">
                  <Button size="sm" variant="outline" className="text-slate-700 rounded-xl text-xs">
                    Meu Perfil
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
          {/* Elementos visuais de fundo em verde e amarelo suave */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-emerald-200/40 via-amber-200/30 to-transparent blur-3xl -z-10 rounded-full" />
          <div className="absolute -top-10 right-10 w-72 h-72 bg-yellow-100/50 rounded-full blur-2xl -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Tag em Destaque */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 text-emerald-900 text-xs sm:text-sm font-bold border border-emerald-200 mb-6 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Plataforma de Reforço Escolar de Acaraú</span>
            </div>

            {/* Título Principal Conforme Briefing */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight mb-6">
              Aprenda mais. <span className="text-emerald-600 underline decoration-amber-400 decoration-wavy decoration-2">Estude melhor.</span>
            </h1>

            {/* Texto Conforme Briefing */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
              O <strong className="text-slate-800">Acaraú Educa+</strong> é uma plataforma de reforço escolar criada para ajudar alunos a aprender de forma simples, gratuita e acessível.
            </p>

            {/* Botões Conforme Briefing */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
              {user ? (
                <Link href="/videos" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base h-13 px-8 rounded-2xl shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02]"
                  >
                    Começar a estudar
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Link href="/cadastro" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base h-13 px-8 rounded-2xl shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02]"
                  >
                    Começar a estudar
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              )}

              <Link href="/videos" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-base h-13 px-8 rounded-2xl shadow-xs transition-all hover:border-emerald-300"
                >
                  <PlayCircle className="w-5 h-5 mr-2 text-emerald-600" />
                  Ver vídeos
                </Button>
              </Link>
            </div>

            {/* CARDS CONFORME BRIEFING:
                📚 Conteúdos educativos | 🎥 Videoaulas | 💡 Sugestões dos alunos | 🎯 Aprendizado acessível. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {/* Card 1 */}
              <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span>📚</span> Conteúdos educativos
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Aulas organizadas por matéria, focadas nos conteúdos mais cobrados e nas maiores dúvidas dos estudantes.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 mb-4">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span>🎥</span> Videoaulas
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Aulas dinâmicas disponíveis por links diretos ou vídeos enviados, prontas para assistir no celular ou computador.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center text-yellow-700 mb-4">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span>💡</span> Sugestões dos alunos
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Canal aberto para que você indique temas e assuntos que gostaria de ver explicados na plataforma.
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 mb-4">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span>🎯</span> Aprendizado acessível
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Totalmente gratuito, sem anúncios invasivos, com interface leve e adaptada para conexões escolares.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO VÍDEOS RECENTES */}
        <section className="py-16 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Explorar Aulas
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Videoaulas Recentes
                </h2>
                <p className="text-slate-600 text-sm mt-1">
                  Confira as últimas aulas adicionadas pela equipe pedagógica.
                </p>
              </div>
              <Link href="/videos">
                <Button variant="outline" className="border-slate-200 rounded-xl font-semibold gap-2 hover:border-emerald-300">
                  Ver todas as aulas
                  <ArrowRight className="w-4 h-4 text-emerald-600" />
                </Button>
              </Link>
            </div>

            {loadingVideos ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-64 rounded-3xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : recentVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentVideos.map(video => (
                  <Link key={video.id} href={`/videos/${video.id}`} className="group block">
                    <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-200 transition-all duration-200 flex flex-col h-full">
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                        {video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-emerald-800 to-slate-900 flex items-center justify-center">
                            <GraduationCap className="w-10 h-10 text-emerald-400/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/90 text-emerald-700 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white transition-all">
                            <PlayCircle className="w-7 h-7" />
                          </div>
                        </div>
                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-lg shadow-xs">
                          {video.subject}
                        </span>
                        {video.isWatched && (
                          <span className="absolute bottom-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Assistido
                          </span>
                        )}
                      </div>

                      {/* Conteúdo */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors line-clamp-2">
                            {video.title}
                          </h3>
                          <p className="text-slate-600 text-xs mt-2 line-clamp-2 leading-relaxed">
                            {video.description}
                          </p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                          <span>{new Date(video.publishedAt).toLocaleDateString("pt-BR")}</span>
                          <span className="text-emerald-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
                            Assistir
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4 rounded-3xl bg-slate-50 border border-dashed border-slate-200">
                <Video className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">
                  Nenhuma videoaula publicada ainda
                </h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1 mb-4">
                  Os administradores podem adicionar as primeiras aulas no Painel Administrativo.
                </p>
                {user && (user.role === "admin" || user.role === "superadmin") && (
                  <Link href="/admin">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                      Publicar Primeiro Vídeo
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>

        {/* SEÇÃO INCENTIVO ÀS SUGESTÕES */}
        <section className="py-16 bg-gradient-to-b from-slate-50 to-emerald-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl border border-emerald-200 p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" /> Sua voz faz a diferença
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Tem alguma dúvida ou assunto que gostaria de aprender?
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Envie uma sugestão de aula diretamente para os professores e administradores. As ideias mais solicitadas viram novas videoaulas gravadas especialmente para você!
                </p>
              </div>
              <div className="shrink-0 w-full sm:w-auto">
                <Link href="/sugestoes">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-2xl h-13 px-8 shadow-md shadow-amber-500/20"
                  >
                    <Lightbulb className="w-5 h-5 mr-2" />
                    Enviar Minha Sugestão
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
