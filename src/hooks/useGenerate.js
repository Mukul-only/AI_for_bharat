// ── useGenerate — Async API call with loading, error, and cancellation ──

import { useState, useCallback, useRef, useEffect } from "react";
import { showSuccess, showError } from "../utils/constants";

/**
 * Hook for executing async API calls with built-in:
 * - Loading state management
 * - AbortController for cancellation on unmount
 * - Request deduplication (prevents double-click)
 * - Toast notifications
 *
 * @param {Function} apiFn - The async API function to call
 * @param {{ successMessage?: string, errorPrefix?: string, accent?: string }} opts
 * @returns {{ execute: Function, loading: boolean, cancel: Function }}
 */
export default function useGenerate(apiFn, opts = {}) {
  const {
    successMessage = "Done!",
    errorPrefix = "Failed",
    accent = "violet",
  } = opts;

  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Cancel any in-flight request on unmount
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const execute = useCallback(
    async (...args) => {
      // Prevent duplicate calls while one is in-flight
      if (loading) return null;

      // Cancel previous request if somehow still pending
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      setLoading(true);
      try {
        const result = await apiFn(...args, {
          signal: abortRef.current.signal,
        });
        if (mountedRef.current) {
          showSuccess(successMessage, { accent });
        }
        return result;
      } catch (err) {
        if (err.name === "AbortError") return null;
        if (mountedRef.current) {
          showError(`${errorPrefix}: ${err.message}`);
        }
        return null;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          abortRef.current = null;
        }
      }
    },
    [apiFn, loading, successMessage, errorPrefix, accent],
  );

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  return { execute, loading, cancel };
}
