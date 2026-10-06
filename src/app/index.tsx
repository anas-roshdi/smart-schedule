import { View } from "react-native"
import { router } from "expo-router"
import { AuthContainer } from "../components/auth/auth-container"

export default function Index() {
  const handleAuthSuccess = () => {
    // Navigate to the main app dashboard/schedule page using Expo Router
    router.replace('/(main)/schedule-planner')
  }

  return (
    <View style={{ flex: 1 }}>
      <AuthContainer onAuthSuccess={handleAuthSuccess} />
    </View>
  )
}
