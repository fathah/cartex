import { getSettings } from "@/actions/settings";
import SettingsContainer from "./settings-container";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <SettingsContainer initialSettings={settings} />
    </div>
  );
}
