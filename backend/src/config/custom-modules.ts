import { Modules } from '@medusajs/framework/utils'
import {
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
  R2_ENDPOINT,
  R2_PUBLIC_URL,
  RESEND_API_KEY,
  RESEND_FROM_EMAIL,
  SENDGRID_API_KEY,
  SENDGRID_FROM_EMAIL,
  STRIPE_API_KEY,
  STRIPE_WEBHOOK_SECRET,
  BACKEND_URL,
} from 'lib/constants'
import { paymentProviders } from './payments'

// All Maro-specific module overrides live here.
// medusa-config.js spreads this array — never add Maro modules directly there.

const customModules: object[] = [
  // ── File storage ──────────────────────────────────────────────
  {
    key: Modules.FILE,
    resolve: '@medusajs/file',
    options: {
      providers: [
        ...(R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY
          ? [{
              resolve: '@medusajs/medusa/file-s3',
              id: 's3',
              options: {
                file_url: R2_PUBLIC_URL,
                access_key_id: R2_ACCESS_KEY_ID,
                secret_access_key: R2_SECRET_ACCESS_KEY,
                region: 'auto',
                bucket: R2_BUCKET,
                endpoint: R2_ENDPOINT,
                additional_client_config: { forcePathStyle: true },
              },
            }]
          : [{
              resolve: '@medusajs/file-local',
              id: 'local',
              options: {
                upload_dir: 'static',
                backend_url: `${BACKEND_URL}/static`,
              },
            }]),
      ],
    },
  },

  // ── Notifications ─────────────────────────────────────────────
  ...((SENDGRID_API_KEY && SENDGRID_FROM_EMAIL) || (RESEND_API_KEY && RESEND_FROM_EMAIL)
    ? [{
        key: Modules.NOTIFICATION,
        resolve: '@medusajs/notification',
        options: {
          providers: [
            ...(SENDGRID_API_KEY && SENDGRID_FROM_EMAIL
              ? [{
                  resolve: '@medusajs/notification-sendgrid',
                  id: 'sendgrid',
                  options: { channels: ['email'], api_key: SENDGRID_API_KEY, from: SENDGRID_FROM_EMAIL },
                }]
              : []),
            ...(RESEND_API_KEY && RESEND_FROM_EMAIL
              ? [{
                  resolve: './src/modules/email-notifications',
                  id: 'resend',
                  options: { channels: ['email'], api_key: RESEND_API_KEY, from: RESEND_FROM_EMAIL },
                }]
              : []),
          ],
        },
      }]
    : []),

  // ── Payment ───────────────────────────────────────────────────
  ...(paymentProviders.length > 0
    ? [{
        key: Modules.PAYMENT,
        resolve: '@medusajs/payment',
        options: { providers: paymentProviders },
      }]
    : []),
]

export default customModules
