import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Shield,
  Video,
  Lightbulb,
  UserCheck,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Upload,
  Link as LinkIcon,
  AlertCircle,
  FileVideo,
  Eye,
  Clock,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";

const SUBJECTS = [
  "Matemática",
  "Português",
  "Ciências",
  "História",
  "Geografia",
  "Inglês",
  "Educação Física",
  "Outras",
];

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const [activeTab, setActiveTab] = useState<"videos" | "suggestions" | "admins">("videos");

  // Estado para Modal de Vídeo (Adicionar / Editar)
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<number | null>(null);
  const [sourceType, setSourceType] = useState<"url" | "file">("url");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoSubject, setVideoSubject] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Estado para Adicionar Administrador por ID
  const [newAdminCode, setNewAdminCode] = useState("");

  // Queries
  const { data: user, isLoading: loadingAuth } = trpc.auth.me.useQuery();
  const { data: stats, isLoading: loadingStats } = trpc.admin.stats.useQuery(undefined, {
    enabled: !!user && (user.role === "admin" || user.role === "superadmin"),
  });
  const { data: videos, isLoading: loadingVideos } = trpc.videos.list.useQuery();
  const { data: suggestions, isLoading: loadingSuggestions } = trpc.admin.listSuggestions.useQuery(
    undefined,
    { enabled: !!user && (user.role === "admin" || user.role === "superadmin") }
  );
  const { data: admins, isLoading: loadingAdmins } = trpc.admin.listAdmins.useQuery(undefined, {
    enabled: !!user && (user.role === "admin" || user.role === "superadmin"),
  });

  // Mutations
  const createVideoMutation = trpc.admin.createVideo.useMutation({
    onSuccess: () => {
      utils.videos.list.invalidate();
      utils.admin.stats.invalidate();
      toast.success("Videoaula adicionada com sucesso!");
      closeVideoModal();
    },
    onError: err => toast.error(err.message || "Erro ao adicionar vídeo."),
  });

  const updateVideoMutation = trpc.admin.updateVideo.useMutation({
    onSuccess: () => {
      utils.videos.list.invalidate();
      toast.success("Videoaula atualizada com sucesso!");
      closeVideoModal();
    },
    onError: err => toast.error(err.message || "Erro ao atualizar vídeo."),
  });

  const deleteVideoMutation = trpc.admin.deleteVideo.useMutation({
    onSuccess: () => {
      utils.videos.list.invalidate();
      utils.admin.stats.invalidate();
      toast.success("Vídeo excluído com sucesso.");
    },
    onError: err => toast.error(err.message || "Erro ao excluir vídeo."),
  });

  const uploadFileMutation = trpc.admin.uploadVideoFile.useMutation();

  const markReviewedMutation = trpc.admin.markSuggestionReviewed.useMutation({
    onSuccess: () => {
      utils.admin.listSuggestions.invalidate();
      utils.admin.stats.invalidate();
      toast.success("Sugestão marcada como analisada.");
    },
    onError: err => toast.error(err.message),
  });

  const deleteSuggestionMutation = trpc.admin.deleteSuggestion.useMutation({
    onSuccess: () => {
      utils.admin.listSuggestions.invalidate();
      utils.admin.stats.invalidate();
      toast.success("Sugestão excluída.");
    },
    onError: err => toast.error(err.message),
  });

  const addAdminMutation = trpc.admin.addAdminByStudentCode.useMutation({
    onSuccess: data => {
      utils.admin.listAdmins.invalidate();
      utils.admin.stats.invalidate();
      setNewAdminCode("");
      toast.success(
        `O usuário ${data.user.name} (${data.user.studentCode}) agora é Administrador!`
      );
    },
    onError: err => toast.error(err.message || "Erro ao promover usuário."),
  });

  const removeAdminMutation = trpc.admin.removeAdmin.useMutation({
    onSuccess: data => {
      utils.admin.listAdmins.invalidate();
      utils.admin.stats.invalidate();
      toast.success(`Permissão de administrador removida para ${data.user.name}.`);
    },
    onError: err => toast.error(err.message || "Erro ao remover permissão."),
  });

  // Funções Auxiliares de Modal
  const openNewVideoModal = () => {
    setEditingVideoId(null);
    setSourceType("url");
    setVideoTitle("");
    setVideoDescription("");
    setVideoSubject("");
    setVideoUrl("");
    setThumbnailUrl("");
    setUploadProgress(null);
    setIsUploading(false);
    setVideoModalOpen(true);
  };

  const openEditVideoModal = (video: any) => {
    setEditingVideoId(video.id);
    setSourceType(video.sourceType || "url");
    setVideoTitle(video.title);
    setVideoDescription(video.description);
    setVideoSubject(video.subject);
    setVideoUrl(video.videoUrl);
    setThumbnailUrl(video.thumbnailUrl || "");
    setUploadProgress(null);
    setIsUploading(false);
    setVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setVideoModalOpen(false);
    setEditingVideoId(null);
  };

  // Upload de Arquivo de Vídeo
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Por favor, selecione um arquivo de vídeo válido (MP4, WebM, etc).");
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    try {
      const reader = new FileReader();
      reader.onprogress = ev => {
        if (ev.lengthComputable) {
          const percent = Math.round((ev.loaded / ev.total) * 60);
          setUploadProgress(15 + percent);
        }
      };

      reader.onload = async () => {
        try {
          setUploadProgress(80);
          const result = reader.result as string;
          const base64Data = result.split(",")[1];

          const res = await uploadFileMutation.mutateAsync({
            fileName: file.name,
            contentType: file.type || "video/mp4",
            base64Data,
          });

          setVideoUrl(res.url);
          setUploadProgress(100);
          toast.success("Upload do arquivo concluído com sucesso!");
        } catch (err: any) {
          toast.error(err.message || "Falha ao enviar arquivo de vídeo.");
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        setIsUploading(false);
        setUploadProgress(null);
        toast.error("Erro ao ler o arquivo selecionado.");
      };

      reader.readAsDataURL(file);
    } catch {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoTitle.trim()) {
      toast.error("O título do vídeo é obrigatório.");
      return;
    }
    if (!videoSubject) {
      toast.error("Selecione a matéria correspondente.");
      return;
    }
    if (!videoDescription.trim()) {
      toast.error("A descrição do vídeo é obrigatória.");
      return;
    }
    if (!videoUrl.trim()) {
      toast.error("Forneça a URL do vídeo ou envie um arquivo.");
      return;
    }

    if (editingVideoId) {
      updateVideoMutation.mutate({
        id: editingVideoId,
        title: videoTitle.trim(),
        description: videoDescription.trim(),
        subject: videoSubject,
        sourceType,
        videoUrl: videoUrl.trim(),
        thumbnailUrl: thumbnailUrl.trim() || null,
      });
    } else {
      createVideoMutation.mutate({
        title: videoTitle.trim(),
        description: videoDescription.trim(),
        subject: videoSubject,
        sourceType,
        videoUrl: videoUrl.trim(),
        thumbnailUrl: thumbnailUrl.trim() || undefined,
      });
    }
  };

  // Proteção de Rota Admin
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin text-3xl">🌀</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto flex flex-col items-center justify-center p-6 text-center">
          <Shield className="w-16 h-16 text-rose-500 mb-4" />
          <h1 className="text-2xl font-black text-slate-900">Acesso Restrito</h1>
          <p className="text-slate-600 text-sm mt-2 mb-6">
            Somente usuários com permissão de administrador podem acessar este painel. As permissões são validadas de forma estrita no servidor.
          </p>
          <Link href="/">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
              Voltar para o início
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header do Painel */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                Painel Administrativo Oficial
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Gestão do Acaraú Educa+
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Conectado como: <strong>{user.name}</strong> ({user.studentCode}) •{" "}
                {user.isGeneralAdmin ? (
                  <span className="text-amber-700 font-bold">Administrador Geral</span>
                ) : (
                  <span className="text-emerald-700 font-bold">Administrador</span>
                )}
              </p>
            </div>

            <Button
              onClick={openNewVideoModal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl gap-2 shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-5 h-5" />
              Adicionar Nova Videoaula
            </Button>
          </div>

          {/* Cards de Métricas */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total de Videoaulas
                </span>
                <p className="text-3xl font-black text-slate-900 mt-2">
                  {stats.videosCount}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Sugestões Recebidas
                </span>
                <p className="text-3xl font-black text-amber-600 mt-2">
                  {stats.suggestionsCount}
                  <span className="text-xs font-normal text-slate-400 ml-2">
                    ({stats.pendingSuggestionsCount} pendentes)
                  </span>
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Alunos Cadastrados
                </span>
                <p className="text-3xl font-black text-emerald-600 mt-2">
                  {stats.studentsCount}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Administradores
                </span>
                <p className="text-3xl font-black text-slate-900 mt-2">
                  {stats.adminsCount}
                </p>
              </div>
            </div>
          )}

          {/* Abas de Navegação */}
          <div className="border-b border-slate-200 flex gap-4">
            <button
              onClick={() => setActiveTab("videos")}
              className={`pb-3 px-2 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === "videos"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Video className="w-4 h-4" />
              Gestão de Vídeos ({videos?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab("suggestions")}
              className={`pb-3 px-2 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === "suggestions"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              Sugestões dos Alunos ({suggestions?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab("admins")}
              className={`pb-3 px-2 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === "admins"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Administradores ({admins?.length || 0})
            </button>
          </div>

          {/* CONTEÚDO DA ABA: VÍDEOS */}
          {activeTab === "videos" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Videoaulas Cadastradas
                </h2>
                <Button
                  onClick={openNewVideoModal}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Novo Vídeo
                </Button>
              </div>

              {loadingVideos ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : videos && videos.length > 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
                  {videos.map(item => (
                    <div
                      key={item.id}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="w-16 h-10 rounded-xl bg-slate-900 shrink-0 overflow-hidden flex items-center justify-center">
                          {item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Video className="w-5 h-5 text-slate-400" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2 py-0.5 rounded-md">
                              {item.subject}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {item.sourceType === "file" ? "📁 Arquivo de vídeo" : "🔗 URL externa"}
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-900 text-base mt-1">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-1 max-w-xl">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <Link href={`/videos/${item.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 rounded-xl"
                            title="Ver como aluno"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>

                        <Button
                          onClick={() => openEditVideoModal(item)}
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-slate-200"
                        >
                          <Edit className="w-4 h-4 mr-1.5 text-slate-600" />
                          Editar
                        </Button>

                        <Button
                          onClick={() => {
                            if (confirm(`Deseja realmente excluir o vídeo "${item.title}"?`)) {
                              deleteVideoMutation.mutate({ id: item.id });
                            }
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:bg-rose-50 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
                  <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-bold">Nenhum vídeo publicado ainda.</p>
                  <Button
                    onClick={openNewVideoModal}
                    className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                  >
                    Adicionar Primeiro Vídeo
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* CONTEÚDO DA ABA: SUGESTÕES */}
          {activeTab === "suggestions" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">
                Sugestões Enviadas pelos Alunos
              </h2>

              {loadingSuggestions ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : suggestions && suggestions.length > 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
                  {suggestions.map(s => (
                    <div key={s.id} className="p-6 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-lg">
                            {s.subject}
                          </span>
                          {s.status === "reviewed" ? (
                            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Analisada
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-lg">
                              Pendente
                            </span>
                          )}
                        </div>

                        <span className="text-xs text-slate-400">
                          Enviado em {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{s.title}</h3>
                        <p className="text-slate-600 text-sm mt-1 whitespace-pre-line leading-relaxed">
                          {s.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <span>
                            Aluno: <strong>{s.studentName}</strong>
                          </span>
                          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-emerald-700 font-bold">
                            {s.studentCode}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {s.status === "pending" && (
                            <Button
                              onClick={() => markReviewedMutation.mutate({ id: s.id })}
                              size="sm"
                              variant="outline"
                              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1.5" />
                              Marcar como Analisada
                            </Button>
                          )}

                          <Button
                            onClick={() => {
                              if (confirm("Deseja realmente excluir esta sugestão?")) {
                                deleteSuggestionMutation.mutate({ id: s.id });
                              }
                            }}
                            size="sm"
                            variant="ghost"
                            className="text-rose-600 hover:bg-rose-50 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
                  <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-bold">Nenhuma sugestão enviada até o momento.</p>
                </div>
              )}
            </div>
          )}

          {/* CONTEÚDO DA ABA: ADMINISTRADORES */}
          {activeTab === "admins" && (
            <div className="space-y-6">
              {/* Card de Adição de Administrador (Exclusivo Administrador Geral) */}
              {user.isGeneralAdmin ? (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-600" />
                    <h2 className="text-lg font-bold text-slate-900">
                      Adicionar Novo Administrador por ID
                    </h2>
                  </div>
                  <p className="text-slate-600 text-sm">
                    Como Administrador Geral, você pode promover qualquer aluno a administrador inserindo o ID único (exemplo: <strong>#002</strong>).
                  </p>

                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      if (!newAdminCode.trim()) {
                        toast.error("Informe o ID do aluno.");
                        return;
                      }
                      addAdminMutation.mutate({ studentCode: newAdminCode.trim() });
                    }}
                    className="flex flex-col sm:flex-row gap-3 max-w-md"
                  >
                    <Input
                      type="text"
                      placeholder="Ex: #002 ou 002"
                      value={newAdminCode}
                      onChange={e => setNewAdminCode(e.target.value)}
                      className="h-11 rounded-xl text-sm"
                    />
                    <Button
                      type="submit"
                      disabled={addAdminMutation.isPending}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shrink-0"
                    >
                      {addAdminMutation.isPending ? "Adicionando..." : "Promover a Administrador"}
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-100 text-slate-600 text-xs">
                  Apenas o <strong>Administrador Geral</strong> tem permissão para adicionar ou remover outros administradores.
                </div>
              )}

              {/* Lista de Administradores Atuais */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-lg">
                    Administradores Atuais ({admins?.length || 0})
                  </h3>
                </div>

                <div className="divide-y divide-slate-100">
                  {admins?.map(adm => (
                    <div
                      key={adm.id}
                      className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center font-bold text-sm">
                          {adm.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm sm:text-base">
                              {adm.name}
                            </span>
                            {adm.isGeneralAdmin && (
                              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-300">
                                Administrador Geral
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-xs text-emerald-700 font-bold">
                            ID: {adm.studentCode}
                          </span>
                        </div>
                      </div>

                      {user.isGeneralAdmin && !adm.isGeneralAdmin && (
                        <Button
                          onClick={() => {
                            if (
                              confirm(
                                `Deseja remover a permissão de administrador de ${adm.name}?`
                              )
                            ) {
                              removeAdminMutation.mutate({ targetUserId: adm.id });
                            }
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:bg-rose-50 rounded-xl text-xs"
                        >
                          Remover Permissão
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL DE ADICIONAR / EDITAR VÍDEO CONFORME BRIEFING:
          Seletor visual: Como adicionar o vídeo? 🔗 Usar URL | 📁 Enviar arquivo */}
      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold text-slate-900">
              {editingVideoId ? "Editar Videoaula" : "Adicionar Nova Videoaula"}
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs sm:text-sm">
              Preencha os dados pedagógicos e escolha como disponibilizar o vídeo (URL ou Arquivo).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveVideo} className="space-y-4">
            {/* Seletor Visual Obrigatório conforme briefing:
                Como adicionar o vídeo? 🔗 Usar URL | 📁 Enviar arquivo */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Como adicionar o vídeo?
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSourceType("url")}
                  className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                    sourceType === "url"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  🔗 Usar URL
                </button>

                <button
                  type="button"
                  onClick={() => setSourceType("file")}
                  className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                    sourceType === "file"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  📁 Enviar arquivo
                </button>
              </div>
            </div>

            {/* Campo correspondente ao tipo selecionado */}
            {sourceType === "url" ? (
              <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <Label htmlFor="videoUrl" className="text-xs font-bold text-slate-700">
                  URL do Vídeo (YouTube, link direto MP4, etc)
                </Label>
                <Input
                  id="videoUrl"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  className="bg-white h-11 rounded-xl text-sm"
                  required={sourceType === "url"}
                />
              </div>
            ) : (
              <div className="space-y-2 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                <Label className="text-xs font-bold text-emerald-900">
                  Fazer upload de um arquivo de vídeo pelo celular ou computador
                </Label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                />

                {isUploading && uploadProgress !== null && (
                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between text-xs text-emerald-800 font-bold">
                      <span>Enviando arquivo de vídeo...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {videoUrl && sourceType === "file" && !isUploading && (
                  <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-4 h-4" /> Arquivo pronto: {videoUrl}
                  </p>
                )}
              </div>
            )}

            {/* Título */}
            <div className="space-y-1.5">
              <Label htmlFor="vtitle" className="text-xs font-bold text-slate-700">
                Título da Videoaula
              </Label>
              <Input
                id="vtitle"
                type="text"
                placeholder="Ex: Introdução à Trigonometria no Triângulo Retângulo"
                value={videoTitle}
                onChange={e => setVideoTitle(e.target.value)}
                className="h-11 rounded-xl text-sm"
                required
              />
            </div>

            {/* Matéria */}
            <div className="space-y-1.5">
              <Label htmlFor="vsubject" className="text-xs font-bold text-slate-700">
                Matéria / Disciplina
              </Label>
              <Select value={videoSubject} onValueChange={setVideoSubject}>
                <SelectTrigger id="vsubject" className="h-11 rounded-xl text-sm">
                  <SelectValue placeholder="Selecione a matéria" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map(subj => (
                    <SelectItem key={subj} value={subj}>
                      {subj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Miniatura URL (opcional) */}
            <div className="space-y-1.5">
              <Label htmlFor="vthumb" className="text-xs font-bold text-slate-700">
                URL da Miniatura / Capa (Opcional)
              </Label>
              <Input
                id="vthumb"
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={thumbnailUrl}
                onChange={e => setThumbnailUrl(e.target.value)}
                className="h-11 rounded-xl text-sm"
              />
            </div>

            {/* Descrição */}
            <div className="space-y-1.5">
              <Label htmlFor="vdesc" className="text-xs font-bold text-slate-700">
                Descrição Pedagógica da Aula
              </Label>
              <Textarea
                id="vdesc"
                rows={3}
                placeholder="Explique o que os alunos vão aprender nesta aula..."
                value={videoDescription}
                onChange={e => setVideoDescription(e.target.value)}
                className="rounded-xl text-sm"
                required
              />
            </div>

            {/* Botões do Formulário */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={closeVideoModal}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  createVideoMutation.isPending ||
                  updateVideoMutation.isPending ||
                  isUploading
                }
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
              >
                {editingVideoId ? "Salvar Alterações" : "Publicar Videoaula"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
