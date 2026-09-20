import { useState } from "react";
import { Link } from "wouter";
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
  Lightbulb,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
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

export default function SuggestionsPage() {
  const { data: user } = trpc.auth.me.useQuery();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [successSent, setSuccessSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const createSuggestionMutation = trpc.suggestions.create.useMutation({
    onSuccess: () => {
      setSuccessSent(true);
      setTitle("");
      setDescription("");
      setSubject("");
      toast.success("Sugestão enviada com sucesso! Agradecemos sua colaboração.");
    },
    onError: err => {
      setErrorMessage(err.message || "Não foi possível enviar a sugestão.");
      toast.error(err.message || "Erro no envio.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!user) {
      toast.error("Você precisa estar logado para enviar sugestões.");
      return;
    }

    if (!title.trim()) {
      setErrorMessage("Por favor, informe o título da sugestão.");
      return;
    }
    if (!subject) {
      setErrorMessage("Por favor, selecione uma matéria.");
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setErrorMessage("Por favor, detalhe sua sugestão com pelo menos 10 caracteres.");
      return;
    }

    createSuggestionMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      subject,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-4">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              Canal Participativo do Aluno
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Sugira conteúdos e novas videoaulas
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mt-2">
              Qual tema ou dúvida escolar você gostaria que os professores gravassem?
              Preencha o formulário abaixo para enviar sua ideia diretamente aos administradores da plataforma.
            </p>
          </div>

          {!user ? (
            <div className="bg-white rounded-3xl p-8 border border-emerald-100 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <Lightbulb className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Identificação necessária
              </h2>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                Para que os administradores saibam quem enviou a sugestão (com seu nome e ID de aluno), é necessário entrar na sua conta.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Link href="/login">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                    Entrar na Conta
                  </Button>
                </Link>
                <Link href="/cadastro">
                  <Button variant="outline" className="rounded-xl">
                    Criar Conta
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm">
              {successSent ? (
                <div className="py-8 text-center space-y-4 animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Sugestão enviada com sucesso!
                  </h3>
                  <p className="text-slate-600 text-sm max-w-md mx-auto">
                    Sua ideia foi encaminhada para análise dos administradores com seu nome (<strong>{user.name}</strong>) e ID (<strong>{user.studentCode}</strong>).
                  </p>
                  <Button
                    onClick={() => setSuccessSent(false)}
                    variant="outline"
                    className="rounded-xl mt-4"
                  >
                    Enviar outra sugestão
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Identificação do Aluno */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-emerald-900 font-medium">
                      Enviando como: <strong>{user.name}</strong>
                    </span>
                    <span className="font-mono font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                      ID {user.studentCode}
                    </span>
                  </div>

                  {errorMessage && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Título */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-bold text-slate-800">
                      Título da Sugestão
                    </Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="Ex: Frações com denominadores diferentes"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="h-12 rounded-xl text-sm"
                      required
                    />
                  </div>

                  {/* Matéria */}
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-bold text-slate-800">
                      Matéria / Disciplina
                    </Label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger id="subject" className="h-12 rounded-xl text-sm">
                        <SelectValue placeholder="Selecione a matéria correspondente" />
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

                  {/* Descrição */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-bold text-slate-800">
                      Descrição e Detalhes
                    </Label>
                    <Textarea
                      id="description"
                      rows={5}
                      placeholder="Explique o que você tem mais dificuldade nesse assunto e quais pontos gostaria que a videoaula abordasse..."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="rounded-xl text-sm leading-relaxed"
                      required
                    />
                  </div>

                  {/* Botão Enviar */}
                  <Button
                    type="submit"
                    disabled={createSuggestionMutation.isPending}
                    className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md shadow-emerald-600/20"
                  >
                    {createSuggestionMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">🌀</span> Enviando...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Send className="w-5 h-5" />
                        Enviar Minha Sugestão
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
