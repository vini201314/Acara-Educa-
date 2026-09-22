import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(), studentCode: varchar("studentCode", { length: 20 }).notNull().unique(), name: varchar("name", { length: 191 }).notNull(), passwordHash: text("passwordHash").notNull(), role: mysqlEnum("role", ["user", "teacher", "admin", "superadmin"]).default("user").notNull(), isGeneralAdmin: boolean("isGeneralAdmin").default(false).notNull(), openId: varchar("openId", { length: 64 }).notNull().unique(), email: varchar("email", { length: 320 }), schoolYear: varchar("schoolYear", { length: 32 }), className: varchar("className", { length: 32 }), shift: varchar("shift", { length: 32 }), loginMethod: varchar("loginMethod", { length: 64 }).default("credentials").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(), lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export const SUBJECTS = ["Matemática", "Português", "Ciências", "História", "Geografia", "Inglês", "Educação Física", "Outras"] as const;
export type Subject = (typeof SUBJECTS)[number];

export const videos = mysqlTable("videos", { id: int("id").autoincrement().primaryKey(), title: varchar("title", { length: 255 }).notNull(), description: text("description").notNull(), subject: varchar("subject", { length: 64 }).notNull(), sourceType: mysqlEnum("sourceType", ["url", "file"]).notNull(), videoUrl: text("videoUrl").notNull(), fileKey: varchar("fileKey", { length: 255 }), thumbnailUrl: text("thumbnailUrl"), durationSeconds: int("durationSeconds").default(0), createdById: int("createdById").notNull(), createdByName: varchar("createdByName", { length: 191 }), publishedAt: timestamp("publishedAt").defaultNow().notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull() });
export type Video = typeof videos.$inferSelect;
export type InsertVideo = typeof videos.$inferInsert;
export const suggestions = mysqlTable("suggestions", { id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull(), studentCode: varchar("studentCode", { length: 20 }).notNull(), studentName: varchar("studentName", { length: 191 }).notNull(), title: varchar("title", { length: 255 }).notNull(), description: text("description").notNull(), subject: varchar("subject", { length: 64 }).notNull(), status: mysqlEnum("status", ["pending", "reviewed"]).default("pending").notNull(), reviewedAt: timestamp("reviewedAt"), reviewedById: int("reviewedById"), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull() });
export type Suggestion = typeof suggestions.$inferSelect;
export type InsertSuggestion = typeof suggestions.$inferInsert;
export const watchedVideos = mysqlTable("watched_videos", { id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull(), videoId: int("videoId").notNull(), watchedAt: timestamp("watchedAt").defaultNow().notNull() });
export type WatchedVideo = typeof watchedVideos.$inferSelect;
export type InsertWatchedVideo = typeof watchedVideos.$inferInsert;

export const classes = mysqlTable("classes", { id: int("id").autoincrement().primaryKey(), teacherId: int("teacherId").notNull(), name: varchar("name", { length: 191 }).notNull(), subject: varchar("subject", { length: 64 }).notNull(), schoolYear: varchar("schoolYear", { length: 32 }).notNull(), className: varchar("className", { length: 32 }).notNull(), shift: varchar("shift", { length: 32 }).notNull(), joinCode: varchar("joinCode", { length: 64 }), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull() });
export type Classroom = typeof classes.$inferSelect;
export type InsertClassroom = typeof classes.$inferInsert;
export const classMembers = mysqlTable("class_members", { id: int("id").autoincrement().primaryKey(), classId: int("classId").notNull(), studentId: int("studentId").notNull(), joinedAt: timestamp("joinedAt").defaultNow().notNull() });
export type ClassMember = typeof classMembers.$inferSelect;
export type InsertClassMember = typeof classMembers.$inferInsert;
export const classInvites = mysqlTable("class_invites", { id: int("id").autoincrement().primaryKey(), classId: int("classId").notNull(), teacherId: int("teacherId").notNull(), studentId: int("studentId").notNull(), status: mysqlEnum("status", ["pending", "accepted", "rejected"]).default("pending").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(), respondedAt: timestamp("respondedAt") });
export type ClassInvite = typeof classInvites.$inferSelect;
export type InsertClassInvite = typeof classInvites.$inferInsert;
export const classContents = mysqlTable("class_contents", { id: int("id").autoincrement().primaryKey(), classId: int("classId").notNull(), authorId: int("authorId").notNull(), type: mysqlEnum("type", ["announcement", "lesson", "task", "quiz", "material", "video"]).notNull(), title: varchar("title", { length: 255 }).notNull(), description: text("description").notNull(), fileUrl: text("fileUrl"), videoId: int("videoId"), dueAt: timestamp("dueAt"), payload: text("payload"), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull() });
export type ClassContent = typeof classContents.$inferSelect;
export type InsertClassContent = typeof classContents.$inferInsert;
export const quizQuestions = mysqlTable("quiz_questions", { id: int("id").autoincrement().primaryKey(), contentId: int("contentId").notNull(), question: text("question").notNull(), optionsJson: text("optionsJson").notNull(), correctOption: int("correctOption").notNull(), points: int("points").default(1).notNull() });
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = typeof quizQuestions.$inferInsert;
export const classContentCompletions = mysqlTable("class_content_completions", { id: int("id").autoincrement().primaryKey(), contentId: int("contentId").notNull(), studentId: int("studentId").notNull(), score: int("score"), completedAt: timestamp("completedAt").defaultNow().notNull() });
export type ClassContentCompletion = typeof classContentCompletions.$inferSelect;
export type InsertCompletion = typeof classContentCompletions.$inferInsert;
export type Role = User["role"];
export type ClassContentType = ClassContent["type"];
