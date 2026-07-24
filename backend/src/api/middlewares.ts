import multer from 'multer'
import { defineMiddlewares } from '@medusajs/framework/http'

// In-memory storage: files are handed off to uploadFilesWorkflow as a
// base64 buffer, same approach Medusa core uses for /admin/uploads.
const uploadPaymentProof = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(file.mimetype)) {
      cb(new Error('Only image uploads (JPEG, PNG, WEBP, HEIC) are allowed'))
      return
    }
    cb(null, true)
  },
})

export default defineMiddlewares({
  routes: [
    {
      method: ['POST'],
      matcher: '/store/orders/:id/payment-proof',
      middlewares: [uploadPaymentProof.single('file')],
    },
  ],
})
