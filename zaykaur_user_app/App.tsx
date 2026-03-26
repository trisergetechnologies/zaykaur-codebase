import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { RootNavigator } from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <RootNavigator />
        <StatusBar style="auto" />
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
