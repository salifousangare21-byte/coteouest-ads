import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Configuration minimale : toutes nos routes sont dynamiques (auth, upload),
// pas besoin du cache incrémental R2 pour cette v1.
export default defineCloudflareConfig();
