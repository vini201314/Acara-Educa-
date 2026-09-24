import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Code2,
  GraduationCap,
  HeartHandshake,
  Megaphone,
  School,
  Sparkles,
  Users,
} from "lucide-react";

type CreditSection = {
  title: string;
  icon: typeof Code2;
  tone: string;
  people: { name: string; role?: string }[];
};

const creditSections: CreditSection[] = [
  {
    title: "Desenvolvimento e Programação",
    icon: Code2,
    tone: "emerald",
    people: [{ name: "Vinicius Santos", role: "Desenvolvimento completo da plataforma" }],
  },
  {
    title: "Direção Escolar",
    icon: School,
    tone: "amber",
    people: [{ name: "Sandra Natércia", role: "Diretora da escola" }],
  },
  {
    title: "Coordenação Pedagógica",
    icon: GraduationCap,
    tone: "yellow",
    people: [{ name: "Cida", role: "Coordenadora Pedagógica" }],
  },
  {
    title: "Supervisão",
    icon: HeartHandshake,
    tone: "green",
    people: [{ name: "Liduina", role: "Supervisão do projeto" }],
  },
  {
    title: "Administração e Produção de Conteúdo",
    icon: Users,
    tone: "emerald",
    people: [
      { name: "Karinny Moura" },
      { name: "Gabriel Soares" },
      { name: "Yago Aragão" },
      { name: "Myrela Santos" },
      { name: "Letícia Pinho" },
      { name: "Eduarda Pereira" },
      { name: "Vinicius Santos" },
      { name: "Giovanni Marques" },
      { name: "Pedro Castro" },
    ],
  },
];

const toneClasses: Record<string, { icon: string; border: string; badge: string }> = {
  emerald: { icon: "bg-emerald-100 text-emerald-700", border: "border-emerald-100", badge: "bg-emerald-50 text-emerald-800" },
  green: { icon: "bg-green-100 text-green-700", border: "border-green-100", badge: "bg-green-50 text-green-800" },
  amber: { icon: "bg-amber-100 text-amber-700", border: "border-amber-100", badge: "bg-amber-50 text-amber-800" },
  yellow: { icon: "bg-yellow-100 text-yellow-800", border: "border-yellow-100", badge: "bg-yellow-50 text-yellow-800" },
};

export default function CreditsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <section className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white px-6 py-10 text-center shadow-sm sm:px-12 sm:py-14">
            <div className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-amber-100/60 blur-3xl" />
            <div className="absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-emerald-100/70 blur-3xl" />
            <div className="relative">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white shadow-lg shadow-emerald-600/20">
                <Megaphone className="h-8 w-8" />
              </div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3.5 py-1 text-xs font-bold text-amber-900">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                Equipe Acaraú Educa+
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
                Créditos — Acaraú Educa+
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Esta plataforma é resultado do trabalho conjunto de pessoas que acreditam em uma educação mais acessível, participativa e conectada.
              </p>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {creditSections.map(section => {
              const Icon = section.icon;
              const colors = toneClasses[section.tone];
              return (
                <article key={section.title} className={`rounded-3xl border bg-white p-6 shadow-xs sm:p-7 ${colors.border}`}>
                  <div className="mb-5 flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${colors.icon}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Créditos</p>
                      <h2 className="mt-1 text-lg font-extrabold text-slate-900 sm:text-xl">{section.title}</h2>
                    </div>
                  </div>
                  <div className={`space-y-2 rounded-2xl p-3 ${colors.badge}`}>
                    {section.people.map(person => (
                      <div key={`${section.title}-${person.name}`} className="flex flex-col gap-0.5 rounded-xl bg-white/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <span className="font-bold text-slate-900">{person.name}</span>
                        {person.role && <span className="text-xs font-medium text-slate-600 sm:text-right">{person.role}</span>}
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </section>

          <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xs sm:flex-row sm:text-left">
            <div>
              <p className="font-bold text-slate-900">Obrigado a todos que fazem parte deste projeto.</p>
              <p className="mt-1 text-sm text-slate-500">Juntos, aprendemos mais e estudamos melhor.</p>
            </div>
            <Link href="/">
              <Button variant="outline" className="rounded-xl border-emerald-200 font-bold text-emerald-700 hover:bg-emerald-50">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao início
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
