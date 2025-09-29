import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {theme} from '../services/Common/theme';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false, error: null};
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {hasError: true, error};
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.COLORS.BG,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.COLORS.TEXT_WHITE,
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    color: theme.COLORS.TEXT_GREY,
    textAlign: 'center',
  },
});

export default ErrorBoundary;
