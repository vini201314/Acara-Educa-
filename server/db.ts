import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertSuggestion,
  InsertUser,
  InsertVideo,
  InsertWatchedVideo,
  Suggestion,
  User,
  Video,
  WatchedVideo,
  suggestions,
  users,
  videos,
  watchedVideos,
} from "../drizzle/schema";
import { hashPassword, formatStudentCode } from "./password";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export const GENERAL_ADMIN = {
  name: "Paulo Vinicius do Nascimento Santos",
  initialPassword: "vini2013.",
};

export async function ensureGeneralAdmin(): Promise<User | null> {
  const db = await getDb();
  if (!db) return null;

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.name, GENERAL_ADMIN.name))
    .limit(1);

  if (existing.length > 0) {
    const user = existing[0];
    if (!user.isGeneralAdmin || user.role !== "superadmin") {
      await db
        .update(users)
        .set({
          isGeneralAdmin: true,
          role: "superadmin",
        })
        .where(eq(users.id, user.id));
      user.isGeneralAdmin = true;
      user.role = "superadmin";
    }
    return user;
  }

  // Obter próximo ID numérico para o código do aluno
  const nextCode = await getNextStudentCode();
  const passwordHash = hashPassword(GENERAL_ADMIN.initialPassword);
  const openId = `usr_${Date.now()}_001`;

  await db.insert(users).values({
    studentCode: nextCode,
    name: GENERAL_ADMIN.name,
    passwordHash,
    role: "superadmin",
    isGeneralAdmin: true,
    openId,
    loginMethod: "credentials",
  });

  const created = await db
    .select()
    .from(users)
    .where(eq(users.name, GENERAL_ADMIN.name))
    .limit(1);

  return created[0] ?? null;
}

