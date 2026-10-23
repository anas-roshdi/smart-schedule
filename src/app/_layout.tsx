import { Stack } from "expo-router"
import { useEffect } from "react"
import { I18nManager } from "react-native"
import { DialogProvider } from "../components/ui/dialog-provider"
import { ColdStartBanner } from "../components/ui/cold-start-banner"
import { pingHealth } from "../lib/api"
import "../global.css"

I18nManager.allowRTL(true)
I18nManager.forceRTL(true)

export default function RootLayout() {
  useEffect(() => {
    pingHealth()
  }, [])

  return (
    <DialogProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none",
        }}
      />
      <ColdStartBanner />
    </DialogProvider>
  )
}