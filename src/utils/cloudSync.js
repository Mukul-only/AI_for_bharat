// ── NexusFlow Cloud Sync — Syncs user data with DynamoDB via API ──

const API_URL = import.meta.env.VITE_API_URL || "";

/**
 * Save user data to the cloud (profile + workflows).
 * @param {string} userId
 * @param {object} data - { profile?, workflows? }
 */
export async function saveUserDataToCloud(userId, data) {
  if (!API_URL || !userId) return null;

  try {
    const response = await fetch(
      `${API_URL}/user/${encodeURIComponent(userId)}/data`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      console.warn("Cloud save failed:", response.status);
      return null;
    }

    return await response.json();
  } catch (err) {
    console.warn("Cloud sync error (save):", err.message);
    return null;
  }
}

/**
 * Load user data from the cloud.
 * @param {string} userId
 * @returns {{ profile: object|null, workflows: object, savedAt: string|null }}
 */
export async function loadUserDataFromCloud(userId) {
  if (!API_URL || !userId) return null;

  try {
    const response = await fetch(
      `${API_URL}/user/${encodeURIComponent(userId)}/data`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      console.warn("Cloud load failed:", response.status);
      return null;
    }

    return await response.json();
  } catch (err) {
    console.warn("Cloud sync error (load):", err.message);
    return null;
  }
}

/**
 * Sync local data with cloud: load from cloud first, merge, save back.
 * Cloud data takes priority for profile; local takes priority for newer workflows.
 * @param {string} userId
 * @param {object} localProfile - current local profile
 * @param {object} localWorkflows - current local workflows (keyed by id)
 * @returns {{ profile: object|null, workflows: object }} merged data
 */
export async function syncUserData(userId, localProfile, localWorkflows) {
  if (!API_URL || !userId) {
    return { profile: localProfile, workflows: localWorkflows };
  }

  try {
    // 1. Load cloud data
    const cloudData = await loadUserDataFromCloud(userId);

    if (!cloudData) {
      // Cloud unreachable — use local data, try to save it
      await saveUserDataToCloud(userId, {
        profile: localProfile,
        workflows: localWorkflows,
      });
      return { profile: localProfile, workflows: localWorkflows };
    }

    // 2. Merge workflows (keep the newest version of each)
    const mergedWorkflows = { ...(cloudData.workflows || {}) };

    if (localWorkflows) {
      Object.keys(localWorkflows).forEach((id) => {
        const local = localWorkflows[id];
        const cloud = mergedWorkflows[id];

        if (!cloud || (local.updatedAt || 0) > (cloud.updatedAt || 0)) {
          mergedWorkflows[id] = local;
        }
      });
    }

    // 3. Merge profile (use local if exists, otherwise cloud)
    const mergedProfile = localProfile || cloudData.profile || null;

    // 4. Save merged data back to cloud
    await saveUserDataToCloud(userId, {
      profile: mergedProfile,
      workflows: mergedWorkflows,
    });

    return { profile: mergedProfile, workflows: mergedWorkflows };
  } catch (err) {
    console.warn("Sync failed, using local data:", err.message);
    return { profile: localProfile, workflows: localWorkflows };
  }
}
