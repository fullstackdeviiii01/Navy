const PKR = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatPrice(price?: number | null): string {
  const validNum = typeof price === "number" && !Number.isNaN(price) ? price : 0;
  return PKR.format(validNum);
}

export function formatPriceRaw(price?: number | null): string {
  const validNum = typeof price === "number" && !Number.isNaN(price) ? price : 0;
  return `Rs. ${validNum.toLocaleString("en-PK")}`;
}
