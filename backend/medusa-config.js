import { loadEnv, Modules, defineConfig } from '@medusajs/utils';

let constantsModule;
let customModules;
try {
  constantsModule = require('lib/constants');
  customModules = require('./src/config/custom-modules').default;
} catch (e) {
  // Medusa's own config loader silently swallows errors thrown while loading
  // this file during `medusa build` (throwOnError: false), which surfaces
  // only as a confusing downstream "Cannot read properties of null (reading
  // 'admin')". Log the real cause loudly before it gets discarded.
  console.error('[medusa-config] FATAL error loading local modules:', e);
  throw e;
}

const {
  ADMIN_CORS,
  AUTH_CORS,
  BACKEND_URL,
  COOKIE_SECRET,
  DATABASE_URL,
  JWT_SECRET,
  REDIS_URL,
  SHOULD_DISABLE_ADMIN,
  STORE_CORS,
  WORKER_MODE,
  MEILISEARCH_HOST,
  MEILISEARCH_ADMIN_KEY
} = constantsModule;

loadEnv(process.env.NODE_ENV, process.cwd());

const medusaConfig = {
  projectConfig: {
    databaseUrl: DATABASE_URL,
    databaseLogging: false,
    redisUrl: REDIS_URL,
    workerMode: WORKER_MODE,
    http: {
      adminCors: ADMIN_CORS,
      authCors: AUTH_CORS,
      storeCors: STORE_CORS,
      jwtSecret: JWT_SECRET,
      cookieSecret: COOKIE_SECRET
    },
    build: {
      rollupOptions: {
        external: ["@medusajs/dashboard", "@medusajs/admin-shared"]
      }
    }
  },
  admin: {
    backendUrl: BACKEND_URL,
    disable: SHOULD_DISABLE_ADMIN,
  },
  modules: [
    // Infrastructure modules (Redis — upstream owned)
    ...(REDIS_URL ? [{
      key: Modules.EVENT_BUS,
      resolve: '@medusajs/event-bus-redis',
      options: { redisUrl: REDIS_URL }
    },
    {
      key: Modules.WORKFLOW_ENGINE,
      resolve: '@medusajs/workflow-engine-redis',
      options: { redis: { url: REDIS_URL } }
    }] : []),

    // Maro-specific modules (R2, payments, notifications)
    ...customModules,
  ],
  plugins: [
    ...(MEILISEARCH_HOST && MEILISEARCH_ADMIN_KEY ? [{
      resolve: '@rokmohar/medusa-plugin-meilisearch',
      options: {
        config: { host: MEILISEARCH_HOST, apiKey: MEILISEARCH_ADMIN_KEY },
        settings: {
          products: {
            type: 'products',
            enabled: true,
            fields: ['id', 'title', 'description', 'handle', 'variant_sku', 'thumbnail'],
            indexSettings: {
              searchableAttributes: ['title', 'description', 'variant_sku'],
              displayedAttributes: ['id', 'handle', 'title', 'description', 'variant_sku', 'thumbnail'],
              filterableAttributes: ['id', 'handle'],
            },
            primaryKey: 'id',
          }
        }
      }
    }] : [])
  ]
};

console.log(JSON.stringify(medusaConfig, null, 2));
export default defineConfig(medusaConfig);
