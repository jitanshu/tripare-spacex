import * as SQLite from 'expo-sqlite';
import { Bookmark, Launch, Launchpad } from '../types/spacex';

type SQLiteDatabase = SQLite.SQLiteDatabase;

const DB_NAME = 'mission-control.db';

export type MissionRepository = {
  migrate(): Promise<void>;
  saveLaunches(launches: Launch[]): Promise<void>;
  saveLaunchpads(launchpads: Launchpad[]): Promise<void>;
  getLaunches(): Promise<Launch[]>;
  getLaunchpads(): Promise<Launchpad[]>;
  getBookmarks(): Promise<Bookmark[]>;
  upsertBookmark(bookmark: Bookmark): Promise<void>;
  deleteBookmark(launchId: string): Promise<void>;
  setMetadata(key: string, value: string): Promise<void>;
  getMetadata(key: string): Promise<string | null>;
};

let cachedDb: SQLiteDatabase | null = null;
let migrationPromise: Promise<void> | null = null;
let writeQueue: Promise<void> = Promise.resolve();

const getDb = async (): Promise<SQLiteDatabase> => {
  if (!cachedDb) {
    cachedDb = await SQLite.openDatabaseAsync(DB_NAME);
  }
  return cachedDb;
};

const enqueueWrite = async <T>(task: () => Promise<T>): Promise<T> => {
  const next = writeQueue.then(task, task);
  writeQueue = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
};

const serializeLaunch = (launch: Launch) => ({
  ...launch,
  payloadIds: JSON.stringify(launch.payloadIds),
});

const deserializeLaunch = (row: Launch & { payloadIds: string }): Launch => ({
  ...row,
  payloadIds: JSON.parse(row.payloadIds) as string[],
});

export const createSQLiteRepository = (): MissionRepository => ({
  async migrate() {
    if (!migrationPromise) {
      migrationPromise = enqueueWrite(async () => {
        const db = await getDb();
        await db.execAsync(`
          PRAGMA journal_mode = WAL;
          CREATE TABLE IF NOT EXISTS launches (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            dateUtc TEXT NOT NULL,
            dateUnix INTEGER NOT NULL,
            rocket TEXT NOT NULL,
            launchpadId TEXT NOT NULL,
            status TEXT NOT NULL,
            details TEXT,
            flightNumber INTEGER NOT NULL,
            patchSmall TEXT,
            patchLarge TEXT,
            webcast TEXT,
            article TEXT,
            wikipedia TEXT,
            payloadIds TEXT NOT NULL
          );
          CREATE INDEX IF NOT EXISTS launches_date_idx ON launches(dateUnix DESC);
          CREATE INDEX IF NOT EXISTS launches_name_idx ON launches(name);
          CREATE TABLE IF NOT EXISTS launchpads (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            fullName TEXT NOT NULL,
            locality TEXT NOT NULL,
            region TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            details TEXT,
            launchAttempts INTEGER NOT NULL,
            launchSuccesses INTEGER NOT NULL
          );
          CREATE TABLE IF NOT EXISTS bookmarks (
            launchId TEXT PRIMARY KEY NOT NULL,
            encryptedNote TEXT,
            updatedAt TEXT NOT NULL
          );
          CREATE TABLE IF NOT EXISTS metadata (
            key TEXT PRIMARY KEY NOT NULL,
            value TEXT NOT NULL
          );
        `);
      });
    }
    await migrationPromise;
  },

  async saveLaunches(launches) {
    await this.migrate();
    await enqueueWrite(async () => {
      const db = await getDb();
      await db.withExclusiveTransactionAsync(async (tx) => {
      for (const launch of launches) {
        const item = serializeLaunch(launch);
        await tx.runAsync(
          `INSERT OR REPLACE INTO launches
          (id, name, dateUtc, dateUnix, rocket, launchpadId, status, details, flightNumber, patchSmall, patchLarge, webcast, article, wikipedia, payloadIds)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.id,
            item.name,
            item.dateUtc,
            item.dateUnix,
            item.rocket,
            item.launchpadId,
            item.status,
            item.details,
            item.flightNumber,
            item.patchSmall,
            item.patchLarge,
            item.webcast,
            item.article,
            item.wikipedia,
            item.payloadIds,
          ],
        );
      }
      });
    });
  },

  async saveLaunchpads(launchpads) {
    await this.migrate();
    await enqueueWrite(async () => {
      const db = await getDb();
      await db.withExclusiveTransactionAsync(async (tx) => {
      for (const pad of launchpads) {
        await tx.runAsync(
          `INSERT OR REPLACE INTO launchpads
          (id, name, fullName, locality, region, latitude, longitude, details, launchAttempts, launchSuccesses)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            pad.id,
            pad.name,
            pad.fullName,
            pad.locality,
            pad.region,
            pad.latitude,
            pad.longitude,
            pad.details,
            pad.launchAttempts,
            pad.launchSuccesses,
          ],
        );
      }
      });
    });
  },

  async getLaunches() {
    const db = await getDb();
    const rows = await db.getAllAsync<Launch & { payloadIds: string }>(
      'SELECT * FROM launches ORDER BY dateUnix DESC',
    );
    return rows.map(deserializeLaunch);
  },

  async getLaunchpads() {
    const db = await getDb();
    return db.getAllAsync<Launchpad>('SELECT * FROM launchpads');
  },

  async getBookmarks() {
    const db = await getDb();
    return db.getAllAsync<Bookmark>('SELECT * FROM bookmarks ORDER BY updatedAt DESC');
  },

  async upsertBookmark(bookmark) {
    await this.migrate();
    await enqueueWrite(async () => {
      const db = await getDb();
      await db.runAsync(
        'INSERT OR REPLACE INTO bookmarks (launchId, encryptedNote, updatedAt) VALUES (?, ?, ?)',
        [bookmark.launchId, bookmark.encryptedNote, bookmark.updatedAt],
      );
    });
  },

  async deleteBookmark(launchId) {
    await this.migrate();
    await enqueueWrite(async () => {
      const db = await getDb();
      await db.runAsync('DELETE FROM bookmarks WHERE launchId = ?', [launchId]);
    });
  },

  async setMetadata(key, value) {
    await this.migrate();
    await enqueueWrite(async () => {
      const db = await getDb();
      await db.runAsync('INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)', [key, value]);
    });
  },

  async getMetadata(key) {
    const db = await getDb();
    const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM metadata WHERE key = ?', [
      key,
    ]);
    return row?.value ?? null;
  },
});

export const missionRepository = createSQLiteRepository();
