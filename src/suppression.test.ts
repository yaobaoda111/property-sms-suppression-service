import test from "node:test";
import assert from "node:assert/strict";
import { decideSms } from "./suppression.js";

test("an opted-out tenant never reaches the send decision", () => {
  const result = decideSms({ kind: "inspection_reminder", tenantPhone: "+14155550123", tenantName: "Mina", details: "Inspection on Friday at 10:00", optedOut: true });
  assert.deepEqual(result, { status: "suppressed", reason: "tenant_opted_out", kind: "inspection_reminder" });
});

test("a maintenance request is ready when the tenant allows SMS", () => {
  const result = decideSms({ kind: "maintenance", tenantPhone: "+14155550123", tenantName: "Mina", details: "Leaking kitchen tap", optedOut: false });
  assert.equal(result.status, "ready");
});
