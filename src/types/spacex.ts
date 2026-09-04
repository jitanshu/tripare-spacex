export type LaunchStatus = 'success' | 'failure' | 'upcoming';

export type Launch = {
  id: string;
  name: string;
  dateUtc: string;
  dateUnix: number;
  rocket: string;
  launchpadId: string;
  status: LaunchStatus;
  details: string | null;
  flightNumber: number;
  patchSmall: string | null;
  patchLarge: string | null;
  webcast: string | null;
  article: string | null;
  wikipedia: string | null;
  payloadIds: string[];
};

export type Launchpad = {
  id: string;
  name: string;
  fullName: string;
  locality: string;
  region: string;
  latitude: number;
  longitude: number;
  details: string | null;
  launchAttempts: number;
  launchSuccesses: number;
};

export type Bookmark = {
  launchId: string;
  encryptedNote: string | null;
  updatedAt: string;
};

export type EnrichedLaunch = Launch & {
  launchpad?: Launchpad;
  bookmark?: Bookmark;
};

export type DateRangeFilter = 'last30' | 'lastYear' | 'all';
export type SortOption = 'dateDesc' | 'dateAsc' | 'nameAsc' | 'nameDesc';

export type LaunchFilters = {
  search: string;
  dateRange: DateRangeFilter;
  statuses: LaunchStatus[];
  rockets: string[];
  launchpads: string[];
  sort: SortOption;
};
