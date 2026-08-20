const PKR = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatPrice(price: number): string {
  return PKR.format(price);
}

export function formatPriceRaw(price: number): string {
  return `Rs. ${price.toLocaleString("en-PK")}`;
}
