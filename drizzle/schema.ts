import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Tabela de usuários: alunos e administradores.
 * Suporta autenticação própria (nome completo + hash de senha) e identificador único de aluno (#001, #002...).
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  studentCode: varchar("studentCode", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 191 }).notNull(),
  passwordHash: text("passwordHash").notNull(),
  role: mysqlEnum("role", ["user", "admin", "superadmin"]).default("user").notNull(),
  isGeneralAdmin: boolean("isGeneralAdmin").default(false).notNull(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }).default("credentials").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const SUBJECTS = [
  "Matemática",
  "Português",
  "Ciências",
  "História",
  "Geografia",
  "Inglês",
  "Educação Física",
  "Outras",
] as const;

export type Subject = (typeof SUBJECTS)[number];

/**
 * Tabela de vídeos de reforço escolar.
 */
export const videos = mysqlTable("videos", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  subject: varchar("subject", { length: 64 }).notNull(),
  sourceType: mysqlEnum("sourceType", ["url", "file"]).notNull(),
  videoUrl: text("videoUrl").notNull(),
  fileKey: varchar("fileKey", { length: 255 }),
  thumbnailUrl: text("thumbnailUrl"),
  durationSeconds: int("durationSeconds").default(0),
  createdById: int("createdById").notNull(),
  createdByName: varchar("createdByName", { length: 191 }),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Video = typeof videos.$inferSelect;
export type InsertVideo = typeof videos.$inferInsert;

/**
 * Sugestões enviadas pelos alunos.
 */
export const suggestions = mysqlTable("suggestions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  studentCode: varchar("studentCode", { length: 20 }).notNull(),
  studentName: varchar("studentName", { length: 191 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  subject: varchar("subject", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["pending", "reviewed"]).default("pending").notNull(),
  reviewedAt: timestamp("reviewedAt"),
  reviewedById: int("reviewedById"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Suggestion = typeof suggestions.$inferSelect;
export type InsertSuggestion = typeof suggestions.$inferInsert;

/**
 * Registro de visualizações/vídeos assistidos pelos alunos.
 */
export const watchedVideos = mysqlTable("watched_videos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  videoId: int("videoId").notNull(),
  watchedAt: timestamp("watchedAt").defaultNow().notNull(),
});

export type WatchedVideo = typeof watchedVideos.$inferSelect;
export type InsertWatchedVideo = typeof watchedVideos.$inferInsert;
