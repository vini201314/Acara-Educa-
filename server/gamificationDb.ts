import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  achievements,
  challengeAnswers,
  dailyChallenges,
  studentStats,
  userAchievements,
  videos,
  watchedVideos,
} from "../drizzle/schema";

export const ACHIEVEMENT_SEED = [
  { slug: "primeira-aula", name: "Primeira Aula", description: "Conclua sua primeira aula.", requirementType: "lessons" as const, threshold: 1 },
  { slug: "primeiro-passo", name: "Primeiro Passo", description: "Conclua 5 aulas.", requirementType: "lessons" as const, threshold: 5 },
  { slug: "estudante-dedicado", name: "Estudante Dedicado", description: "Conclua 10 aulas.", requirementType: "lessons" as const, threshold: 10 },
  { slug: "foco-total", name: "Foco Total", description: "Conclua 25 aulas.", requirementType: "lessons" as const, threshold: 25 },
  { slug: "conhecimento-em-alta", name: "Conhecimento em Alta", description: "Alcance o nível 8.", requirementType: "level" as const, threshold: 8 },
  { slug: "lenda", name: "Lenda", description: "Alcance o nível 200.", requirementType: "level" as const, threshold: 200 },
];

export const RANKS = [
  [200, "Lenda do Acaraú Educa+"], [150, "Gênio do Conhecimento"], [120, "Mestre dos Estudos"],
  [100, "Mente Brilhante"], [80, "Aluno Formado"], [50, "Futuro Provedor"], [30, "Bom Futuro"],
  [15, "Excelente Estudante"], [8, "Estudante Dedicado!"], [4, "Bom Estudante"], [1, "Iniciante"],
] as const;

export function rankForLevel(level: number): string {
  return RANKS.find(([minimum]) => level >= minimum)?.[1] ?? "Iniciante";
}

export function levelForXp(xp: number): number {
  return Math.max(1, Math.floor(xp / 100) + 1);
}

export function xpForNextLevel(level: number): number {
  return level * 100;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function ensureGamificationSeed(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  for (const achievement of ACHIEVEMENT_SEED) {
    await db.insert(achievements).values(achievement).onDuplicateKeyUpdate({ set: { name: achievement.name, description: achievement.description, threshold: achievement.threshold } });
  }
}

async function ensureStats(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.insert(studentStats).values({ userId, xp: 0, level: 1 }).onDuplicateKeyUpdate({ set: { userId } });
  const rows = await db.select().from(studentStats).where(eq(studentStats.userId, userId)).limit(1);
  return rows[0]!;
}

export async function awardXp(userId: number, amount: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const current = await ensureStats(userId);
  const xp = current.xp + amount;
  const level = levelForXp(xp);
  await db.update(studentStats).set({ xp, level }).where(eq(studentStats.userId, userId));
  return { xp, level, previousLevel: current.level, leveledUp: level > current.level, rank: rankForLevel(level) };
}

export async function getGamificationProfile(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await ensureGamificationSeed();
  const stats = await ensureStats(userId);
  const watched = await db.select({ videoId: watchedVideos.videoId, subject: videos.subject }).from(watchedVideos).innerJoin(videos, eq(videos.id, watchedVideos.videoId)).where(eq(watchedVideos.userId, userId));
  const totalRows = await db.select({ count: sql<number>`COUNT(*)` }).from(videos);
  const totalLessons = Number(totalRows[0]?.count || 0);
  const unlockedRows = await db.select({ achievementId: userAchievements.achievementId, unlockedAt: userAchievements.unlockedAt }).from(userAchievements).where(eq(userAchievements.userId, userId));
  const achievementRows = await db.select().from(achievements).orderBy(achievements.threshold);
  const unlocked = new Map(unlockedRows.map(row => [row.achievementId, row.unlockedAt]));
  const lessonsBySubject = watched.reduce<Record<string, number>>((acc, row) => { acc[row.subject] = (acc[row.subject] || 0) + 1; return acc; }, {});
  const progressPercent = totalLessons > 0 ? Math.round((watched.length / totalLessons) * 100) : 0;
  return {
    xp: stats.xp,
    level: stats.level,
    rank: rankForLevel(stats.level),
    xpForNextLevel: xpForNextLevel(stats.level),
    xpIntoLevel: stats.xp % 100,
    lessonsCompleted: watched.length,
    totalLessons,
    progressPercent,
    lessonsBySubject,
    achievements: achievementRows.map(item => ({ ...item, unlocked: unlocked.has(item.id), unlockedAt: unlocked.get(item.id) ?? null })),
  };
}

export async function unlockEligibleAchievements(userId: number) {
  const db = await getDb();
  if (!db) return [];
  await ensureGamificationSeed();
  const profile = await getGamificationProfile(userId);
  const all = await db.select().from(achievements);
  const newlyUnlocked: typeof all = [];
  for (const achievement of all) {
    const qualifies = achievement.requirementType === "lessons" ? profile.lessonsCompleted >= achievement.threshold : profile.level >= achievement.threshold;
    if (!qualifies) continue;
    const existing = await db.select().from(userAchievements).where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievement.id))).limit(1);
    if (existing.length === 0) {
      await db.insert(userAchievements).values({ userId, achievementId: achievement.id });
      newlyUnlocked.push(achievement);
    }
  }
  return newlyUnlocked;
}

