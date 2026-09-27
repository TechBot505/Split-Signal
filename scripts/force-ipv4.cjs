// Build-environment shim (sandbox only). This dev box has no IPv6 route, and
// Node's global fetch (undici) races A/AAAA and stalls on the dead IPv6 path,
// so next/font/google downloads time out even though IPv4 works. Forcing DNS
// to IPv4 fixes it. Load via NODE_OPTIONS="--require ./scripts/force-ipv4.cjs".
// Not imported by the app; has no effect in normal (dual-stack) environments.
// This is a CommonJS (.cjs) file loaded via `node --require`; it must use
// require() (ESM import is not available in a --require entrypoint), so the
// no-require-imports rule does not apply here.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const dns = require("node:dns");

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // older node: ignore
}

function force4(orig) {
  return function (hostname, options, cb) {
    if (typeof options === "function") {
      cb = options;
      options = {};
    }
    const opts = { ...(typeof options === "object" ? options : {}), family: 4 };
    return orig.call(this, hostname, opts, cb);
  };
}

dns.lookup = force4(dns.lookup);
if (dns.promises && dns.promises.lookup) {
  const origP = dns.promises.lookup;
  dns.promises.lookup = function (hostname, options) {
    const opts = {
      ...(typeof options === "object" ? options : {}),
      family: 4,
    };
    return origP.call(this, hostname, opts);
  };
}
