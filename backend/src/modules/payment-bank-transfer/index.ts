import { ModuleProviderExports } from '@medusajs/framework/types'
import { BankTransferPaymentService } from './service'

const services = [BankTransferPaymentService]

const providerExport: ModuleProviderExports = { services }

export default providerExport
