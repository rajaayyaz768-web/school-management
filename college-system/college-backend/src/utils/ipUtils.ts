// eslint-disable-next-line @typescript-eslint/no-require-imports
const ipaddr = require("ipaddr.js") as typeof import("ipaddr.js");
import { logger } from "./logger";

export function isIpInAnyNetwork(ip: string, cidrs: string[]): boolean {
  if (!ip || cidrs.length === 0) return false;

  let parsedIp: ReturnType<typeof ipaddr.process>;
  try {
    parsedIp = ipaddr.process(ip); // handles IPv4 and IPv4-mapped-IPv6
  } catch {
    logger.warn(`[ipUtils] Could not parse client IP: ${ip}`);
    return false;
  }

  for (const cidr of cidrs) {
    try {
      const range = ipaddr.parseCIDR(cidr);
      if ((parsedIp as any).match(range)) return true;
    } catch {
      logger.warn(`[ipUtils] Malformed CIDR skipped: ${cidr}`);
    }
  }

  return false;
}

export function isValidCidr(cidr: string): boolean {
  try {
    ipaddr.parseCIDR(cidr);
    return true;
  } catch {
    return false;
  }
}
