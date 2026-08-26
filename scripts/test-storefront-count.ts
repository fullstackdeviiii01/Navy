// scripts/test-storefront-count.ts
async function main() {
  const res = await fetch("http://localhost:3000/api/products?limit=100");
  const data = await res.json();
  console.log("=== STOREFRONT ACTIVE PRODUCTS API TEST ===");
  console.log(`• Active Products Returned: ${data.products?.length || 0}`);
  console.log(`• Total Active in DB: ${data.pagination?.total || 0}`);
}
main();
