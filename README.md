# Acaraú Educa+ 🎓

**Acaraú Educa+** é uma plataforma completa, moderna, responsiva e inclusiva de reforço escolar, desenvolvida para proporcionar aos estudantes acesso fácil, gratuito e de alta qualidade a videoaulas, organização por disciplinas, acompanhamento de progresso e participação colaborativa através de sugestões de novos temas.

---

## 🌟 Funcionalidades Principais

### Para os Alunos
- **Página Inicial Dinâmica**: Apresenta os pilares pedagógicos (*Conteúdos educativos*, *Videoaulas*, *Sugestões dos alunos* e *Aprendizado acessível*), atalhos rápidos e aulas em destaque.
- **Autenticação Real com ID Único**: Cada estudante se cadastra com seu nome completo e senha, recebendo automaticamente um ID exclusivo no formato `#001, #002, #003...`.
- **Catálogo de Videoaulas**: Busca em tempo real por termos no título ou descrição e filtros por matérias escolares (*Matemática, Português, Ciências, História, Geografia, Inglês, Educação Física e Outras*).
- **Player Inteligente e Registro de Progresso**: Compatibilidade total com vídeos do YouTube e arquivos MP4/WebM enviados diretamente. O sistema marca automaticamente as aulas assistidas e contabiliza o progresso no perfil.
- **Canal de Sugestões Participativo**: Os alunos podem sugerir tópicos de aulas que gostariam de aprender, enviando título, disciplina e descrição detalhada.
- **Perfil do Estudante**: Exibe nome, ID único, data de cadastro, total de videoaulas concluídas e opção de encerramento seguro de sessão.
- **Página Institucional "Sobre o Projeto"**: Apresenta a missão, visão comunitária e a grade de disciplinas atendidas.
- **Página 404 Personalizada**: Navegação amigável caso uma página não seja encontrada.

### Para a Gestão e Professores (Painel Administrativo `/admin`)
- **Proteção Estrita no Servidor**: Apenas usuários autenticados com privilégios de administrador ou administrador geral podem acessar `/admin`. Alunos comuns são bloqueados tanto no backend (via procedimentos tRPC) quanto no frontend.
- **Gestão Completa de Videoaulas**:
  - Inclusão, edição e exclusão de aulas.
  - **Seletor visual do método de adição**: `🔗 Usar URL` (YouTube e links externos) ou `📁 Enviar arquivo` (upload direto de vídeo com barra de progresso visual).
- **Gestão de Sugestões dos Alunos**:
  - Visualização de todas as sugestões enviadas com nome completo e ID único do aluno remetente.
  - Marcação de sugestões como analisadas e opção de exclusão.
- **Gestão de Administradores por ID (Exclusivo Administrador Geral)**:
  - Adição de novos administradores inserindo o ID único do estudante (ex: `#002`).
  - Remoção de privilégios de administradores comuns.
  - Proteção de segurança: o Administrador Geral não pode remover a própria permissão.
- **Administrador Geral Inicial**:
  - **Nome**: `Paulo Vinicius do Nascimento Santos`
  - **Senha inicial**: `vini2013.` (armazenada com hash scrypt e nunca visível).

---

## 🎨 Identidade Visual e Design

- **Cores Oficiais**: Branco limpo, Verde escolar (`#15803d` / `#16a34a`) e Amarelo ouro (`#eab308` / `#facc15`).
- **Tipografia**: *Outfit* para títulos escolares elegantes e *Plus Jakarta Sans* para leitura confortável.
- **Interface Responsiva**: Adaptada para celulares, tablets e computadores, com sombras suaves, bordas arredondadas e ícones educativos intuitivos.

---

## 🛠 Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React, Wouter (roteamento leve), Radix UI / Shadcn UI, Sonner (notificações).
- **Backend**: Node.js com Express, tRPC 11 (tipagem ponta a ponta), Zod (validação estrita de esquemas).
- **Banco de Dados**: MySQL / TiDB com Drizzle ORM.
- **Armazenamento de Vídeos e Arquivos**: AWS S3 / Forge Storage com links assinados e URLs otimizadas.
- **Segurança**: Hashing de senhas nativo com `scrypt` e verificação em tempo constante (`timingSafeEqual`), tokens de sessão JWT assinados via `jose` com cookies HTTP-only e sameSite.

---

## 🚀 Como Executar Localmente ou no Replit

1. **Instale as dependências**:
   ```bash
   pnpm install
   ```

2. **Configure as variáveis de ambiente** no seu arquivo `.env`:
   ```env
   DATABASE_URL=mysql://usuario:senha@host:porta/banco
   JWT_SECRET=seu_segredo_jwt_aqui
   ```

3. **Gere e aplique as migrações do banco**:
   ```bash
   pnpm drizzle-kit generate
   pnpm drizzle-kit migrate
   ```

4. **Popule os vídeos iniciais (Opcional)**:
   ```bash
   npx tsx server/seedVideos.ts
   ```

5. **Inicie o servidor de desenvolvimento**:
   ```bash
   pnpm dev
   ```

6. **Para compilar para produção**:
   ```bash
   pnpm build
   pnpm start
   ```

---

## 📄 Licença

Este projeto é desenvolvido para fins educacionais e comunitários em benefício dos estudantes de Acaraú.
