/**
 * Public engine surface. The transport (Cloudflare Durable Object) drives the
 * game entirely through these pure functions:
 *   createRoom → apply(msg) / tick(now) / handleDisconnect → viewFor(player).
 */
export type { Effect, Transition } from "./effects";
export { createRoom, handleDisconnect } from "./room";
export { apply } from "./apply";
export { tick } from "./stage";
export { viewFor } from "./view";
export { MODE_CONFIG, HINTS_PER_RUN, MAX_STRIKES } from "./config";
export { scoreRun, buildRecord } from "./score";
