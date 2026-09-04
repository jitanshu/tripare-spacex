import React, { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { logError } from '../utils/logger';

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    logError(error, 'ErrorBoundary');
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Mission panel needs a reset</Text>
          <Text style={styles.copy}>Something unexpected happened in this view.</Text>
          <Pressable style={styles.button} onPress={() => this.setState({ hasError: false })}>
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#09111f' },
  title: { color: '#f8fafc', fontSize: 22, fontWeight: '700' },
  copy: { color: '#a9b6ca', marginTop: 8, marginBottom: 20 },
  button: { alignSelf: 'flex-start', backgroundColor: '#3dd6c6', borderRadius: 8, padding: 12 },
  buttonText: { color: '#041014', fontWeight: '700' },
});
