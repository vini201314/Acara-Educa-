import { and, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { getDb } from "./db";
import { classContentCompletions, classContents, classInvites, classMembers, classes, quizQuestions, users, type ClassContent, type Classroom, type ClassInvite, type QuizQuestion, type User } from "../drizzle/schema";

export async function createClassroom(data: { teacherId: number; name: string; subject: string; schoolYear: string; className: string; shift: string }): Promise<Classroom> {
  const db = await getDb(); if (!db) throw new Error("Banco de dados indisponível");
  await db.insert(classes).values(data);
  const row = await db.select().from(classes).where(and(eq(classes.teacherId, data.teacherId), eq(classes.name, data.name))).orderBy(desc(classes.id)).limit(1);
  return row[0]!;
}

export async function listTeacherClasses(teacherId: number): Promise<Classroom[]> {
  const db = await getDb(); if (!db) return [];
  return db.select().from(classes).where(eq(classes.teacherId, teacherId)).orderBy(desc(classes.createdAt));
}

export async function listStudentClasses(studentId: number): Promise<(Classroom & { teacherName: string })[]> {
  const db = await getDb(); if (!db) return [];
  return db.select({ id: classes.id, teacherId: classes.teacherId, name: classes.name, subject: classes.subject, schoolYear: classes.schoolYear, className: classes.className, shift: classes.shift, createdAt: classes.createdAt, updatedAt: classes.updatedAt, teacherName: users.name }).from(classMembers).innerJoin(classes, eq(classMembers.classId, classes.id)).innerJoin(users, eq(classes.teacherId, users.id)).where(eq(classMembers.studentId, studentId)).orderBy(desc(classes.createdAt));
}

export async function getClassroom(classId: number): Promise<Classroom | undefined> {
  const db = await getDb(); if (!db) return undefined;
  return (await db.select().from(classes).where(eq(classes.id, classId)).limit(1))[0];
}

export async function isTeacherOfClass(classId: number, teacherId: number): Promise<boolean> {
  const row = await getClassroom(classId); return row?.teacherId === teacherId;
}

export async function isMemberOfClass(classId: number, studentId: number): Promise<boolean> {
  const db = await getDb(); if (!db) return false;
  return (await db.select({ id: classMembers.id }).from(classMembers).where(and(eq(classMembers.classId, classId), eq(classMembers.studentId, studentId))).limit(1)).length > 0;
}

export async function searchStudents(filters: { search?: string; schoolYear?: string; className?: string; shift?: string }): Promise<Pick<User, "id" | "studentCode" | "name" | "schoolYear" | "className" | "shift">[]> {
  const db = await getDb(); if (!db) return [];
  const conditions = [eq(users.role, "user")];
  if (filters.search?.trim()) { const term = `%${filters.search.trim().toLowerCase()}%`; conditions.push(or(sql`LOWER(${users.name}) LIKE ${term}`, sql`LOWER(${users.studentCode}) LIKE ${term}`)!); }
  if (filters.schoolYear && filters.schoolYear !== "all") conditions.push(eq(users.schoolYear, filters.schoolYear));
  if (filters.className && filters.className !== "all") conditions.push(eq(users.className, filters.className));
  if (filters.shift && filters.shift !== "all") conditions.push(eq(users.shift, filters.shift));
  return db.select({ id: users.id, studentCode: users.studentCode, name: users.name, schoolYear: users.schoolYear, className: users.className, shift: users.shift }).from(users).where(and(...conditions)).orderBy(users.name).limit(50);
}

export async function createInvite(data: { classId: number; teacherId: number; studentId: number }): Promise<ClassInvite> {
  const db = await getDb(); if (!db) throw new Error("Banco de dados indisponível");
  if (await isMemberOfClass(data.classId, data.studentId)) throw new Error("Este aluno já participa da classe.");
  const previous = await db.select().from(classInvites).where(and(eq(classInvites.classId, data.classId), eq(classInvites.studentId, data.studentId), eq(classInvites.status, "pending"))).limit(1);
  if (previous[0]) return previous[0];
  await db.insert(classInvites).values(data);
  return (await db.select().from(classInvites).where(and(eq(classInvites.classId, data.classId), eq(classInvites.studentId, data.studentId))).orderBy(desc(classInvites.id)).limit(1))[0]!;
}

export async function listStudentInvites(studentId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select({ id: classInvites.id, classId: classInvites.classId, status: classInvites.status, createdAt: classInvites.createdAt, className: classes.name, subject: classes.subject, schoolYear: classes.schoolYear, classGroup: classes.className, shift: classes.shift, teacherName: users.name }).from(classInvites).innerJoin(classes, eq(classInvites.classId, classes.id)).innerJoin(users, eq(classInvites.teacherId, users.id)).where(and(eq(classInvites.studentId, studentId), eq(classInvites.status, "pending"))).orderBy(desc(classInvites.createdAt));
}

export async function respondToInvite(inviteId: number, studentId: number, status: "accepted" | "rejected") {
  const db = await getDb(); if (!db) throw new Error("Banco de dados indisponível");
  const invite = (await db.select().from(classInvites).where(and(eq(classInvites.id, inviteId), eq(classInvites.studentId, studentId), eq(classInvites.status, "pending"))).limit(1))[0];
  if (!invite) throw new Error("Convite não encontrado ou já respondido.");
  await db.update(classInvites).set({ status, respondedAt: new Date() }).where(eq(classInvites.id, inviteId));
  if (status === "accepted" && !(await isMemberOfClass(invite.classId, studentId))) await db.insert(classMembers).values({ classId: invite.classId, studentId });
  return { ...invite, status };
}

export async function listClassMembers(classId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select({ membershipId: classMembers.id, studentId: users.id, studentCode: users.studentCode, name: users.name, schoolYear: users.schoolYear, className: users.className, shift: users.shift, joinedAt: classMembers.joinedAt }).from(classMembers).innerJoin(users, eq(classMembers.studentId, users.id)).where(eq(classMembers.classId, classId)).orderBy(users.name);
}

export async function removeClassMember(classId: number, studentId: number) {
  const db = await getDb(); if (!db) throw new Error("Banco de dados indisponível");
  await db.delete(classMembers).where(and(eq(classMembers.classId, classId), eq(classMembers.studentId, studentId)));
}

export async function createClassContent(data: { classId: number; authorId: number; type: "announcement" | "lesson" | "task" | "quiz" | "material" | "video"; title: string; description: string; fileUrl?: string | null; videoId?: number | null; dueAt?: Date | null; payload?: string | null }): Promise<ClassContent> {
  const db = await getDb(); if (!db) throw new Error("Banco de dados indisponível");
  await db.insert(classContents).values(data);
  return (await db.select().from(classContents).where(and(eq(classContents.classId, data.classId), eq(classContents.authorId, data.authorId), eq(classContents.title, data.title))).orderBy(desc(classContents.id)).limit(1))[0]!;
}

export async function listClassContents(classId: number) {
  const db = await getDb(); if (!db) return [];
  const contents = await db.select().from(classContents).where(eq(classContents.classId, classId)).orderBy(desc(classContents.createdAt));
  const quizzes = contents.filter(c => c.type === "quiz");
  const questions = quizzes.length ? await db.select().from(quizQuestions).where(inArray(quizQuestions.contentId, quizzes.map(q => q.id))) : [];
  return contents.map(content => ({ ...content, questions: questions.filter(q => q.contentId === content.id).map(q => ({ ...q, options: JSON.parse(q.optionsJson) as string[] })) }));
}

export async function createQuizQuestions(contentId: number, questions: { question: string; options: string[]; correctOption: number; points: number }[]) {
  const db = await getDb(); if (!db) throw new Error("Banco de dados indisponível");
  if (questions.length) await db.insert(quizQuestions).values(questions.map(q => ({ contentId, question: q.question, optionsJson: JSON.stringify(q.options), correctOption: q.correctOption, points: q.points })));
}

export async function completeContent(contentId: number, studentId: number, score?: number) {
  const db = await getDb(); if (!db) throw new Error("Banco de dados indisponível");
  const old = await db.select().from(classContentCompletions).where(and(eq(classContentCompletions.contentId, contentId), eq(classContentCompletions.studentId, studentId))).limit(1);
  if (old[0]) await db.update(classContentCompletions).set({ score: score ?? null, completedAt: new Date() }).where(eq(classContentCompletions.id, old[0].id));
  else await db.insert(classContentCompletions).values({ contentId, studentId, score: score ?? null });
}
