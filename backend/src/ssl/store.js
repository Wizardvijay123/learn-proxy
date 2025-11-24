let sslEnabled = false;

export function toggleSSL() {
  sslEnabled = !sslEnabled;
  return sslEnabled;
}

export function getSSLStatus() {
  return sslEnabled;
}
