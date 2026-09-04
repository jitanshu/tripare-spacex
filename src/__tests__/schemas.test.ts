import { mapMirrorLaunch, mirrorLaunchesApiSchema } from '../api/schemas';

describe('mirror launch schema', () => {
  it('maps Pipeworx fallback launches into the app launch model', () => {
    const parsed = mirrorLaunchesApiSchema.parse([
      {
        pad: 'Space Launch Complex 4E',
        name: 'Falcon 9 Block 5 | Starlink Group 15-24',
        links: {
          article: 'https://www.spacex.com/launches/sl-15-24',
          webcast: 'https://x.com/i/broadcasts/1NxaroyrEngKj',
          wikipedia: 'https://en.wikipedia.org/wiki/Vandenberg_Space_Launch_Complex_4#SLC-4E',
        },
        rocket: 'Falcon 9 Block 5',
        status: 'Go for Launch',
        details: 'A batch of Starlink satellites.',
        success: null,
        date_utc: '2026-09-06T10:59:00Z',
      },
    ]);

    const launch = mapMirrorLaunch(parsed[0]);

    expect(launch.id).toMatch(/^mirror-/);
    expect(launch.launchpadId).toBe('vafb-slc-4e');
    expect(launch.status).toBe('upcoming');
    expect(launch.webcast).toBe('https://x.com/i/broadcasts/1NxaroyrEngKj');
  });
});
