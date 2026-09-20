import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 text-center shadow-lg shadow-emerald-950/5 space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-3xl font-black">
            404
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900">
              Página não encontrada
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed">
              Ops! Parece que o conteúdo ou a aula que você estava procurando não existe ou mudou de endereço.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/" className="flex-1">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold">
                <Home className="w-4 h-4 mr-2" />
                Ir para o Início
              </Button>
            </Link>
            <Link href="/videos" className="flex-1">
              <Button variant="outline" className="w-full rounded-xl font-bold">
                Ver Videoaulas
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
