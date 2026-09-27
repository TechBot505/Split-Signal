/**
 * Re-export of the single prefs store (src/lib/prefs.ts). Two stores persisting to the
 * same `ss:prefs` key would overwrite each other, so there is exactly one.
 */
export { usePrefs as usePrefsStore, prefsSnapshot } from "@/lib/prefs";
