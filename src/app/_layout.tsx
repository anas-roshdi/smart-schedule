import { Stack } from "expo-router"
import { I18nManager } from "react-native"
import { DialogProvider } from "../components/ui/dialog-provider"
import "../global.css"

I18nManager.allowRTL(true)
I18nManager.forceRTL(true)

export default function RootLayout() {
  return (
    <DialogProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none",
        }}
      />
    </DialogProvider>
  )
}