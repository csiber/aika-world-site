/**
 * Tracks quest progress for a user when they perform game actions.
 * Called from route handlers after successful actions.
 *
 * @param {object} env - Worker env with DB binding
 * @param {string} userId - User ID
 * @param {string} questType - Quest type key (e.g. 'spy', 'attack', 'build_ship', 'trade', 'mine_metal')
 * @param {number} amount - Progress increment (default 1)
 */
export async function trackQuestProgress(env, userId, questType, amount = 1) {
  try {
    await env.DB.prepare(
      `UPDATE user_quests
       SET current = MIN(current + ?1, required)
       WHERE user_id = ?2
         AND quest_type = ?3
         AND is_claimed = 0
         AND expires_at > ?4`
    ).bind(amount, userId, questType, Date.now()).run();
  } catch (e) {
    // Quest tracking is non-critical — log but don't fail the parent action
    console.error('Quest tracking error:', e.message);
  }
}
