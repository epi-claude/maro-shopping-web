import { ModuleProviderExports } from '@medusajs/framework/types'
import { CodPaymentService } from './service'

const services = [CodPaymentService]

const providerExport: ModuleProviderExports = { services }

export default providerExport
