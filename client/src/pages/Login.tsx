import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GraduationCap,
  LogIn,
  KeyRound,
  User,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: data => {
      utils.auth.me.invalidate();
      toast.success(`Bem-vindo(a) de volta, ${data.user.name.split(" ")[0]}!`);
      if (data.user.role === "admin" || data.user.role === "superadmin") {
        setLocation("/admin");
      } else {
        setLocation("/videos");
      }
    },
    onError: error => {
      setErrorMessage(error.message || "Erro ao realizar login.");
      toast.error(error.message || "Nome ou senha incorretos.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Por favor, preencha seu nome completo.");
      return;
    }
    if (!password) {
      setErrorMessage("Por favor, preencha sua senha.");
      return;
    }

    loginMutation.mutate({
      name: name.trim(),
      password,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Card de Login */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-emerald-100 shadow-xl shadow-emerald-950/5">
            {/* Cabeçalho */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-emerald-600/30">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Acesse sua conta
              </h1>
              <p className="text-slate-500 text-sm mt-1.5">
                Entre com seu nome completo e senha para continuar estudando
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nome completo */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-bold text-slate-700">
                  Nome completo
                </Label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ex: Paulo Vinicius do Nascimento Santos"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="pl-11 h-12 rounded-xl border-slate-200 focus-visible:ring-emerald-500 text-sm"
                    required
                    disabled={loginMutation.isPending}
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-bold text-slate-700">
                  Senha
                </Label>
                <div className="relative">
                  <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-11 h-12 rounded-xl border-slate-200 focus-visible:ring-emerald-500 text-sm"
                    required
                    disabled={loginMutation.isPending}
                  />
                </div>
              </div>

              {/* Botão Entrar */}
              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md shadow-emerald-600/20 mt-2"
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">🌀</span> Entrando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <LogIn className="w-5 h-5" />
                    Entrar
                  </span>
                )}
              </Button>
            </form>

            {/* Dica de Acesso Geral */}
            <div className="mt-6 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs">
              <span className="font-bold block mb-0.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Administrador Inicial configurado
              </span>
              <span>
                Para acessar como administrador geral, use o nome <strong>Paulo Vinicius do Nascimento Santos</strong> e a senha padrão <strong>vini2013.</strong>
              </span>
            </div>

            {/* Link para Cadastro */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-600">
                Ainda não tem conta?{" "}
                <Link
                  href="/cadastro"
                  className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  Cadastre-se gratuitamente
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
