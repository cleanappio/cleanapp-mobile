# Location Fetching State Guide

This guide explains how to use the `isFetchingLocation` boolean flag to track when the PollingService is calling the getLocation API.

## Overview

The PollingService now dispatches state changes when it starts and stops fetching the user's location. This allows React components to show loading indicators, disable buttons, or perform other UI updates while location fetching is in progress.

## Implementation Details

### 1. State Management

- **Initial State**: `isFetchingLocation: false` in `src/services/State/InitialState.js`
- **Action**: `SET_FETCHING_LOCATION` in `src/services/State/Reducer.js`
- **Reducer**: Updates `isFetchingLocation` based on the action payload

### 2. PollingService Integration

The PollingService automatically dispatches state changes:

- Sets `isFetchingLocation: true` when starting to call `getLocation()`
- Sets `isFetchingLocation: false` when location fetching completes (success or failure)
- Uses try/catch/finally to ensure the flag is always reset

### 3. Custom Hook

A convenient hook is provided for easy access to the location fetching state:

```typescript
import {useLocationFetching} from '../hooks/useLocationFetching';

const MyComponent = () => {
  const isFetchingLocation = useLocationFetching();

  return (
    <View>
      {isFetchingLocation && <Text>Getting your location...</Text>}
    </View>
  );
};
```

## Usage Examples

### Basic Usage

```typescript
import {useLocationFetching} from '../hooks/useLocationFetching';

const MyComponent = () => {
  const isFetchingLocation = useLocationFetching();

  return (
    <View>
      {isFetchingLocation ? (
        <ActivityIndicator size="small" color="#0000ff" />
      ) : (
        <Text>Location ready</Text>
      )}
    </View>
  );
};
```

### With State Value Directly

```typescript
import {useStateValue} from '../services/State/State';

const MyComponent = () => {
  const [{isFetchingLocation}] = useStateValue();

  return (
    <Button
      title="Refresh Reports"
      disabled={isFetchingLocation}
      onPress={handleRefresh}
    />
  );
};
```

### Loading Overlay

```typescript
const MyComponent = () => {
  const isFetchingLocation = useLocationFetching();

  return (
    <View style={{flex: 1}}>
      {/* Your main content */}
      <ScrollView>
        {/* Reports, etc. */}
      </ScrollView>

      {/* Loading overlay */}
      {isFetchingLocation && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
});
```

## When is Location Fetched?

The PollingService calls `getLocation()` when:

1. No map location is available from `getMapLocation()`
2. The map location doesn't have valid latitude/longitude coordinates
3. This happens during the `fetchData()` method, which is called by:
   - `startPolling()` (when polling is enabled)
   - `manualPoll()` (when manually triggered)

## Best Practices

1. **Use the custom hook**: Prefer `useLocationFetching()` over direct state access for cleaner code
2. **Show user feedback**: Always provide visual feedback when location is being fetched
3. **Disable interactions**: Consider disabling buttons or other interactions during location fetching
4. **Handle edge cases**: The flag will be `false` if location fetching fails, so handle both success and failure states appropriately

## Files Modified

- `src/services/State/InitialState.js` - Added `isFetchingLocation` to initial state
- `src/services/State/Reducer.js` - Added `SET_FETCHING_LOCATION` action and reducer case
- `src/services/PollingService.js` - Added state dispatching around `getLocation()` calls
- `src/hooks/useLocationFetching.ts` - Created custom hook for easy access
- `src/screens/ReportsScreen.tsx` - Added example usage with visual indicator

## Testing

To test the location fetching state:

1. Clear any stored map location data
2. Trigger a manual poll or wait for automatic polling
3. Observe the `isFetchingLocation` flag changes in your components
4. The flag should be `true` during location fetching and `false` when complete
