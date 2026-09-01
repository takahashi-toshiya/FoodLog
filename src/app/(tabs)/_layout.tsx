import { Tabs, usePathname, useRouter } from "expo-router";

import { AppTabBar, type AppTabKey } from "@/shared/components/AppTabBar";

export default function TabLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const activeTab: AppTabKey = pathname === "/library" ? "library" : "today";

  function handleSelectTab(tab: AppTabKey) {
    if (tab === "today") {
      router.replace("/today");
    }

    if (tab === "library") {
      router.replace("/library");
    }
  }

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={() => (
        <AppTabBar activeTab={activeTab} onSelectTab={handleSelectTab} />
      )}
    >
      <Tabs.Screen name="today" options={{ title: "今日" }} />
      <Tabs.Screen name="library" options={{ title: "ライブラリ" }} />
    </Tabs>
  );
}
