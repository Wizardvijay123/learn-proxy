// backend/src/dns/dnsStore.js
export const dnsRecords = {
  "example.com": {
    ip: "192.168.0.10",
    ttl: 3600,
    createdAt: Date.now()
  }
};

export function addRecord(domain, ip) {
  dnsRecords[domain] = {
    ip,
    ttl: 3600,
    createdAt: Date.now()
  };
  return dnsRecords[domain];
}

export function deleteRecord(domain) {
  if (dnsRecords[domain]) {
    delete dnsRecords[domain];
    return { success: true };
  }
  return { error: "not found" };
}
