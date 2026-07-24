import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { IOrderModuleService } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'
import { uploadFilesWorkflow } from '@medusajs/core-flows'

export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const { id } = req.params
  const file = req.file

  if (!file) {
    res.status(400).json({ message: 'No file was uploaded' })
    return
  }

  const orderModuleService: IOrderModuleService = req.scope.resolve(Modules.ORDER)
  const order = await orderModuleService.retrieveOrder(id).catch(() => null)

  if (!order) {
    res.status(404).json({ message: 'Order not found' })
    return
  }

  const { result } = await uploadFilesWorkflow(req.scope).run({
    input: {
      files: [
        {
          filename: `payment-proof-${order.display_id}-${Date.now()}-${file.originalname}`,
          mimeType: file.mimetype,
          content: file.buffer.toString('base64'),
          access: 'public',
        },
      ],
    },
  })

  const uploadedFile = result[0]

  await orderModuleService.updateOrders(id, {
    metadata: {
      ...order.metadata,
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
