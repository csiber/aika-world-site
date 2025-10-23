/// <reference types="@cloudflare/workers-types" />
export {};

declare global {
  // Itt nevezd el a bindigeket, ha lesznek (KV, R2, stb.)
  // Példák (későbbre):
  // interface Env {
  //   MY_KV: KVNamespace;
  //   MY_R2: R2Bucket;
  // }
}
