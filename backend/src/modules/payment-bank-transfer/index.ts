import { ModuleProviderExports } from '@medusajs/framework/types'
import { BankTransferPaymentService } from './service'

const providerExport: ModuleProviderExports = {
  services: [BankTransferPaymentService] as unknown as ModuleProviderExports['services'],
}

export default providerExport
