import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Target,
  Sparkles,
  Heart,
  BookOpen,
  CheckCircle2,
  Users,
  ShieldCheck,
  Video,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Hero Sobre */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/20">
              <GraduationCap className="w-9 h-9" />
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Iniciativa Educacional Acessível
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Sobre o Acaraú Educa+
            </h1>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Uma plataforma idealizada para democratizar o reforço escolar dos estudantes através de tecnologia amigável, videoaulas dinâmicas e participação ativa da comunidade escolar.
            </p>
          </div>

          {/* Pilares da Plataforma */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Nossa Missão</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tornar o aprendizado escolar simples, gratuito e acessível para qualquer aluno, independentemente do dispositivo ou local onde esteja estudando.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Voz do Aluno</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Acreditamos na escuta atenta: o sistema de sugestões garante que os conteúdos publicados resolvam dúvidas reais do cotidiano de sala de aula.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-yellow-100 text-yellow-800 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Ambiente Seguro</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Segurança rigorosa com hash de senhas, permissões auditadas no servidor e controle total para a coordenação pedagógica.
              </p>
            </div>
          </div>

          {/* Destaque das Matérias */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-emerald-100 shadow-sm space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Disciplinas Atendidas
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              {[
                { name: "Matemática", desc: "Cálculos e raciocínio lógico" },
                { name: "Português", desc: "Gramática, redação e interpretação" },
                { name: "Ciências", desc: "Biologia, química e física básica" },
                { name: "História", desc: "Fatos marcantes e sociedade" },
                { name: "Geografia", desc: "Espaço geográfico e geopolítica" },
                { name: "Inglês", desc: "Vocabulário e conversação" },
                { name: "Educação Física", desc: "Saúde, esportes e bem-estar" },
                { name: "Outras", desc: "Temas interdisciplinares" },
              ].map(item => (
                <div
                  key={item.name}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between"
                >
                  <span className="font-bold text-slate-900">{item.name}</span>
                  <span className="text-xs text-slate-500 mt-1">{item.desc}</span>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-600">
                Pronto para começar seus estudos hoje mesmo?
              </p>
              <div className="flex gap-3">
                <Link href="/videos">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold">
                    <Video className="w-4 h-4 mr-2" />
                    Assistir Aulas
                  </Button>
                </Link>
                <Link href="/cadastro">
                  <Button variant="outline" className="rounded-xl font-bold">
                    Cadastrar-se
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
