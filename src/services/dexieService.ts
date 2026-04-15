/**
 * @file src/services/dexieService.ts
 * @description Dexie DB setup and Zod schemas for Ajuda Ai.
 */

import Dexie, { type Table } from 'dexie';
import { z } from 'zod';

// ============================================================================
// Zod Schemas
// ============================================================================

export const AppSettingsSchema = z.object({
    id: z.string().default('1'),
    apiKey: z.string().default(''),
    model: z.enum(['gemini-3.1-pro-preview', 'gemini-3-flash-preview', 'gemini-3.1-flash-image-preview', 'gemini-3-pro-image-preview']).default('gemini-3.1-pro-preview'),
    imageGenModel: z.enum(['gemini-3.1-flash-image-preview', 'gemini-3-pro-image-preview']).default('gemini-3.1-flash-image-preview'),
    theme: z.enum(['light', 'dark']).default('dark'),
    language: z.enum(['pt', 'en']).default('pt'),
    defaultTestMode: z.enum(['fast', 'confidence', 'structured', 'creative']).default('creative'),
    stealthMode: z.boolean().default(false),
    vibrationEnabled: z.boolean().default(true),
    thinkingBudget: z.number().default(8192),
    preparationMode: z.enum(['summarize', 'full_attachments']).default('summarize'),
    generateImageInPreparation: z.boolean().default(false),
    enableImageGeneration: z.boolean().default(true),
    enableModelDowngrade: z.boolean().default(true),
    hasSeenOnboarding: z.boolean().default(false),
    recitationHandlingMode: z.enum(['paraphrase', 'token_injection']).default('paraphrase'),
});

export type AppSettings = z.infer<typeof AppSettingsSchema>;

export const WarmContextSchema = z.object({
    summary: z.string().describe("A concise summary of the study material."),
    keyConcepts: z.array(z.string()).describe("List of key concepts extracted from the material."),
    formulas: z.array(z.string()).describe("List of important formulas or equations found."),
    vocabulary: z.array(z.string()).describe("Important vocabulary or terms."),
    predictedTypes: z.array(z.string()).describe("Predicted types of questions that might appear on the test."),
    imageBase64: z.string().optional().describe("Base64 encoded image/infographic generated for the context."),
});

export type WarmContext = z.infer<typeof WarmContextSchema>;

export const TestSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    tags: z.array(z.string()).default([]),
    warmContext: WarmContextSchema.nullable().default(null),
});

export type Test = z.infer<typeof TestSchema>;

export const SessionSchema = z.object({
    id: z.number().optional(),
    testId: z.string(),
    mode: z.enum(['fast', 'confidence', 'structured', 'creative']),
    createdAt: z.string(),
    status: z.enum(['pending', 'completed', 'error']),
});

export type Session = z.infer<typeof SessionSchema>;

export const QuestionSchema = z.object({
    id: z.number().optional(),
    sessionId: z.number(),
    type: z.enum(['multiple_choice', 'writing', 'math', 'draw']),
    rawImageBase64: z.array(z.string()),
});

export type Question = z.infer<typeof QuestionSchema>;

const BaseAnswerSchema = z.object({
    id: z.string(),
    questionNumber: z.number().optional(),
    type: z.enum(['multiple_choice', 'writing', 'math', 'draw']),
    language: z.string(),
    doubleChecked: z.boolean().default(false),
    checkedAt: z.string().optional(),
    meta: z.record(z.string(), z.unknown()).default({}),
});

export const MultipleChoiceAnswerSchema = BaseAnswerSchema.extend({
    type: z.literal('multiple_choice'),
    question: z.string(),
    multipleChoiceAnswer: z.object({
        correctOption: z.string(),
        correctOptionText: z.string().optional(),
        explanation: z.string(),
    }).optional(),
});

export const WritingAnswerSchema = BaseAnswerSchema.extend({
    type: z.literal('writing'),
    question: z.string(),
    writingAnswer: z.object({
        shortAnswer: z.string(),
        detailedAnswer: z.string(),
    }).optional(),
});

export const MathAnswerSchema = BaseAnswerSchema.extend({
    type: z.literal('math'),
    question: z.string(),
    mathAnswer: z.object({
        finalAnswer: z.string(),
        solutionSteps: z.array(z.string()),
    }).optional(),
});

