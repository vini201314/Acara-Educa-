import { Link } from "wouter";
import { GraduationCap, Heart, BookOpen, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Coluna 1: Sobre */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Acaraú <span className="text-emerald-600">Educa</span>
                <span className="text-amber-500">+</span>
              </span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed max-w-md">
              O Acaraú Educa+ é uma plataforma de reforço escolar criada para ajudar
              alunos a aprender de forma simples, gratuita e acessível através de
              videoaulas qualificadas, sugestões participativas e acompanhamento de estudos.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Aprenda mais. Estude melhor.
            </div>
          </div>

          {/* Coluna 2: Navegação */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Navegação
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Página Inicial
                </Link>
              </li>
              <li>
                <Link href="/videos" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Todas as Videoaulas
                </Link>
              </li>
              <li>
                <Link href="/sugestoes" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Enviar Sugestão
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Sobre o Projeto
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Matérias */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Disciplinas
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Matemática",
                "Português",
                "Ciências",
                "História",
                "Geografia",
                "Inglês",
                "Educação Física",
              ].map(subject => (
                <Link
                  key={subject}
                  href={`/videos?subject=${encodeURIComponent(subject)}`}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-xs font-medium text-slate-600 transition-colors"
                >
                  {subject}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Acaraú Educa+. Todos os direitos reservados.
          </p>
          <p className="flex items-center gap-1">
            Desenvolvido com carinho para os estudantes de Acaraú e região
          </p>
        </div>
      </div>
    </footer>
  );
}
