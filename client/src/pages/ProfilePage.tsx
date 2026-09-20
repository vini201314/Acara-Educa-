import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  User,
  GraduationCap,
  Calendar,
  CheckCircle2,
  LogOut,
  Shield,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const { data: user, isLoading } = trpc.auth.me.useQuery();

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success("Você saiu da conta.");
      setLocation("/");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 max-w-2xl mx-auto w-full p-8 space-y-4">
          <div className="h-40 bg-slate-200 animate-pulse rounded-3xl" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto flex flex-col items-center justify-center p-6 text-center">
          <User className="w-16 h-16 text-slate-300 mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Acesso ao Perfil</h1>
          <p className="text-slate-500 text-sm mt-2 mb-6">
            Você precisa estar conectado à sua conta para visualizar seus dados de aluno e histórico.
          </p>
          <div className="flex gap-3">
            <Link href="/login">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                Entrar
              </Button>
            </Link>
            <Link href="/cadastro">
              <Button variant="outline" className="rounded-xl">
                Cadastrar
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Card Principal do Perfil */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-green-500 to-amber-500" />

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-slate-100">
              {/* Avatar com Inicial */}
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center font-extrabold text-3xl shadow-lg shadow-emerald-600/20 shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div className="text-center sm:text-left space-y-2 flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {user.name}
                  </h1>
                  {user.isGeneralAdmin ? (
                    <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full border border-amber-300">
                      Administrador Geral
                    </span>
                  ) : user.role === "admin" ? (
                    <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300">
                      Administrador
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
                      Aluno
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm">
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                    ID: {user.studentCode}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500 text-xs flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Membro desde: {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>

            {/* Estatísticas de Progresso do Aluno */}
            <div className="py-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900">
                    {user.watchedCount}
                  </span>
                  <p className="text-xs text-slate-600 font-semibold">
                    Vídeos assistidos na plataforma
                  </p>
                </div>
              </div>

              <div className="bg-amber-50/60 rounded-2xl p-5 border border-amber-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-amber-900">Status</span>
                  <p className="text-base font-bold text-slate-900">
                    {user.watchedCount > 0 ? "Em Aprendizado Ativo" : "Pronto para Começar"}
                  </p>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link href="/videos" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Explorar videoaulas
                </Button>
              </Link>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {(user.role === "admin" || user.role === "superadmin") && (
                  <Link href="/admin" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl font-semibold"
                    >
                      <Shield className="w-4 h-4 mr-2 text-amber-600" />
                      Painel Admin
                    </Button>
                  </Link>
                )}

                <Button
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  variant="outline"
                  className="w-full sm:w-auto border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl font-semibold"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair da Conta
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
