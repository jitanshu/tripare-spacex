import { filterAndSortLaunches, groupLaunchesByMonth } from '../utils/filters';
import { EnrichedLaunch } from '../types/spacex';

const launch = (overrides: Partial<EnrichedLaunch>): EnrichedLaunch => ({
  id: 'id',
  name: 'FalconSat',
  dateUtc: '2020-01-01T00:00:00.000Z',
  dateUnix: 1577836800,
  rocket: 'falcon1',
  launchpadId: 'kwajalein',
  status: 'success',
  details: null,
  flightNumber: 1,
  patchSmall: null,
  patchLarge: null,
  webcast: null,
  article: null,
  wikipedia: null,
  payloadIds: [],
  ...overrides,
});

describe('filterAndSortLaunches', () => {
  it('applies search, status, date range and sort filters together', () => {
    const launches = [
      launch({ id: 'a', name: 'Crew Dragon', status: 'success', dateUtc: '2026-08-20T00:00:00.000Z', dateUnix: 1787184000 }),
      launch({ id: 'b', name: 'Starlink', status: 'failure', dateUtc: '2025-01-01T00:00:00.000Z', dateUnix: 1735689600 }),
      launch({ id: 'c', name: 'Crew Demo', status: 'upcoming', dateUtc: '2026-08-25T00:00:00.000Z', dateUnix: 1787616000 }),
    ];

    const result = filterAndSortLaunches(
      launches,
      {
        search: 'crew',
        dateRange: 'last30',
        statuses: ['success', 'upcoming'],
        rockets: [],
        launchpads: [],
        sort: 'nameAsc',
      },
      new Date('2026-09-04T00:00:00.000Z'),
    );

    expect(result.map((item) => item.id)).toEqual(['c', 'a']);
  });
});

describe('groupLaunchesByMonth', () => {
  it('groups launches by yyyy month labels in row order', () => {
    const groups = groupLaunchesByMonth([
      launch({ id: 'a', dateUtc: '2024-04-01T00:00:00.000Z' }),
      launch({ id: 'b', dateUtc: '2024-04-20T00:00:00.000Z' }),
      launch({ id: 'c', dateUtc: '2024-03-20T00:00:00.000Z' }),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].title).toBe('2024 April');
    expect(groups[0].data.map((item) => item.id)).toEqual(['a', 'b']);
  });
});
