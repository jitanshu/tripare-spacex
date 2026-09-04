import { format } from 'date-fns';
import { EnrichedLaunch, Launch, LaunchFilters } from '../types/spacex';

export const defaultFilters: LaunchFilters = {
  search: '',
  dateRange: 'all',
  statuses: [],
  rockets: [],
  launchpads: [],
  sort: 'dateDesc',
};

const isInsideDateRange = (launch: Launch, range: LaunchFilters['dateRange'], now: Date): boolean => {
  if (range === 'all') {
    return true;
  }
  const ageMs = now.getTime() - new Date(launch.dateUtc).getTime();
  const limitDays = range === 'last30' ? 30 : 365;
  return ageMs >= 0 && ageMs <= limitDays * 24 * 60 * 60 * 1000;
};

export const filterAndSortLaunches = (
  launches: EnrichedLaunch[],
  filters: LaunchFilters,
  now = new Date(),
): EnrichedLaunch[] => {
  const search = filters.search.trim().toLowerCase();
  const filtered = launches.filter((launch) => {
    const matchesSearch = search.length === 0 || launch.name.toLowerCase().includes(search);
    const matchesDate = isInsideDateRange(launch, filters.dateRange, now);
    const matchesStatus = filters.statuses.length === 0 || filters.statuses.includes(launch.status);
    const matchesRocket = filters.rockets.length === 0 || filters.rockets.includes(launch.rocket);
    const matchesPad =
      filters.launchpads.length === 0 || filters.launchpads.includes(launch.launchpadId);
    return matchesSearch && matchesDate && matchesStatus && matchesRocket && matchesPad;
  });

  return filtered.sort((a, b) => {
    switch (filters.sort) {
      case 'dateAsc':
        return a.dateUnix - b.dateUnix;
      case 'nameAsc':
        return a.name.localeCompare(b.name);
      case 'nameDesc':
        return b.name.localeCompare(a.name);
      case 'dateDesc':
      default:
        return b.dateUnix - a.dateUnix;
    }
  });
};

export type LaunchSection = {
  title: string;
  data: EnrichedLaunch[];
};

export const groupLaunchesByMonth = (launches: EnrichedLaunch[]): LaunchSection[] => {
  const map = new Map<string, EnrichedLaunch[]>();
  launches.forEach((launch) => {
    const title = format(new Date(launch.dateUtc), 'yyyy MMMM');
    const group = map.get(title) ?? [];
    group.push(launch);
    map.set(title, group);
  });
  return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
};
