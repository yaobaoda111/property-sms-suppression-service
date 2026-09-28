import { z } from "zod";
import { infrai } from "./infrai.js";

export const smsRequest = z.object({
  kind: z.enum(["maintenance", "tenant_document", "inspection_reminder"]),
  tenantPhone: z.string().min(7),
  tenantName: z.string().min(1),
  details: z.string().min(1),
  optedOut: z.boolean().default(false),
});
export type SmsRequest = z.infer<typeof smsRequest>;

export function decideSms(input: unknown) {
  const request = smsRequest.parse(input);
  if (request.optedOut) return { status: "suppressed" as const, reason: "tenant_opted_out", kind: request.kind };
  return { status: "ready" as const, kind: request.kind, tenantPhone: request.tenantPhone, tenantName: request.tenantName, details: request.details };
}

export async function sendPropertySms(input: unknown) {
  const decision = decideSms(input);
  if (decision.status === "suppressed") return decision;
  const delivery = await infrai.sms.batch.send([{ to: decision.tenantPhone, body: `${decision.tenantName}: ${decision.details}` }]);
  return { ...decision, delivery };
}
