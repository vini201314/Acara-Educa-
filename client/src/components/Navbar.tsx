import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  BookOpen,
  Video,
  Lightbulb,
  User,
  Shield,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  Info,
} from "lucide-react";
import { toast } from "sonner";

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data: user, isLoading } = trpc.auth.me.useQuery();

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success("Você saiu da sua conta com sucesso!");
      setLocation("/");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { href: "/", label: "Início", icon: BookOpen },
    { href: "/videos", label: "Vídeos", icon: Video },
    { href: "/sugestoes", label: "Sugestões", icon: Lightbulb },
    { href: "/sobre", label: "Sobre o Projeto", icon: Info },
  ];

  const isCurrent = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-100 bg-white/95 backdrop-blur shadow-xs">
      {/* Top Banner de Identidade Escolar */}
      <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-amber-500 text-white text-xs py-1 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between font-medium">
          <span className="flex items-center gap-1.5">
            <span>✨</span> Plataforma Oficial de Reforço Escolar para Alunos
          </span>
          {user && (
            <span className="bg-white/20 px-2 py-0.5 rounded-full font-mono text-[11px]">
              ID: {user.studentCode}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo e Nome */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                Acaraú <span className="text-emerald-600">Educa</span>
                <span className="text-amber-500">+</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium -mt-1 tracking-wide">
                Reforço Escolar Acessível
              </span>
            </div>
          </Link>

          {/* Links Desktop */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map(link => {
              const Icon = link.icon;
              const active = isCurrent(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    active
                      ? "bg-emerald-50 text-emerald-800 shadow-xs"
                      : "text-slate-600 hover:text-emerald-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-emerald-600" : "text-slate-400"}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Ações de Usuário / Admin Desktop */}
          <div className="hidden md:flex items-center gap-2.5">
            {isLoading ? (
              <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-xl" />
            ) : user ? (
              <div className="flex items-center gap-2">
                {/* Botão Admin (visível para administradores) */}
                {(user.role === "admin" || user.role === "superadmin") && (
                  <Link href="/admin">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-amber-300 text-amber-800 bg-amber-50/60 hover:bg-amber-100 hover:text-amber-900 font-semibold gap-1.5 rounded-xl shadow-xs"
                    >
                      <Shield className="w-4 h-4 text-amber-600" />
                      Painel Admin
                    </Button>
                  </Link>
                )}

                {/* Perfil do Aluno */}
                <Link href="/perfil">
                  <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-emerald-50 hover:border-emerald-200 transition-all cursor-pointer">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                        {user.name.split(" ")[0]}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 font-semibold leading-none">
                        {user.studentCode}
                      </span>
                    </div>
                  </div>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Sair da conta"
                  className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl gap-1.5"
                  >
                    <LogIn className="w-4 h-4" />
                    Entrar
                  </Button>
                </Link>
                <Link href="/cadastro">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl gap-1.5 shadow-sm shadow-emerald-600/20"
                  >
                    <UserPlus className="w-4 h-4" />
                    Criar Conta
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Botão Menu Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Alternar menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Aberto Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="space-y-1">
            {navLinks.map(link => {
              const Icon = link.icon;
              const active = isCurrent(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                    active
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? "text-emerald-600" : "text-slate-400"}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {user ? (
              <>
                <Link
                  href="/perfil"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 text-slate-800"
                >
                  <User className="w-5 h-5 text-emerald-600" />
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{user.name}</span>
                    <span className="text-xs text-emerald-600 font-mono font-medium">
                      Código do Aluno: {user.studentCode}
                    </span>
                  </div>
                </Link>

                {(user.role === "admin" || user.role === "superadmin") && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-amber-50 text-amber-900 font-semibold text-sm border border-amber-200"
                  >
                    <Shield className="w-5 h-5 text-amber-600" />
                    Painel Administrativo
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold text-sm transition-colors text-left"
                >
                  <LogOut className="w-5 h-5" />
                  Sair da Conta
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full rounded-xl font-semibold">
                    Entrar
                  </Button>
                </Link>
                <Link href="/cadastro" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold">
                    Cadastrar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
