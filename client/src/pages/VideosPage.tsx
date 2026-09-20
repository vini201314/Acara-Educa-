import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Video,
  Search,
  BookOpen,
  PlayCircle,
  CheckCircle2,
  Filter,
  GraduationCap,
  Sparkles,
} from "lucide-react";

const CATEGORIES = [
  "Todas",
  "Matemática",
  "Português",
  "Ciências",
  "História",
  "Geografia",
  "Inglês",
  "Educação Física",
  "Outras",
];

export default function VideosPage() {
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: user } = trpc.auth.me.useQuery();

  const { data: videos, isLoading } = trpc.videos.list.useQuery({
    subject: selectedCategory === "Todas" ? undefined : selectedCategory,
    search: searchQuery ? searchQuery : undefined,
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header da Página */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <Video className="w-3.5 h-3.5" />
                Catálogo de Videoaulas
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Aprenda com aulas práticas e explicativas
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Escolha a disciplina desejada, utilize a busca para encontrar tópicos específicos e acompanhe seu progresso de vídeos assistidos.
              </p>
            </div>

            {/* Barra de Busca */}
            <div className="mt-8 relative max-w-xl">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Pesquisar por título ou conteúdo da aula..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-13 rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:bg-white focus-visible:ring-emerald-500 text-sm shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Filtros por Categoria/Matéria */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
                Filtrar por Matéria
              </span>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(category => {
                  const isSelected = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        isSelected
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-105"
                          : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Lista de Vídeos */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {selectedCategory === "Todas" ? "Todas as Aulas" : `Aulas de ${selectedCategory}`}
                {videos && <span className="text-slate-400 text-sm font-normal ml-2">({videos.length})</span>}
              </h2>

              {!user && (
                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    <Link href="/login" className="font-bold text-emerald-600 hover:underline">
                      Faça login
                    </Link>{" "}
                    para marcar suas aulas como assistidas
                  </span>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-72 rounded-3xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : videos && videos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map(video => (
                  <Link key={video.id} href={`/videos/${video.id}`} className="group block">
                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all duration-200 flex flex-col h-full">
                      {/* Miniatura */}
                      <div className="relative aspect-video bg-slate-900 overflow-hidden">
                        {video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-emerald-800 to-slate-900 flex items-center justify-center">
                            <GraduationCap className="w-12 h-12 text-emerald-400/50" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/90 text-emerald-700 flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-white transition-all">
                            <PlayCircle className="w-7 h-7" />
                          </div>
                        </div>

                        {/* Tag de Matéria */}
                        <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-emerald-900 text-xs font-bold px-3 py-1 rounded-lg shadow-xs">
                          {video.subject}
                        </span>

                        {/* Tag Assistido */}
                        {video.isWatched && (
                          <span className="absolute bottom-3 right-3 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Assistido
                          </span>
                        )}
                      </div>

                      {/* Informações */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors line-clamp-2">
                            {video.title}
                          </h3>
                          <p className="text-slate-600 text-xs mt-2 line-clamp-3 leading-relaxed">
                            {video.description}
                          </p>
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                          <span>{new Date(video.publishedAt).toLocaleDateString("pt-BR")}</span>
                          <span className="text-emerald-600 font-bold group-hover:translate-x-1 transition-transform flex items-center">
                            Assistir aula →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-200">
                <Video className="w-14 h-14 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">
                  Nenhum vídeo encontrado
                </h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1 mb-6">
                  Não encontramos aulas com os filtros aplicados. Tente buscar por outro termo ou selecione outra matéria.
                </p>
                <Button
                  onClick={() => {
                    setSelectedCategory("Todas");
                    setSearchQuery("");
                  }}
                  variant="outline"
                  className="rounded-xl"
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
