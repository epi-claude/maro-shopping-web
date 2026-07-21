import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createShippingOptionsWorkflow } from "@medusajs/medusa/core-flows";

// One-off script: adds a $0 "Free Shipping" option alongside the existing
// paid shipping option(s), so low-value test orders (e.g. the $1
// bank-transfer test product) aren't inflated by shipping cost. Mirrors
// the service zone / shipping profile / provider of an existing shipping
// option rather than hardcoding IDs.

const OPTION_NAME = "Free Shipping";

export default async function addFreeShippingOption({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: existingFree } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name"],
    filters: { name: OPTION_NAME },
  });
  if (existingFree.length) {
    logger.info(`[${OPTION_NAME}] already exists (id: ${existingFree[0].id}), skipping`);
    return;
  }

  const { data: shippingOptions } = await query.graph({
    entity: "shipping_option",
    fields: [
      "id",
      "name",
      "provider_id",
      "service_zone_id",
      "shipping_profile_id",
      "price_type",
      "prices.currency_code",
      "prices.region_id",
      "rules.attribute",
      "rules.operator",
      "rules.value",
    ],
  });

  if (!shippingOptions.length) {
    throw new Error("No existing shipping options found to model the free option on");
  }

  const template = shippingOptions[0];
  logger.info(`Modeling free option on existing option: ${JSON.stringify({ id: template.id, name: template.name })}`);

  const currencyCodes: string[] = Array.from(
    new Set(
      (template.prices ?? [])
        .filter((p: any) => p.currency_code)
        .map((p: any) => p.currency_code as string)
    )
  );
  const regionIds: string[] = Array.from(
    new Set(
      (template.prices ?? [])
        .filter((p: any) => p.region_id)
        .map((p: any) => p.region_id as string)
    )
  );

  const prices = [
    ...currencyCodes.map((currency_code) => ({ currency_code, amount: 0 })),
    ...regionIds.map((region_id) => ({ region_id, amount: 0 })),
  ];

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: OPTION_NAME,
        price_type: "flat",
        provider_id: template.provider_id,
        service_zone_id: template.service_zone_id,
        shipping_profile_id: template.shipping_profile_id,
        type: {
          label: "Free",
          description: "Free shipping — testing only.",
          code: "free-shipping-test",
        },
        prices,
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
    ],
  });

  logger.info(`CREATED_FREE_SHIPPING_OPTION on service_zone_id=${template.service_zone_id}, shipping_profile_id=${template.shipping_profile_id}`);
}