export async function recordLessonCompletion(userId: number, videoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const existing = await db.select().from(watchedVideos).where(and(eq(watchedVideos.userId, userId), eq(watchedVideos.videoId, videoId))).limit(1);
  if (existing.length > 0) {
    return { firstCompletion: false, xpAward: 0, leveledUp: false, unlockedAchievements: [], ...(await getGamificationProfile(userId)) };
  }
  try {
    await db.insert(watchedVideos).values({ userId, videoId });
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    if (message.includes("duplicate") || message.includes("er_dup_entry") || message.includes("unique")) {
      return { firstCompletion: false, xpAward: 0, leveledUp: false, unlockedAchievements: [], ...(await getGamificationProfile(userId)) };
    }
    throw error;
  }
  const xpResult = await awardXp(userId, 20);
  const unlocked = await unlockEligibleAchievements(userId);
  return { firstCompletion: true, xpAward: 20, ...xpResult, unlockedAchievements: unlocked, ...(await getGamificationProfile(userId)) };
}

export async function getTodayChallenge(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const today = todayKey();
  const rows = await db.select().from(dailyChallenges).where(and(eq(dailyChallenges.challengeDate, today), eq(dailyChallenges.active, true))).limit(1);
  if (rows.length === 0) return null;
  const answer = await db.select().from(challengeAnswers).where(and(eq(challengeAnswers.userId, userId), eq(challengeAnswers.challengeId, rows[0].id))).limit(1);
  const challenge = rows[0];
  return { id: challenge.id, question: challenge.question, options: [challenge.optionA, challenge.optionB, challenge.optionC, challenge.optionD], challengeDate: challenge.challengeDate, answered: answer.length > 0, answer: answer[0] ?? null };
}

export async function answerTodayChallenge(userId: number, challengeId: number, selectedOption: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const challenge = (await db.select().from(dailyChallenges).where(eq(dailyChallenges.id, challengeId)).limit(1))[0];
  if (!challenge || challenge.challengeDate !== todayKey() || !challenge.active) throw new Error("Este desafio não está disponível hoje.");
  const existing = await db.select().from(challengeAnswers).where(and(eq(challengeAnswers.userId, userId), eq(challengeAnswers.challengeId, challengeId))).limit(1);
  if (existing.length > 0) return { correct: existing[0].isCorrect, xpAward: 0, alreadyAnswered: true, leveledUp: false, ...(await getGamificationProfile(userId)) };
  const correct = selectedOption === challenge.correctOption;
  const xpAward = correct ? 30 : 0;
  try {
    await db.insert(challengeAnswers).values({ userId, challengeId, selectedOption, isCorrect: correct, xpAwarded: xpAward });
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    if (message.includes("duplicate") || message.includes("er_dup_entry") || message.includes("unique")) {
      const saved = await db.select().from(challengeAnswers).where(and(eq(challengeAnswers.userId, userId), eq(challengeAnswers.challengeId, challengeId))).limit(1);
      return { correct: saved[0]?.isCorrect ?? false, xpAward: 0, alreadyAnswered: true, leveledUp: false, ...(await getGamificationProfile(userId)) };
    }
    throw error;
  }
  const xpResult = xpAward ? await awardXp(userId, xpAward) : await ensureStats(userId);
  const unlocked = await unlockEligibleAchievements(userId);
  return { correct, xpAward, alreadyAnswered: false, ...("rank" in xpResult ? xpResult : { xp: xpResult.xp, level: xpResult.level, rank: rankForLevel(xpResult.level), leveledUp: false }), unlockedAchievements: unlocked, ...(await getGamificationProfile(userId)) };
}

export async function listChallenges() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dailyChallenges).orderBy(desc(dailyChallenges.challengeDate));
}

export async function createChallenge(data: { question: string; options: string[]; correctOption: number; challengeDate: string; createdById: number }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.insert(dailyChallenges).values({ question: data.question, optionA: data.options[0], optionB: data.options[1], optionC: data.options[2], optionD: data.options[3], correctOption: data.correctOption, challengeDate: data.challengeDate, createdById: data.createdById });
  const rows = await db.select().from(dailyChallenges).where(eq(dailyChallenges.challengeDate, data.challengeDate)).limit(1);
  return rows[0]!;
}

export async function updateChallenge(id: number, data: { question: string; options: string[]; correctOption: number; challengeDate: string; active: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.update(dailyChallenges).set({ question: data.question, optionA: data.options[0], optionB: data.options[1], optionC: data.options[2], optionD: data.options[3], correctOption: data.correctOption, challengeDate: data.challengeDate, active: data.active }).where(eq(dailyChallenges.id, id));
  const rows = await db.select().from(dailyChallenges).where(eq(dailyChallenges.id, id)).limit(1);
  return rows[0]!;
}

export async function deleteChallenge(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.delete(challengeAnswers).where(eq(challengeAnswers.challengeId, id));
  await db.delete(dailyChallenges).where(eq(dailyChallenges.id, id));
}
