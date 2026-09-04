import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  LaunchDetails: { launchId: string };
};

export type TabParamList = {
  Launches: undefined;
  Bookmarks: undefined;
  Launchpads: undefined;
};
