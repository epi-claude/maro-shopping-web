import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function deleteTempAdminUser({ container }: ExecArgs) {
  const userModuleService = container.resolve(Modules.USER)
  const [users] = await userModuleService.listAndCountUsers({
    email: "claude-temp@episolve.com",
  })

  if (!users.length) {
    console.log("No temp admin user found, nothing to delete.")
    return
  }

  for (const user of users) {
    await userModuleService.deleteUsers([user.id])
    console.log(`Deleted user ${user.id} (${user.email})`)
  }
}
