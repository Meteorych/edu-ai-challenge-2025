import { Schema } from "./schema.js";

// -------------------------------------------------------------
// Example 1: Simple user record
// -------------------------------------------------------------
const userSchema = Schema.object({
  id: Schema.string(),
  name: Schema.string().minLength(2).maxLength(50),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: Schema.number().optional(),
  isActive: Schema.boolean(),
  tags: Schema.array(Schema.string()),
});

const validUser = {
  id: "u-001",
  name: "Alice",
  email: "alice@example.com",
  isActive: true,
  tags: ["admin", "editor"],
};

console.log("User validation (valid):", userSchema.validate(validUser));

// -------------------------------------------------------------
// Example 2: Product data with nested array of variants
// -------------------------------------------------------------
const productSchema = Schema.object({
  sku: Schema.string(),
  name: Schema.string(),
  price: Schema.number().min(0),
  tags: Schema.array(Schema.string()).optional(),
  variants: Schema.array(
    Schema.object({
      color: Schema.string(),
      stock: Schema.number().min(0),
    })
  ).optional(),
});

const validProduct = {
  sku: "P-123",
  name: "T-Shirt",
  price: 19.99,
  tags: ["clothing", "summer"],
  variants: [
    { color: "red", stock: 10 },
    { color: "blue", stock: 0 },
  ],
};

console.log("Product validation (valid):", productSchema.validate(validProduct));

// -------------------------------------------------------------
// Example 3: Demonstrating rich error reporting with invalid data
// -------------------------------------------------------------
const invalidUser = {
  id: 123, // should be a string
  email: "not-an-email", // invalid format
  isActive: "yes", // should be boolean
  tags: ["ok", 123], // second element should be a string
};

const invalidResult = userSchema.validate(invalidUser);
console.log("User validation (invalid): success ->", invalidResult.success);
console.log("Errors returned:\n", invalidResult.errors.join("\n"));

// Run with: node intex.js 