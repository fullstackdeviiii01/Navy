export const formatIp = (ip: string): string => {
  if (ip === "::1" || ip === "127.0.0.1") return "localhost (dev)";
  return ip;
};