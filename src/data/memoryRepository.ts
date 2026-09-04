import { Bookmark, Launch, Launchpad } from '../types/spacex';
import { MissionRepository } from './database';

export const createMemoryRepository = (): MissionRepository => {
  const launches = new Map<string, Launch>();
  const launchpads = new Map<string, Launchpad>();
  const bookmarks = new Map<string, Bookmark>();
  const metadata = new Map<string, string>();

  return {
    async migrate() {},
    async saveLaunches(items) {
      items.forEach((item) => launches.set(item.id, item));
    },
    async saveLaunchpads(items) {
      items.forEach((item) => launchpads.set(item.id, item));
    },
    async getLaunches() {
      return Array.from(launches.values()).sort((a, b) => b.dateUnix - a.dateUnix);
    },
    async getLaunchpads() {
      return Array.from(launchpads.values());
    },
    async getBookmarks() {
      return Array.from(bookmarks.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async upsertBookmark(bookmark) {
      bookmarks.set(bookmark.launchId, bookmark);
    },
    async deleteBookmark(launchId) {
      bookmarks.delete(launchId);
    },
    async setMetadata(key, value) {
      metadata.set(key, value);
    },
    async getMetadata(key) {
      return metadata.get(key) ?? null;
    },
  };
};
