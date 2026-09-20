import { createVideo, ensureGeneralAdmin, listVideos } from "./db";

const INITIAL_VIDEOS = [
  {
    title: "Frações e Operações Básicas: Soma e Subtração",
    description: "Aprenda passo a passo como somar e subtrair frações com denominadores iguais e diferentes utilizando o MMC de maneira visual e simples.",
    subject: "Matemática",
    sourceType: "url" as const,
    videoUrl: "https://www.youtube.com/watch?v=kY3jXl_d4V8",
    thumbnailUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Concordância Verbal e Nominal sem Complicação",
    description: "Regras práticas para nunca mais errar a concordância nas provas escolares e na redação. Exemplos claros do cotidiano.",
    subject: "Português",
    sourceType: "url" as const,
    videoUrl: "https://www.youtube.com/watch?v=0k2xQd9ZgR0",
    thumbnailUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "O Ciclo da Água e a Preservação dos Recursos Hídricos",
    description: "Entenda a evaporação, condensação, precipitação e a importância vital de proteger os mananciais e rios da nossa região.",
    subject: "Ciências",
    sourceType: "url" as const,
    videoUrl: "https://www.youtube.com/watch?v=0_c7S17R-h0",
    thumbnailUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "História e Colonização do Litoral Cearense",
    description: "Uma viagem no tempo sobre as raízes históricas, os povos originários e o desenvolvimento cultural do município de Acaraú e do Ceará.",
    subject: "História",
    sourceType: "url" as const,
    videoUrl: "https://www.youtube.com/watch?v=7uB0g4hY9e8",
    thumbnailUrl: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Clima, Relevo e Biomas Brasileiros: A Caatinga",
    description: "Características marcantes do clima semiárido, adaptações da fauna e flora e a riqueza ecológica da Caatinga.",
    subject: "Geografia",
    sourceType: "url" as const,
    videoUrl: "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Simple Present e Rotina Diária em Inglês",
    description: "Como falar sobre seu dia a dia, hobbies e hábitos em inglês de forma natural e com pronúncia correta.",
    subject: "Inglês",
    sourceType: "url" as const,
    videoUrl: "https://www.youtube.com/watch?v=L9AWrJnhsRI",
    thumbnailUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80",
  },
];

async function seed() {
  const admin = await ensureGeneralAdmin();
  if (!admin) {
    console.error("Erro ao carregar admin geral");
    process.exit(1);
  }

  const existingVideos = await listVideos();
  if (existingVideos.length === 0) {
    for (const v of INITIAL_VIDEOS) {
      await createVideo({
        ...v,
        createdById: admin.id,
        createdByName: admin.name,
      });
      console.log("Vídeo criado:", v.title);
    }
  } else {
    console.log("Vídeos já cadastrados:", existingVideos.length);
  }
}

seed().then(() => {
  console.log("Seed finalizado com sucesso!");
  process.exit(0);
}).catch(err => {
  console.error("Erro no seed:", err);
  process.exit(1);
});