export const DrawAnswerSchema = BaseAnswerSchema.extend({
    type: z.literal('draw'),
    question: z.string(),
    drawAnswer: z.object({
        asciiArt: z.string(),
        explanation: z.string().optional(),
    }).optional(),
    generatedImageBase64: z.string().nullable().default(null),
});

export const AnswerSchema = z.discriminatedUnion('type', [
    MultipleChoiceAnswerSchema,
    WritingAnswerSchema,
    MathAnswerSchema,
    DrawAnswerSchema,
]);

export type Answer = z.infer<typeof AnswerSchema>;
export type MultipleChoiceAnswer = z.infer<typeof MultipleChoiceAnswerSchema>;
export type WritingAnswer = z.infer<typeof WritingAnswerSchema>;
export type MathAnswer = z.infer<typeof MathAnswerSchema>;
export type DrawAnswer = z.infer<typeof DrawAnswerSchema>;

// We store answers in a single table, but they are linked to a questionId.
// We need an internal DB schema for answers that includes the questionId.
export type DBAnswer = Answer & {
    dbId?: number;
    questionId: number;
};

export const AssetSchema = z.object({
    id: z.number().optional(),
    testId: z.string(),
    name: z.string(),
    mimeType: z.string(),
    base64Data: z.string(),
});

export type Asset = z.infer<typeof AssetSchema>;

// ============================================================================
// Dexie Database
// ============================================================================

class AjudaAiDB extends Dexie {
    settings!: Table<AppSettings, string>;
    tests!: Table<Test, string>;
    sessions!: Table<Session, number>;
    questions!: Table<Question, number>;
    answers!: Table<DBAnswer, number>;
    assets!: Table<Asset, number>;

    constructor() {
        super('AjudaAiDB');
        this.version(1).stores({
            settings: 'id', // always "1"
            tests: 'id, name, createdAt, updatedAt',
            sessions: '++id, testId, createdAt',
            questions: '++id, sessionId',
            answers: '++dbId, questionId, id',
            assets: '++id, testId',
        });
    }
}

export const db = new AjudaAiDB();

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Retrieves the application settings.
 * @returns {Promise<AppSettings>} The settings object.
 */
export async function getSettings(): Promise<AppSettings> {
    const settings = await db.settings.get('1');
    if (settings) return settings;
    const defaultSettings = AppSettingsSchema.parse({});
    await db.settings.put(defaultSettings);
    return defaultSettings;
}

/**
 * Updates the application settings.
 * @param {Partial<AppSettings>} partialSettings The settings to update.
 * @returns {Promise<AppSettings>} The updated settings.
 */
export async function updateSettings(partialSettings: Partial<AppSettings>): Promise<AppSettings> {
    const current = await getSettings();
    const updated = { ...current, ...partialSettings };
    await db.settings.put(updated);
    return updated;
}

/**
 * Retrieves all tests.
 * @returns {Promise<Test[]>} Array of tests.
 */
export async function getAllTests(): Promise<Test[]> {
    return db.tests.orderBy('updatedAt').reverse().toArray();
}

/**
 * Retrieves a specific test by ID.
 * @param {string} id The test ID.
 * @returns {Promise<Test | undefined>} The test object.
 */
export async function getTest(id: string): Promise<Test | undefined> {
    return db.tests.get(id);
}

/**
 * Creates a new test.
 * @param {string} name The name of the test.
 * @returns {Promise<string>} The ID of the newly created test.
 */
export async function createTest(name: string): Promise<string> {
    const slug = name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with -
        .replace(/^-+|-+$/g, ''); // trim -

    const randomStr = Math.random().toString(36).substring(2, 8);
    const id = `${slug || 'test'}-${randomStr}`;

    const now = new Date().toISOString();
    const test: Test = {
        id,
        name,
        createdAt: now,
        updatedAt: now,
        tags: [],
        warmContext: null,
    };
    await db.tests.add(test);
    return id;
}

/**
 * Updates a test.
 * @param {string} id The test ID.
 * @param {Partial<Test>} changes The changes to apply.
 * @returns {Promise<string>} The ID of the updated record.
 */
export async function updateTest(id: string, changes: Partial<Test>): Promise<string> {
    await db.tests.update(id, { ...changes, updatedAt: new Date().toISOString() });
    return id;
}

/**
 * Deletes a test and all associated data.
 * @param {string} id The test ID.
 */
