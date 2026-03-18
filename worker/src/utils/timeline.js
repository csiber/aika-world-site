/**
 * AIKA WORLD — Activity Timeline Helper
 * Append-only event log for player activity tracking.
 */

export async function logTimelineEvent(env, userId, eventType, title, detail = null, icon = '📋') {
  try {
    const id = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO activity_timeline (id, user_id, event_type, title, detail, icon, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, userId, eventType, title, detail, icon, Math.floor(Date.now() / 1000)).run();
  } catch (e) {
    console.error('Timeline log error:', e);
  }
}

/**
 * Cleanup old timeline events (older than 7 days).
 * Call from scheduled handler.
 */
export async function cleanupTimeline(env) {
  try {
    const cutoff = Math.floor(Date.now() / 1000) - 7 * 86400;
    await env.DB.prepare('DELETE FROM activity_timeline WHERE created_at < ?').bind(cutoff).run();
  } catch (e) {
    console.error('Timeline cleanup error:', e);
  }
}
