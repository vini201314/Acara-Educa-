import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Calendar,
  User,
  CheckCircle2,
  ArrowLeft,
  Share2,
  Video,
  Play,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";

export default function VideoDetailPage() {
  const [, params] = useRoute("/videos/:id");
  const videoId = params?.id ? parseInt(params.id, 10) : 0;

  const utils = trpc.useUtils();
  const { data: user } = trpc.auth.me.useQuery();
  const { data: video, isLoading, error } = trpc.videos.getById.useQuery(
    { id: videoId },
    { enabled: videoId > 0 }
  );

  const markWatchedMutation = trpc.videos.markWatched.useMutation({
    onSuccess: () => {
      utils.videos.getById.invalidate({ id: videoId });
      utils.videos.list.invalidate();
      utils.auth.me.invalidate();
      toast.success("Vídeo registrado como assistido!");
    },
    onError: err => {
      toast.error(err.message || "Erro ao registrar visualização.");
    },
  });

  // Marca automaticamente após carregar a aula se o aluno estiver logado
  useEffect(() => {
    if (user && video && !video.isWatched && !markWatchedMutation.isPending) {
      markWatchedMutation.mutate({ videoId });
    }
  }, [user, video?.id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  // Processa URL de vídeo para embeds compatíveis (YouTube, etc)
  const getEmbedInfo = (url: string) => {
    if (!url) return { type: "unknown", src: url };

    // YouTube watch ou short
    const ytMatch =
      url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/) ||
      url.match(/youtube\.com\/shorts\/([\w-]{11})/);

    if (ytMatch && ytMatch[1]) {
      return {
        type: "youtube",
        src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`,
      };
    }

    // Arquivo direto ou /manus-storage/
    if (
      url.endsWith(".mp4") ||
      url.endsWith(".webm") ||
      url.endsWith(".ogg") ||
      url.startsWith("/manus-storage/")
    ) {
      return { type: "html5", src: url };
    }

    return { type: "unknown", src: url };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-12 space-y-6">
          <div className="h-6 w-32 bg-slate-200 animate-pulse rounded-lg" />
          <div className="aspect-video w-full bg-slate-200 animate-pulse rounded-3xl" />
          <div className="h-10 w-2/3 bg-slate-200 animate-pulse rounded-xl" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto flex flex-col items-center justify-center p-6 text-center">
          <Video className="w-16 h-16 text-slate-300 mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Vídeo não encontrado</h1>
          <p className="text-slate-500 text-sm mt-2 mb-6">
            A videoaula solicitada pode ter sido removida ou o link está incorreto.
          </p>
          <Link href="/videos">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
              Voltar para o catálogo
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const embed = getEmbedInfo(video.videoUrl);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Navegação de Volta */}
          <div>
            <Link
              href="/videos"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para todas as aulas
            </Link>
          </div>

          {/* Player Container */}
          <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="relative aspect-video w-full flex items-center justify-center bg-black">
              {embed.type === "youtube" ? (
                <iframe
                  src={embed.src}
                  title={video.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : embed.type === "html5" ? (
                <video
                  src={embed.src}
                  controls
                  controlsList="nodownload"
                  className="w-full h-full object-contain"
                  poster={video.thumbnailUrl || undefined}
                >
                  Seu navegador não suporta reprodução de vídeo HTML5.
                </video>
              ) : (
                <div className="p-8 text-center text-white space-y-4">
                  <Play className="w-12 h-12 mx-auto text-emerald-400" />
                  <p className="text-sm text-slate-300">
                    Este vídeo está hospedado em uma fonte externa.
                  </p>
                  <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white"
                  >
                    Abrir vídeo na fonte original
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Informações da Videoaula */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1 rounded-lg">
                    {video.subject}
                  </span>
                  {video.isWatched && (
                    <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Assistido
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {video.title}
                </h1>
              </div>

              {/* Ações: Marcar Assistido & Compartilhar */}
              <div className="flex items-center gap-2 shrink-0">
                {user ? (
                  <Button
                    onClick={() => markWatchedMutation.mutate({ videoId: video.id })}
                    disabled={markWatchedMutation.isPending || video.isWatched}
                    variant={video.isWatched ? "outline" : "default"}
                    className={`rounded-xl font-semibold gap-1.5 ${
                      video.isWatched
                        ? "border-emerald-200 text-emerald-700 bg-emerald-50/50"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {video.isWatched ? "Aula Assistida" : "Marcar como Assistida"}
                  </Button>
                ) : (
                  <Link href="/login">
                    <Button variant="outline" className="rounded-xl text-xs font-semibold">
                      Entrar para registrar progresso
                    </Button>
                  </Link>
                )}

                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="icon"
                  title="Compartilhar aula"
                  className="rounded-xl border-slate-200 hover:border-emerald-300"
                >
                  <Share2 className="w-4 h-4 text-slate-600" />
                </Button>
              </div>
            </div>

            {/* Metadados */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 pt-4 border-t border-slate-100">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-slate-400" />
                Publicado em: {new Date(video.publishedAt).toLocaleDateString("pt-BR")}
              </span>
              {video.createdByName && (
                <span className="flex items-center gap-1.5 font-medium">
                  <User className="w-4 h-4 text-slate-400" />
                  Instrutor: {video.createdByName}
                </span>
              )}
            </div>

            {/* Descrição */}
            <div className="pt-2">
              <h3 className="text-sm font-bold text-slate-900 mb-2">
                Sobre esta aula:
              </h3>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {video.description}
              </p>
            </div>
          </div>

          {/* Card de Chamada para Sugestão */}
          <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-amber-950 text-sm">
                  Ficou com alguma dúvida nesta disciplina?
                </h4>
                <p className="text-amber-800 text-xs">
                  Envie uma sugestão de nova aula para ser gravada pelos professores!
                </p>
              </div>
            </div>
            <Link href="/sugestoes">
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shrink-0">
                Enviar Sugestão
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