export async function getNextStudentCode(): Promise<string> {
  const db = await getDb();
  if (!db) return "#001";

  const rows = await db
    .select({
      maxId: sql<number>`COALESCE(MAX(id), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(users);

  const highest = Number(rows[0]?.maxId || 0);
  const count = Number(rows[0]?.count || 0);
  const nextNum = Math.max(highest + 1, count + 1, 1);
  return formatStudentCode(nextNum);
}

export async function getUserById(id: number): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserByName(name: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const cleanName = name.trim();
  const result = await db
    .select()
    .from(users)
    .where(sql`LOWER(TRIM(${users.name})) = LOWER(${cleanName})`)
    .limit(1);
  return result[0];
}

export async function getUserByStudentCode(code: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const cleanCode = code.trim().toUpperCase();
  const result = await db
    .select()
    .from(users)
    .where(sql`UPPER(TRIM(${users.studentCode})) = ${cleanCode}`)
    .limit(1);
  return result[0];
}

export async function createUser(data: {
  name: string;
  password: string;
}): Promise<User> {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");

  const studentCode = await getNextStudentCode();
  const passwordHash = hashPassword(data.password);
  const openId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  await db.insert(users).values({
    studentCode,
    name: data.name.trim(),
    passwordHash,
    role: "user",
    isGeneralAdmin: false,
    openId,
    loginMethod: "credentials",
  });

  const created = await getUserByStudentCode(studentCode);
  if (!created) throw new Error("Erro ao criar usuário");
  return created;
}

export async function updateLastSignedIn(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, id));
}

export async function upsertUser(user: Partial<InsertUser> & { openId: string }): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const nextCode = await getNextStudentCode();
  const pwdHash = user.passwordHash || hashPassword("senha123");
  const now = user.lastSignedIn || new Date();

  await db
    .insert(users)
    .values({
      studentCode: user.studentCode || nextCode,
      name: user.name || "Aluno",
      passwordHash: pwdHash,
      role: user.role || "user",
      isGeneralAdmin: false,
      openId: user.openId,
      email: user.email || null,
      loginMethod: user.loginMethod || "oauth",
      lastSignedIn: now,
    })
    .onDuplicateKeyUpdate({
      set: {
        name: sql`COALESCE(${user.name || null}, ${users.name})`,
        lastSignedIn: now,
      },
    });
}

export async function listAdmins(): Promise<User[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(users)
    .where(sql`${users.role} IN ('admin', 'superadmin')`)
    .orderBy(desc(users.isGeneralAdmin), users.id);
}

export async function listAllUsers(): Promise<User[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(users.id);
}

export async function setUserRole(params: {
  targetUserId: number;
  newRole: "user" | "admin";
}): Promise<User> {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");

  const target = await getUserById(params.targetUserId);
  if (!target) throw new Error("Usuário não encontrado");
  if (target.isGeneralAdmin) {
    throw new Error("Não é permitido alterar a permissão do Administrador Geral.");
  }

  await db
    .update(users)
    .set({ role: params.newRole })
    .where(eq(users.id, params.targetUserId));

  const updated = await getUserById(params.targetUserId);
  return updated!;
}

// ----------------- VÍDEOS -----------------

export async function listVideos(options?: {
  subject?: string;
  search?: string;
}): Promise<Video[]> {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(videos);
  const conditions = [];

  if (options?.subject && options.subject !== "all" && options.subject !== "Todas") {
    conditions.push(eq(videos.subject, options.subject));
  }

  if (options?.search && options.search.trim().length > 0) {
    const term = `%${options.search.trim().toLowerCase()}%`;
    conditions.push(
      sql`(LOWER(${videos.title}) LIKE ${term} OR LOWER(${videos.description}) LIKE ${term})`
    );
  }

  if (conditions.length === 1) {
    return query.where(conditions[0]).orderBy(desc(videos.publishedAt));
  } else if (conditions.length > 1) {
    return query.where(and(...conditions)).orderBy(desc(videos.publishedAt));
  }

  return query.orderBy(desc(videos.publishedAt));
}

export async function getVideoById(id: number): Promise<Video | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
  return result[0];
}

export async function createVideo(data: InsertVideo): Promise<Video> {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");

  const result = await db.insert(videos).values(data);
  const insertId = Number((result as any)[0]?.insertId || 0);
  if (insertId) {
    const video = await getVideoById(insertId);
    if (video) return video;
  }

  const latest = await db.select().from(videos).orderBy(desc(videos.id)).limit(1);
  return latest[0]!;
}

export async function updateVideo(id: number, data: Partial<InsertVideo>): Promise<Video> {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");

  await db.update(videos).set(data).where(eq(videos.id, id));
  const updated = await getVideoById(id);
  if (!updated) throw new Error("Vídeo não encontrado para atualizar");
  return updated;
}

export async function deleteVideo(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");

  await db.delete(watchedVideos).where(eq(watchedVideos.videoId, id));
  await db.delete(videos).where(eq(videos.id, id));
}

// ----------------- VÍDEOS ASSISTIDOS -----------------

export async function recordWatchedVideo(userId: number, videoId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const existing = await db
    .select()
    .from(watchedVideos)
    .where(and(eq(watchedVideos.userId, userId), eq(watchedVideos.videoId, videoId)))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(watchedVideos).values({ userId, videoId });
  } else {
    await db
      .update(watchedVideos)
      .set({ watchedAt: new Date() })
      .where(eq(watchedVideos.id, existing[0].id));
  }
}

export async function countWatchedVideosByUser(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const res = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${watchedVideos.videoId})` })
    .from(watchedVideos)
    .where(eq(watchedVideos.userId, userId));

  return Number(res[0]?.count || 0);
}

export async function getUserWatchedVideoIds(userId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select({ videoId: watchedVideos.videoId })
    .from(watchedVideos)
    .where(eq(watchedVideos.userId, userId));

  return rows.map(r => r.videoId);
}

// ----------------- SUGESTÕES -----------------

export async function createSuggestion(data: InsertSuggestion): Promise<Suggestion> {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");

  await db.insert(suggestions).values(data);
  const latest = await db
    .select()
    .from(suggestions)
    .orderBy(desc(suggestions.id))
    .limit(1);
  return latest[0]!;
}

export async function listSuggestions(): Promise<Suggestion[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(suggestions).orderBy(desc(suggestions.createdAt));
}

export async function getSuggestionById(id: number): Promise<Suggestion | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const res = await db.select().from(suggestions).where(eq(suggestions.id, id)).limit(1);
  return res[0];
}

export async function markSuggestionReviewed(id: number, reviewedById: number): Promise<Suggestion> {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");

  await db
    .update(suggestions)
    .set({
      status: "reviewed",
      reviewedAt: new Date(),
      reviewedById,
    })
    .where(eq(suggestions.id, id));

  const updated = await getSuggestionById(id);
  return updated!;
}

export async function deleteSuggestion(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.delete(suggestions).where(eq(suggestions.id, id));
}
