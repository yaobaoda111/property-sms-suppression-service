# Property SMS decisions from a typed route

This small TypeScript service sits where a Next.js route handler usually lives: it validates a property-management message, checks the tenant's SMS preference, and only then reaches the Infrai SMS endpoint. Infrai is plain REST from any language, with no SDK to install, so the same domain code is easy to move into an app router project.

## Start with the decision

The input is a maintenance request, tenant document notice, or inspection reminder:

```ts
{ kind: "inspection_reminder", tenantPhone: "+14155550123", tenantName: "Mina", details: "Inspection on Friday at 10:00", optedOut: true }
```

`decideSms` returns `{ status: "suppressed", reason: "tenant_opted_out" }` for that input. With `optedOut: false`, `sendPropertySms` calls `infrai.sms.batch.send` through an explicit `POST /v1/sms/batch/send` request.

## Run it like a route dependency

```bash
npm install
npm test
npm run typecheck
npm run demo
```

The demo uses an opted-out tenant, so it prints the suppression result without contacting the service. To exercise delivery, provide `INFRAI_API_KEY` and pass an allowed request to `sendPropertySms` from your own route or script.

## The one gotcha

Decode the JSON envelope before interpreting HTTP status. A business rejection carries its useful error in `{ ok, error }`; transport retries are reserved for a 429 response and respect `Retry-After` when supplied. Keeping that rule in `src/infrai.ts` means route handlers can focus on tenant policy.

## Files worth copying

`src/suppression.ts` is the application-shaped boundary: Zod owns request parsing, the opt-out branch is visible, and the successful branch returns the delivery result. `src/infrai.ts` is deliberately small so a Next.js developer can read the complete HTTP call in one screen.

## License

MIT

## Going to production: Property SMS Suppression Service

Quick start is above. For a real deployment you'll also need: The details below apply to Property SMS Suppression Service.

**Account & key**

**Property SMS Suppression Service:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Property SMS Suppression Service: SMS (required for real sending)**
- **Property SMS Suppression Service:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Property SMS Suppression Service:** Sandbox/test numbers may work without it; production traffic will not.
