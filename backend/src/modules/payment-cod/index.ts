import { ModuleProviderExports } from '@medusajs/framework/types'
import { CodPaymentService } from './service'

const providerExport: ModuleProviderExports = {
  services: [CodPaymentService] as unknown as ModuleProviderExports['services'],
}

export default providerExport
