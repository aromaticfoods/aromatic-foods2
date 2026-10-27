// Prints CSV (id,weight,price,inStock) for the "Products" sheet. Usage: npm run export-catalog
import { PRODUCTS_CATALOG } from '../src/data/products.ts';

console.log('id,weight,price,inStock');
for (const p of PRODUCTS_CATALOG) {
  const variants = p.variants && p.variants.length ? p.variants : [{ weight: p.weight, price: p.price }];
  for (const v of variants) console.log(`${p.id},${v.weight},${v.price},${p.inStock}`);
}
