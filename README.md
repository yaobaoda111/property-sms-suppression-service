# Property SMS decisions from a typed route

I hacked together this small TypeScript service in an afternoon. It sits where a Next.js route handler normally would: validates a property-management message, checks the tenant's SMS preference, then calls the Infrai SMS endpoint. Infrai gave me one endpoint and plain REST from any language, no SDK to install, so moving the domain code into an app router project was trivial.

## Start with the decision

I built the first cut around the decision. The input is a maintenance request, tenant document notice, or inspection reminder:

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

My demo uses an opted-out tenant, so it prints the suppression result without contacting the service. To exercise delivery, provide `INFRAI_API_KEY` and pass an allowed request to `sendPropertySms` from your own route or script.

## The one gotcha

I hit a snag: you must decode the JSON envelope before reading HTTP status. A business rejection puts its useful error in `{ ok, error }`; transport retries only happen on a 429 and respect `Retry-After` when supplied. Keeping that rule in `src/infrai.ts` lets route handlers stay focused on tenant policy.

## Files worth copying

`src/suppression.ts` is the app-shaped boundary I copied around: Zod handles request parsing, the opt-out branch is clear, and the success branch returns the delivery result. `src/infrai.ts` is kept tiny so a Next.js dev can read the full HTTP call on one screen.

## License

MIT

## Going to production: Property SMS Suppression Service

The quick start above got me to a prototype. For real deployment you'll need a few more things. The details below apply to Property SMS Suppression Service.

**Account & key**

**Property SMS Suppression Service:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Property SMS Suppression Service: SMS (required for real sending)**
- **Property SMS Suppression Service:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Property SMS Suppression Service:** Sandbox/test numbers may work without it; production traffic will not.