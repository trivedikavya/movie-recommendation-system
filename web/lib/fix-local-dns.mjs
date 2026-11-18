// LOCAL DEV ONLY WORKAROUND: the default DNS resolver on this network
// fails to resolve Neon's long compute hostnames (confirmed Google's
// 8.8.8.8 resolves them fine). This affects BOTH fetch() calls (used by
// the Neon HTTP driver) and raw WebSocket/TCP connections (used by the
// `ws` package for Prisma's pooled adapter) -- so instead of patching each
// library separately, this monkey-patches Node's own `dns.lookup`, which
// every one of those code paths ultimately calls under the hood.
// Not needed on Vercel (its network resolves Neon normally).
import dns from "node:dns";

const resolver = new dns.promises.Resolver();
resolver.setServers(["8.8.8.8", "1.1.1.1"]);

const originalLookup = dns.lookup;

dns.lookup = function patchedLookup(hostname, options, callback) {
  const cb = typeof options === "function" ? options : callback;
  const opts = typeof options === "function" ? {} : options || {};
  const wantsAll = opts && opts.all;

  resolver
    .resolve4(hostname)
    .then((addresses) => {
      if (wantsAll) cb(null, addresses.map((address) => ({ address, family: 4 })));
      else cb(null, addresses[0], 4);
    })
    .catch(() =>
      resolver
        .resolve6(hostname)
        .then((addresses) => {
          if (wantsAll) cb(null, addresses.map((address) => ({ address, family: 6 })));
          else cb(null, addresses[0], 6);
        })
        .catch(() => {
          // Last resort: fall back to the original OS resolver in case this
          // is a totally different hostname our override doesn't need to help with.
          originalLookup(hostname, options, callback);
        })
    );
};
