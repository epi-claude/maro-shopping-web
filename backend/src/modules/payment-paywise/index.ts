import { ModuleProviderExports } from '@medusajs/framework/types'
import { PaywisePaymentService } from './service'

const providerExport: ModuleProviderExports = {
  services: [PaywisePaymentService] as unknown as ModuleProviderExports['services'],
}

export default providerExport
