// ── NexusFlow Workflow Manager ──
// Manages multiple workflows in localStorage (per-user isolated)

let _currentUserId = null;

/**
 * Set the current user ID for per-user data isolation.
 * Must be called after login, before any read/write operations.
 */
export function setCurrentUserId(userId) {
  _currentUserId = userId;
}

function getStorageKey() {
  const prefix = _currentUserId ? `nexusflow_${_currentUserId}` : "nexusflow";
  return `${prefix}_workflows`;
}

/**
 * Returns the per-user profile storage key.
 */
export function getProfileKey() {
  return _currentUserId
    ? `nexusflow_${_currentUserId}_profile`
    : "nexusflow_profile";
}

function generateId() {
  return `wf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function readStore() {
  try {
    const raw = localStorage.getItem(getStorageKey());
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(store) {
  localStorage.setItem(getStorageKey(), JSON.stringify(store));
}

/**
 * Returns array of workflow metadata (sorted by updatedAt descending).
 */
export function getAllWorkflows() {
  const store = readStore();
  return Object.values(store).sort(
    (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0),
  );
}

/**
 * Returns full workflow data by ID, or null.
 */
export function getWorkflow(id) {
  const store = readStore();
  return store[id] || null;
}

/**
 * Creates a new empty workflow and returns its data.
 */
export function createWorkflow(name = "Untitled Workflow") {
  const store = readStore();
  const id = generateId();
  const now = Date.now();
  const workflow = {
    id,
    name,
    nodes: [],
    edges: [],
    nodeCount: 0,
    edgeCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  store[id] = workflow;
  writeStore(store);
  return workflow;
}

/**
 * Saves/updates a workflow. Creates if it doesn't exist.
 */
export function saveWorkflowData(id, nodes, edges, metadata = {}) {
  const store = readStore();
  const existing = store[id] || {};
  store[id] = {
    ...existing,
    id,
    name: metadata.name || existing.name || "Untitled Workflow",
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: {
        ...n.data,
        onUpdate: undefined,
        onOutputChange: undefined,
        onImageChange: undefined,
        onRepurpose: undefined,
        userProfile: undefined,
      },
    })),
    edges,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    createdAt: existing.createdAt || Date.now(),
    updatedAt: Date.now(),
  };
  writeStore(store);
  // Auto-push to cloud (debounced)
  pushToCloud();
  return store[id];
}

/**
 * Deletes a workflow by ID.
 */
export function deleteWorkflow(id) {
  const store = readStore();
  delete store[id];
  writeStore(store);
}

/**
 * Duplicates a workflow with a new ID.
 */
export function duplicateWorkflow(id) {
  const store = readStore();
  const original = store[id];
  if (!original) return null;

  const newId = generateId();
  const now = Date.now();
  store[newId] = {
    ...JSON.parse(JSON.stringify(original)),
    id: newId,
    name: `${original.name} (Copy)`,
    createdAt: now,
    updatedAt: now,
  };
  writeStore(store);
  return store[newId];
}

/**
 * Renames a workflow.
 */
export function renameWorkflow(id, newName) {
  const store = readStore();
  if (!store[id]) return null;
  store[id].name = newName;
  store[id].updatedAt = Date.now();
  writeStore(store);
  return store[id];
}

/**
 * Migrate existing autosave data into workflows if any exists.
 */
export function migrateAutoSave() {
  const store = readStore();
  if (Object.keys(store).length > 0) return; // Already has workflows

  try {
    const saved = localStorage.getItem("nexusflow_autosave");
    if (saved) {
      const state = JSON.parse(saved);
      if (state.nodes?.length > 0) {
        const id = generateId();
        const now = Date.now();
        store[id] = {
          id,
          name: "My Content Workspace",
          nodes: state.nodes,
          edges: state.edges || [],
          nodeCount: state.nodes.length,
          edgeCount: (state.edges || []).length,
          createdAt: now,
          updatedAt: now,
        };
        writeStore(store);
      }
    }
  } catch {
    // Silently fail — migration is best-effort
  }
}

// ── Cloud Sync Integration ──
import { syncUserData, saveUserDataToCloud } from "./cloudSync";

let _syncInProgress = false;
let _syncTimer = null;

/**
 * Returns the raw workflow store object (for cloud sync).
 */
export function getWorkflowStore() {
  return readStore();
}

/**
 * Replaces the local workflow store (used when loading from cloud).
 */
export function setWorkflowStore(store) {
  writeStore(store);
}

/**
 * Sync local workflows with cloud on login.
 * Returns the merged profile.
 */
export async function syncWithCloud(localProfile) {
  if (!_currentUserId || _syncInProgress) return localProfile;

  _syncInProgress = true;
  try {
    const localWorkflows = readStore();
    const result = await syncUserData(
      _currentUserId,
      localProfile,
      localWorkflows,
    );

    // Update local storage with merged data
    if (result.workflows) {
      writeStore(result.workflows);
    }

    return result.profile || localProfile;
  } catch (err) {
    console.warn("Cloud sync failed:", err.message);
    return localProfile;
  } finally {
    _syncInProgress = false;
  }
}

/**
 * Debounced push of current local data to cloud.
 * Called automatically after every write operation.
 */
export function pushToCloud(profile) {
  if (!_currentUserId) return;

  // Debounce: wait 2 seconds after last write before pushing
  clearTimeout(_syncTimer);
  _syncTimer = setTimeout(async () => {
    try {
      const workflows = readStore();
      await saveUserDataToCloud(_currentUserId, {
        profile: profile || undefined,
        workflows,
      });
    } catch {
      // Silent fail — local data is the source of truth
    }
  }, 2000);
}
