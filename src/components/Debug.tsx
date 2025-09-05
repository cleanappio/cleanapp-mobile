import {View, Button} from 'react-native';
import {useDebugLogger} from '../hooks/useDebugLogger';

const Debug = () => {
  const {
    isMonitoring,
    debugData,
    logs,
    startMonitoring,
    stopMonitoring,
    clearLogs,
    printSummary,
  } = useDebugLogger();

  return (
    <View>
      <Button title="Start Monitoring" onPress={startMonitoring} />
      <Button title="Stop Monitoring" onPress={stopMonitoring} />
      <Button title="Print Summary" onPress={printSummary} />
      <Button title="Clear Logs" onPress={clearLogs} />
    </View>
  );
};

export default Debug;