export async function deleteTest(id: string): Promise<void> {
    await db.transaction('rw', [db.tests, db.sessions, db.questions, db.answers, db.assets], async () => {
        await db.tests.delete(id);
        const sessions = await db.sessions.where('testId').equals(id).toArray();
        const sessionIds = sessions.map(s => s.id!);
        await db.sessions.bulkDelete(sessionIds);

        const questions = await db.questions.where('sessionId').anyOf(sessionIds).toArray();
        const questionIds = questions.map(q => q.id!);
        await db.questions.bulkDelete(questionIds);

        await db.answers.where('questionId').anyOf(questionIds).delete();
        await db.assets.where('testId').equals(id).delete();
    });
}

/**
 * Retrieves assets for a test.
 * @param {string} testId The test ID.
 * @returns {Promise<Asset[]>} Array of assets.
 */
export async function getTestAssets(testId: string): Promise<Asset[]> {
    return db.assets.where('testId').equals(testId).toArray();
}

/**
 * Adds an asset to a test.
 * @param {Omit<Asset, 'id'>} asset The asset to add.
 * @returns {Promise<number>} The ID of the newly created asset.
 */
export async function addAsset(asset: Omit<Asset, 'id'>): Promise<number> {
    return db.assets.add(asset as Asset);
}

/**
 * Deletes an asset.
 * @param {number} id The asset ID.
 */
export async function deleteAsset(id: number): Promise<void> {
    return db.assets.delete(id);
}

/**
 * Creates a new session for a test.
 * @param {string} testId The test ID.
 * @param {'fast' | 'confidence'} mode The session mode.
 * @returns {Promise<number>} The ID of the newly created session.
 */
export async function createSession(testId: string, mode: 'fast' | 'confidence' | 'structured' | 'creative'): Promise<number> {
    const session: Session = {
        testId,
        mode,
        createdAt: new Date().toISOString(),
        status: 'pending',
    };
    return db.sessions.add(session);
}

/**
 * Retrieves sessions for a test.
 * @param {string} testId The test ID.
 * @returns {Promise<Session[]>} Array of sessions.
 */
export async function getTestSessions(testId: string): Promise<Session[]> {
    return db.sessions.where('testId').equals(testId).reverse().sortBy('createdAt');
}

/**
 * Updates a session's status.
 * @param {number} sessionId The session ID.
 * @param {'pending' | 'completed' | 'error'} status The new status.
 */
export async function updateSessionStatus(sessionId: number, status: 'pending' | 'completed' | 'error'): Promise<number> {
    return db.sessions.update(sessionId, { status });
}

/**
 * Deletes a session and its associated questions and answers.
 * @param {number} sessionId The session ID.
 */
export async function deleteSession(sessionId: number): Promise<void> {
    await db.transaction('rw', [db.sessions, db.questions, db.answers], async () => {
        await db.sessions.delete(sessionId);
        const questions = await db.questions.where('sessionId').equals(sessionId).toArray();
        const questionIds = questions.map(q => q.id!);
        await db.questions.bulkDelete(questionIds);
        await db.answers.where('questionId').anyOf(questionIds).delete();
    });
}

/**
 * Adds a question to a session.
 * @param {Omit<Question, 'id'>} question The question to add.
 * @returns {Promise<number>} The ID of the newly created question.
 */
export async function addQuestion(question: Omit<Question, 'id'>): Promise<number> {
    return db.questions.add(question as Question);
}

/**
 * Saves answers for a question.
 * @param {number} questionId The question ID.
 * @param {Answer[]} answers The answers to save.
 */
export async function saveAnswers(questionId: number, answers: Answer[]): Promise<void> {
    const dbAnswers: DBAnswer[] = answers.map(a => ({ ...a, questionId }));
    // Delete existing answers for this question if any
    await db.answers.where('questionId').equals(questionId).delete();
    await db.answers.bulkAdd(dbAnswers);
}

/**
 * Retrieves answers for a session.
 * @param {number} sessionId The session ID.
 * @returns {Promise<DBAnswer[]>} Array of answers.
 */
export async function getSessionAnswers(sessionId: number): Promise<DBAnswer[]> {
    const questions = await db.questions.where('sessionId').equals(sessionId).toArray();
    const questionIds = questions.map(q => q.id!);
    return db.answers.where('questionId').anyOf(questionIds).toArray();
}
