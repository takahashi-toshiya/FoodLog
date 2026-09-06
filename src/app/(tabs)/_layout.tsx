import { Tabs, usePathname, useRouter } from "expo-router";

import { AppTabBar, type AppTabKey } from "@/shared/components/AppTabBar";

export default function TabLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const activeTab = getActiveTab(pathname);

  function handleSelectTab(tab: AppTabKey) {
    if (tab === "today") {
      router.replace("/today");
    }

    if (tab === "library") {
      router.replace("/library");
    }

    if (tab === "settings") {
      router.replace("/settings");
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
      <Tabs.Screen name="settings" options={{ title: "設定" }} />
    </Tabs>
  );
}

function getActiveTab(pathname: string): AppTabKey {
  if (pathname.startsWith("/settings")) {
    return "settings";
  }

  if (pathname === "/library") {
    return "library";
  }

  return "today";
}
