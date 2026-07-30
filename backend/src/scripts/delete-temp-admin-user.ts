import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function deleteTempAdminUser({ container }: ExecArgs) {
  const userModuleService = container.resolve(Modules.USER)
  const authModuleService = container.resolve(Modules.AUTH)

  const [users] = await userModuleService.listAndCountUsers({
    email: "claude-temp@episolve.com",
  })

  for (const user of users) {
    await userModuleService.deleteUsers([user.id])
    console.log(`Deleted user ${user.id} (${user.email})`)
  }

  const providerIdentities = await authModuleService.listProviderIdentities({
    entity_id: "claude-temp@episolve.com",
  })

  const authIdentityIds = [
    ...new Set(providerIdentities.map((p) => p.auth_identity_id)),
  ]

  for (const id of authIdentityIds) {
    await authModuleService.deleteAuthIdentities([id])
    console.log(`Deleted auth identity ${id}`)
  }

  if (!users.length && !authIdentityIds.length) {
    console.log("No temp admin user or auth identity found, nothing to delete.")
  }
}
