import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMissionStore } from '../state/missionStore';
import { DateRangeFilter, LaunchStatus, SortOption } from '../types/spacex';

const statuses: LaunchStatus[] = ['success', 'failure', 'upcoming'];
const ranges: DateRangeFilter[] = ['last30', 'lastYear', 'all'];
const sorts: SortOption[] = ['dateDesc', 'dateAsc', 'nameAsc', 'nameDesc'];

const labels: Record<DateRangeFilter | SortOption | LaunchStatus, string> = {
  last30: '30d',
  lastYear: '1y',
  all: 'All',
  dateDesc: 'Newest',
  dateAsc: 'Oldest',
  nameAsc: 'A-Z',
  nameDesc: 'Z-A',
  success: 'Success',
  failure: 'Failure',
  upcoming: 'Upcoming',
};

type Option = {
  id: string;
  label: string;
};

type Props = {
  rockets: Option[];
  launchpads: Option[];
};

export const FilterBar = ({ rockets, launchpads }: Props) => {
  const { filters, setFilters, resetFilters } = useMissionStore();
  const [searchDraft, setSearchDraft] = useState(filters.search);

  useEffect(() => {
    const timeout = setTimeout(() => setFilters({ search: searchDraft }), 250);
    return () => clearTimeout(timeout);
  }, [searchDraft, setFilters]);

  const toggleStatus = (status: LaunchStatus) => {
    const statusesNext = filters.statuses.includes(status)
      ? filters.statuses.filter((item) => item !== status)
      : [...filters.statuses, status];
    setFilters({ statuses: statusesNext });
  };

  const toggleValue = (key: 'rockets' | 'launchpads', value: string) => {
    const current = filters[key];
    setFilters({
      [key]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={searchDraft}
        onChangeText={setSearchDraft}
        placeholder="Search missions"
        placeholderTextColor="#74829a"
        style={styles.search}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {ranges.map((range) => (
          <Pressable
            key={range}
            onPress={() => setFilters({ dateRange: range })}
            style={[styles.chip, filters.dateRange === range && styles.activeChip]}
          >
            <Text style={styles.chipText}>{labels[range]}</Text>
          </Pressable>
        ))}
        {statuses.map((status) => (
          <Pressable
            key={status}
            onPress={() => toggleStatus(status)}
            style={[styles.chip, filters.statuses.includes(status) && styles.activeChip]}
          >
            <Text style={styles.chipText}>{labels[status]}</Text>
          </Pressable>
        ))}
        {sorts.map((sort) => (
          <Pressable
            key={sort}
            onPress={() => setFilters({ sort })}
            style={[styles.chip, filters.sort === sort && styles.activeChip]}
          >
            <Text style={styles.chipText}>{labels[sort]}</Text>
          </Pressable>
        ))}
        {rockets.map((rocket) => (
          <Pressable
            key={rocket.id}
            onPress={() => toggleValue('rockets', rocket.id)}
            style={[styles.chip, filters.rockets.includes(rocket.id) && styles.activeChip]}
          >
            <Text style={styles.chipText}>{rocket.label}</Text>
          </Pressable>
        ))}
        {launchpads.map((pad) => (
          <Pressable
            key={pad.id}
            onPress={() => toggleValue('launchpads', pad.id)}
            style={[styles.chip, filters.launchpads.includes(pad.id) && styles.activeChip]}
          >
            <Text style={styles.chipText}>{pad.label}</Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => {
            setSearchDraft('');
            resetFilters();
          }}
          style={styles.reset}
        >
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#09111f', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  search: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#25344d',
    color: '#f8fafc',
    paddingHorizontal: 14,
    backgroundColor: '#0f1b2e',
  },
  row: { gap: 8, alignItems: 'center' },
  chip: { height: 34, justifyContent: 'center', borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#17233a' },
  activeChip: { backgroundColor: '#246b73' },
  chipText: { color: '#edf7ff', fontWeight: '700' },
  reset: { height: 34, justifyContent: 'center', paddingHorizontal: 12 },
  resetText: { color: '#7dd3fc', fontWeight: '700' },
});
