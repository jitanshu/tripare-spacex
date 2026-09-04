import { z } from 'zod';
import { Launch, Launchpad, LaunchStatus } from '../types/spacex';

const linksSchema = z.object({
  patch: z.object({ small: z.string().url().nullable(), large: z.string().url().nullable() }),
  webcast: z.string().url().nullable(),
  article: z.string().url().nullable(),
  wikipedia: z.string().url().nullable(),
});

export const launchApiSchema = z.object({
  id: z.string(),
  name: z.string(),
  date_utc: z.string(),
  date_unix: z.number(),
  rocket: z.string(),
  launchpad: z.string(),
  success: z.boolean().nullable(),
  upcoming: z.boolean(),
  details: z.string().nullable(),
  flight_number: z.number(),
  links: linksSchema,
  payloads: z.array(z.string()),
});

export const launchpadApiSchema = z.object({
  id: z.string(),
  name: z.string(),
  full_name: z.string(),
  locality: z.string(),
  region: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  details: z.string().nullable(),
  launch_attempts: z.number(),
  launch_successes: z.number(),
});

export const launchesApiSchema = z.array(launchApiSchema);

export const mirrorLaunchApiSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  pad: z.string().optional(),
  links: z
    .object({
      article: z.string().url().optional(),
      webcast: z.string().url().optional(),
      wikipedia: z.string().url().optional(),
    })
    .optional(),
  rocket: z.string().optional(),
  status: z.string(),
  details: z.string().nullable().optional(),
  success: z.boolean().nullable(),
  date_utc: z.string(),
});

export const mirrorLaunchesApiSchema = z.array(mirrorLaunchApiSchema);

const getStatus = (success: boolean | null, upcoming: boolean): LaunchStatus => {
  if (upcoming) {
    return 'upcoming';
  }
  return success ? 'success' : 'failure';
};

export const mapLaunch = (input: z.infer<typeof launchApiSchema>): Launch => ({
  id: input.id,
  name: input.name,
  dateUtc: input.date_utc,
  dateUnix: input.date_unix,
  rocket: input.rocket,
  launchpadId: input.launchpad,
  status: getStatus(input.success, input.upcoming),
  details: input.details,
  flightNumber: input.flight_number,
  patchSmall: input.links.patch.small,
  patchLarge: input.links.patch.large,
  webcast: input.links.webcast,
  article: input.links.article,
  wikipedia: input.links.wikipedia,
  payloadIds: input.payloads,
});

export const mapLaunchpad = (input: z.infer<typeof launchpadApiSchema>): Launchpad => ({
  id: input.id,
  name: input.name,
  fullName: input.full_name,
  locality: input.locality,
  region: input.region,
  latitude: input.latitude,
  longitude: input.longitude,
  details: input.details,
  launchAttempts: input.launch_attempts,
  launchSuccesses: input.launch_successes,
});

const stableId = (value: string): string => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return `mirror-${hash.toString(16)}`;
};

const normalizePadId = (pad?: string): string => {
  const lower = pad?.toLowerCase() ?? '';
  if (lower.includes('4e')) {
    return 'vafb-slc-4e';
  }
  if (lower.includes('40')) {
    return 'ccsfs-slc-40';
  }
  if (lower.includes('39a')) {
    return 'ksc-lc-39a';
  }
  if (lower.includes('boca') || lower.includes('starbase')) {
    return 'starbase';
  }
  return 'unknown-pad';
};

const mirrorStatus = (status: string, success: boolean | null): LaunchStatus => {
  const lower = status.toLowerCase();
  if (success === true || lower.includes('successful')) {
    return 'success';
  }
  if (success === false || lower.includes('fail')) {
    return 'failure';
  }
  return 'upcoming';
};

export const mapMirrorLaunch = (input: z.infer<typeof mirrorLaunchApiSchema>): Launch => {
  const dateUnix = Math.floor(new Date(input.date_utc).getTime() / 1000);
  return {
    id: input.id ?? stableId(`${input.name}:${input.date_utc}`),
    name: input.name,
    dateUtc: input.date_utc,
    dateUnix,
    rocket: input.rocket ?? input.name.split('|')[0]?.trim() ?? 'SpaceX vehicle',
    launchpadId: normalizePadId(input.pad),
    status: mirrorStatus(input.status, input.success),
    details: input.details ?? null,
    flightNumber: dateUnix,
    patchSmall: null,
    patchLarge: null,
    webcast: input.links?.webcast ?? null,
    article: input.links?.article ?? null,
    wikipedia: input.links?.wikipedia ?? null,
    payloadIds: [],
  };
};
