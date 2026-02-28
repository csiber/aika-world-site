/**
 * Bot browser notifications — csak ha a tab háttérben van
 */

const ICON = '/favicon.ico';

export function getPermissionState() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export async function requestPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied')  return 'denied';
  return Notification.requestPermission();
}

export function sendNotification(title, body) {
  if (!document.hidden)                        return; // csak háttérben
  if (!('Notification' in window))             return;
  if (Notification.permission !== 'granted')   return;
  try {
    new Notification(title, { body, icon: ICON, tag: 'aika-bot', silent: false });
  } catch (_) { /* egyes böngészők tilthatják */ }
}
