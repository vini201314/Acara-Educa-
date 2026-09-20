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
  UserPlus,
  KeyRound,
  User,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function Register() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: data => {
      utils.auth.me.invalidate();
      toast.success(
        `Conta criada com sucesso! Seu ID de estudante é ${data.user.studentCode}.`
      );
      setLocation("/videos");
    },
    onError: error => {
      setErrorMessage(error.message || "Erro ao realizar cadastro.");
      toast.error(error.message || "Não foi possível cadastrar.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Por favor, preencha seu nome completo.");
      return;
    }
    if (name.trim().length < 3) {
      setErrorMessage("O nome completo deve conter pelo menos 3 caracteres.");
      return;
    }
    if (!password) {
      setErrorMessage("Por favor, informe uma senha.");
      return;
    }
    if (password.length < 4) {
      setErrorMessage("A senha deve conter no mínimo 4 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem. Digite novamente com atenção.");
      return;
    }

    registerMutation.mutate({
      name: name.trim(),
      password,
      confirmPassword,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Card de Cadastro */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-emerald-100 shadow-xl shadow-emerald-950/5">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-emerald-600/30">
                <UserPlus className="w-8 h-8" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Criar conta de Aluno
              </h1>
              <p className="text-slate-500 text-sm mt-1.5">
                Cadastre-se para receber seu ID único (#001, #002...) e registrar seu progresso
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome completo */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-bold text-slate-700">
                  Nome completo
                </Label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="pl-11 h-12 rounded-xl border-slate-200 focus-visible:ring-emerald-500 text-sm"
                    required
                    disabled={registerMutation.isPending}
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-bold text-slate-700">
                  Senha
                </Label>
                <div className="relative">
                  <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Crie sua senha segura"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-11 h-12 rounded-xl border-slate-200 focus-visible:ring-emerald-500 text-sm"
                    required
                    disabled={registerMutation.isPending}
                  />
                </div>
              </div>

              {/* Confirmar senha */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-bold text-slate-700">
                  Confirmar senha
                </Label>
                <div className="relative">
                  <ShieldCheck className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repita a mesma senha"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="pl-11 h-12 rounded-xl border-slate-200 focus-visible:ring-emerald-500 text-sm"
                    required
                    disabled={registerMutation.isPending}
                  />
                </div>
              </div>

              {/* Informação sobre segurança e ID */}
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 space-y-1 border border-slate-100">
                <p className="flex items-center gap-1.5 font-medium text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ID único gerado automaticamente (#001, #002...)
                </p>
                <p className="flex items-center gap-1.5 font-medium text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Senhas protegidas com criptografia de hash seguro
                </p>
              </div>

              {/* Botão Cadastrar */}
              <Button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md shadow-emerald-600/20 mt-2"
              >
                {registerMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">🌀</span> Cadastrando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Criar Minha Conta
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-600">
                Já possui uma conta?{" "}
                <Link
                  href="/login"
                  className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  Fazer login
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
