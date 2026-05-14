import { ModuleProviderExports } from '@medusajs/framework/types'
import { PaywisePaymentService } from './service'

const services = [PaywisePaymentService]

const providerExport: ModuleProviderExports = { services }

export default providerExport
