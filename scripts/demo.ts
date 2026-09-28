import { sendPropertySms } from "../src/suppression.js";

const input = { kind: "inspection_reminder", tenantPhone: "+14155550123", tenantName: "Mina", details: "Inspection on Friday at 10:00", optedOut: true };
console.log(await sendPropertySms(input));
