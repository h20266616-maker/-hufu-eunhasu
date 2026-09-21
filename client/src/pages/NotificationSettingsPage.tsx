import { ScreenHeader } from '../components/ScreenHeader';
import { Card } from '../components/ui/Card';
import { Toggle } from '../components/ui/Toggle';
import { useApp } from '../context/AppContext';
import { NOTIFICATION_SETTINGS } from '../data';

export function NotificationSettingsPage() {
  const { notificationPrefs, setNotificationPref } = useApp();

  return (
    <div className="page">
      <ScreenHeader title="알림 설정" />
      <ul className="plain-list">
        {NOTIFICATION_SETTINGS.map((setting) => (
          <li key={setting.id}>
            <Card className="row">
              <div>
                <strong>{setting.label}</strong>
                <div className="sm">{setting.description}</div>
              </div>
              <Toggle
                checked={notificationPrefs[setting.id]}
                onChange={(next) => setNotificationPref(setting.id, next)}
                label={setting.label}
              />
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
