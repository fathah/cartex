import { getAIAutomationSettings, getSettings } from "@/actions/settings";
import SettingsContainer from "./SettingsContainer";

export default async function SettingsPage() {
  const [settings, aiAutomationSettings] = await Promise.all([
    getSettings(),
    getAIAutomationSettings(),
  ]);

  return (
    <div>
      <SettingsContainer
        initialSettings={settings}
        aiAutomationSettings={aiAutomationSettings}
      />
    </div>
  );
}
