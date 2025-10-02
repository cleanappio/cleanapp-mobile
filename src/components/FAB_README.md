# Floating Action Button (FAB) System

This document explains how to use the Floating Action Button system in the CleanApp mobile application.

## Overview

The FAB system consists of three main components:

1. `FloatingActionButton` - A reusable, customizable FAB component
2. `GlobalFAB` - The main FAB that appears on all screens
3. `useFAB` - A hook for controlling FAB visibility and state

## Components

### FloatingActionButton

A highly customizable floating action button component.

**Props:**

- `onPress` (function): Function to call when FAB is pressed
- `icon` (React element): Icon to display in the FAB
- `text` (string): Text to display if no icon is provided (defaults to '+')
- `position` (string): Position of the FAB ('bottom-right', 'bottom-left', 'bottom-center', 'top-right', 'top-left', 'top-center')
- `size` (string): Size of the FAB ('small', 'medium', 'large')
- `color` (string): Background color of the FAB
- `textColor` (string): Color of the text/icon
- `style` (object): Additional styles
- `disabled` (boolean): Whether the FAB is disabled

**Example:**

```jsx
import FloatingActionButton from '../components/FloatingActionButton';
import SomeIcon from '../assets/some_icon.svg';

<FloatingActionButton
  onPress={() => console.log('FAB pressed!')}
  icon={<SomeIcon width={24} height={24} fill="white" />}
  position="bottom-right"
  size="large"
  color="#007AFF"
/>;
```

### GlobalFAB

The main FAB that appears on all screens. Currently configured to navigate to the Camera screen.

**Features:**

- Appears on all screens by default
- Positioned in bottom-right corner
- Uses the app's shutter icon
- Can be controlled via the `useFAB` hook

### useFAB Hook

A custom hook for controlling FAB visibility and state.

**Returns:**

- `fabShow` (boolean): Current visibility state of the FAB
- `showFAB()` (function): Show the FAB
- `hideFAB()` (function): Hide the FAB
- `toggleFAB()` (function): Toggle FAB visibility

**Example:**

```jsx
import {useFAB} from '../hooks/useFAB';

const MyScreen = () => {
  const {fabShow, showFAB, hideFAB, toggleFAB} = useFAB();

  useEffect(() => {
    // Hide FAB when loading
    hideFAB();

    // Show FAB when ready
    setTimeout(() => {
      showFAB();
    }, 2000);
  }, []);

  return (
    // Your screen content
  );
};
```

## Usage Examples

### Basic Usage

The FAB is automatically included in all screens. No additional setup is required.

### Controlling FAB Visibility

```jsx
import {useFAB} from '../hooks/useFAB';

const MyScreen = () => {
  const {hideFAB, showFAB} = useFAB();

  useEffect(() => {
    // Hide FAB during loading
    if (isLoading) {
      hideFAB();
    } else {
      showFAB();
    }
  }, [isLoading]);

  return (
    // Your screen content
  );
};
```

### Custom FAB for Specific Screens

If you need a custom FAB for a specific screen, you can add it alongside the global FAB:

```jsx
import FloatingActionButton from '../components/FloatingActionButton';
import {useFAB} from '../hooks/useFAB';

const MyScreen = () => {
  const {hideFAB} = useFAB();

  // Hide the global FAB
  useEffect(() => {
    hideFAB();
  }, []);

  return (
    <View>
      {/* Your screen content */}

      {/* Custom FAB */}
      <FloatingActionButton
        onPress={handleCustomAction}
        icon={<CustomIcon />}
        position="bottom-left"
        size="medium"
        color="#FF6B6B"
      />
    </View>
  );
};
```

### Multiple FABs

You can have multiple FABs on the same screen by positioning them differently:

```jsx
<View>
  <FloatingActionButton
    onPress={handleAction1}
    icon={<Icon1 />}
    position="bottom-right"
    size="large"
  />

  <FloatingActionButton
    onPress={handleAction2}
    icon={<Icon2 />}
    position="bottom-left"
    size="medium"
  />
</View>
```

## Configuration

### Default Settings

The FAB is enabled by default (`fabShow: true` in InitialState.js).

### Changing Default Behavior

To modify the default FAB behavior, edit the `GlobalFAB` component:

```jsx
// In src/components/GlobalFAB.js
const handleFABPress = () => {
  // Change this to your desired action
  navigation.navigate('YourScreen');
};
```

### Styling

The FAB uses the app's theme colors. You can customize the appearance by modifying the `FloatingActionButton` component or passing custom styles.

## Best Practices

1. **Consistent Positioning**: Use consistent positioning across screens for better UX
2. **Meaningful Actions**: Ensure the FAB performs the most important action for the current screen
3. **Accessibility**: Consider adding accessibility labels for screen readers
4. **Performance**: Hide the FAB when not needed to avoid unnecessary renders
5. **Visual Hierarchy**: Use appropriate sizes and colors to maintain visual hierarchy

## Troubleshooting

### FAB Not Showing

1. Check if `fabShow` is `true` in the global state
2. Verify the `GlobalFAB` component is included in the navigation structure
3. Check for any style conflicts that might be hiding the FAB

### FAB Not Responding

1. Ensure the `onPress` function is properly defined
2. Check if the FAB is disabled
3. Verify there are no overlapping touchable components

### Performance Issues

1. Use the `useFAB` hook to control visibility efficiently
2. Avoid creating multiple FABs unnecessarily
3. Consider using `React.memo` for custom FAB components if needed
