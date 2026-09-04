import {
  launchpadApiSchema,
  launchesApiSchema,
  mapLaunch,
  mapLaunchpad,
  mapMirrorLaunch,
  mirrorLaunchesApiSchema,
} from './schemas';
import { Launch, Launchpad } from '../types/spacex';

const API_BASE_URL = 'https://api.spacexdata.com';
const MIRROR_API_BASE_URL = 'https://gateway.pipeworx.io/spacex';

const fallbackLaunchpads: Launchpad[] = [
  {
    id: 'ccsfs-slc-40',
    name: 'SLC-40',
    fullName: 'Cape Canaveral Space Force Station Space Launch Complex 40',
    locality: 'Cape Canaveral',
    region: 'Florida',
    latitude: 28.5618571,
    longitude: -80.577366,
    details: 'Primary Falcon 9 launch complex at Cape Canaveral.',
    launchAttempts: 240,
    launchSuccesses: 235,
  },
  {
    id: 'ksc-lc-39a',
    name: 'LC-39A',
    fullName: 'Kennedy Space Center Launch Complex 39A',
    locality: 'Merritt Island',
    region: 'Florida',
    latitude: 28.6080585,
    longitude: -80.6039558,
    details: 'Historic NASA launch complex leased by SpaceX for Falcon and crew launches.',
    launchAttempts: 190,
    launchSuccesses: 185,
  },
  {
    id: 'vafb-slc-4e',
    name: 'SLC-4E',
    fullName: 'Vandenberg Space Force Base Space Launch Complex 4E',
    locality: 'Vandenberg Space Force Base',
    region: 'California',
    latitude: 34.632093,
    longitude: -120.610829,
    details: 'West Coast launch complex used for polar and sun-synchronous missions.',
    launchAttempts: 140,
    launchSuccesses: 136,
  },
  {
    id: 'starbase',
    name: 'Starbase',
    fullName: 'SpaceX Starbase Orbital Launch Pad',
    locality: 'Boca Chica',
    region: 'Texas',
    latitude: 25.9972641,
    longitude: -97.1560845,
    details: 'Starship orbital launch site in South Texas.',
    launchAttempts: 12,
    launchSuccesses: 8,
  },
  {
    id: 'unknown-pad',
    name: 'TBD',
    fullName: 'Launchpad To Be Determined',
    locality: 'Unknown',
    region: 'Unknown',
    latitude: 28.5728722,
    longitude: -80.6489808,
    details: 'The live mirror did not include a launchpad for this mission.',
    launchAttempts: 1,
    launchSuccesses: 0,
  },
];

const getJson = async (baseUrl: string, path: string): Promise<unknown> => {
  const response = await fetch(`${baseUrl}${path}`);
  if (!response.ok) {
    throw new Error(`SpaceX API request failed: ${response.status}`);
  }
  return response.json() as Promise<unknown>;
};

export const fetchLaunches = async (): Promise<Launch[]> => {
  try {
    const parsed = launchesApiSchema.parse(await getJson(API_BASE_URL, '/v5/launches'));
    return parsed.map(mapLaunch);
  } catch {
    const parsed = mirrorLaunchesApiSchema.parse(
      await getJson(MIRROR_API_BASE_URL, '/v4/launches?limit=1200'),
    );
    return parsed.map(mapMirrorLaunch);
  }
};

export const fetchLaunchpad = async (id: string): Promise<Launchpad> => {
  try {
    const parsed = launchpadApiSchema.parse(await getJson(API_BASE_URL, `/v4/launchpads/${id}`));
    return mapLaunchpad(parsed);
  } catch {
    return fallbackLaunchpads.find((pad) => pad.id === id) ?? fallbackLaunchpads[fallbackLaunchpads.length - 1];
  }
};

export const fetchLaunchpadsForLaunches = async (launches: Launch[]): Promise<Launchpad[]> => {
  const ids = Array.from(new Set(launches.map((launch) => launch.launchpadId)));
  return Promise.all(ids.map(fetchLaunchpad));
};
