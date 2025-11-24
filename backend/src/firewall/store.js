// backend/src/firewall/store.js
import { v4 as uuidv4 } from "uuid";

let rules = [];

export function listRules() {
  return rules;
}

export function addRule({ type, value, comment }) {
  const rule = {
    id: uuidv4(),
    type,
    value,
    comment: comment || "",
    enabled: true,
  };
  rules.push(rule);
  return rule;
}

export function removeRule(id) {
  const index = rules.findIndex((r) => r.id === id);
  if (index === -1) return false;
  rules.splice(index, 1);
  return true;
}

export function updateRule(id, patch) {
  const rule = rules.find((r) => r.id === id);
  if (!rule) return null;
  Object.assign(rule, patch);
  return rule;
}
