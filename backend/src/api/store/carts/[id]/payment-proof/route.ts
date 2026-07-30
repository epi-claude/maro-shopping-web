import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { ICartModuleService } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'
import { uploadFilesWorkflow } from '@medusajs/core-flows'

export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const { id } = req.params
  const file = req.file

  if (!file) {
    res.status(400).json({ message: 'No file was uploaded' })
    return
  }

  const cartModuleService: ICartModuleService = req.scope.resolve(Modules.CART)
  const cart = await cartModuleService.retrieveCart(id).catch(() => null)

  if (!cart) {
    res.status(404).json({ message: 'Cart not found' })
    return
  }

  const { result } = await uploadFilesWorkflow(req.scope).run({
    input: {
      files: [
        {
          filename: `payment-proof-cart-${cart.id}-${Date.now()}-${file.originalname}`,
          mimeType: file.mimetype,
          content: file.buffer.toString('base64'),
          access: 'public',
        },
      ],
    },
  })

  const uploadedFile = result[0]

  await cartModuleService.updateCarts(id, {
    metadata: {
      ...cart.metadata,
      payment_proof_url: uploadedFile.url,
      payment_proof_status: 'pending_review',
      payment_proof_uploaded_at: new Date().toISOString(),
    },
  })

  res.status(200).json({
    payment_proof_url: uploadedFile.url,
    payment_proof_status: 'pending_review',
  })
}
