import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VideosPage from "./pages/VideosPage";
import VideoDetailPage from "./pages/VideoDetailPage";
import SuggestionsPage from "./pages/SuggestionsPage";
import ProfilePage from "./pages/ProfilePage";
import AboutPage from "./pages/AboutPage";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      {/* Rota Inicial */}
      <Route path="/" component={Home} />

      {/* Autenticação */}
      <Route path="/login" component={Login} />
      <Route path="/cadastro" component={Register} />

      {/* Área de Vídeos */}
      <Route path="/videos" component={VideosPage} />
      <Route path="/videos/:id" component={VideoDetailPage} />

      {/* Sugestões do Aluno */}
      <Route path="/sugestoes" component={SuggestionsPage} />

      {/* Perfil do Aluno */}
      <Route path="/perfil" component={ProfilePage} />

      {/* Sobre o Projeto */}
      <Route path="/sobre" component={AboutPage} />

      {/* Painel Administrativo */}
      <Route path="/admin" component={AdminDashboard} />

      {/* Fallback 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-right" richColors />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
