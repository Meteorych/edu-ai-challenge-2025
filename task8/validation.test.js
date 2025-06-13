import { Schema } from "./schema.js";

describe("Validation Library", () => {
  const addressSchema = Schema.object({
    street: Schema.string(),
    city: Schema.string(),
    postalCode: Schema.string().pattern(/^\d{5}$/).withMessage("Postal code must be 5 digits"),
    country: Schema.string()
  });

  const userSchema = Schema.object({
    id: Schema.string().withMessage("ID must be a string"),
    name: Schema.string().minLength(2).maxLength(50),
    email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    age: Schema.number().optional(),
    isActive: Schema.boolean(),
    tags: Schema.array(Schema.string()),
    address: addressSchema.optional(),
    metadata: Schema.object({}).optional()
  });

  test("Valid user data passes validation", () => {
    const userData = {
      id: "12345",
      name: "John Doe",
      email: "john@example.com",
      isActive: true,
      tags: ["developer", "designer"],
      address: {
        street: "123 Main St",
        city: "Anytown",
        postalCode: "12345",
        country: "USA"
      }
    };

    const result = userSchema.validate(userData);
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("Missing required field fails validation", () => {
    const bad = {
      // id missing
      name: "John Doe",
      email: "john@example.com",
      isActive: true,
      tags: ["developer"]
    };

    const result = userSchema.validate(bad);
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test("Invalid email fails validation", () => {
    const bad = {
      id: "12345",
      name: "Jane",
      email: "not-an-email",
      isActive: false,
      tags: [],
    };
    const result = userSchema.validate(bad);
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.includes("email"))).toBe(true);
  });

  test("Postal code pattern fails", () => {
    const bad = {
      id: "12345",
      name: "Jane",
      email: "jane@example.com",
      isActive: false,
      tags: [],
      address: {
        street: "1 Block",
        city: "NYC",
        postalCode: "ABCDE", // invalid
        country: "USA"
      }
    };
    const result = userSchema.validate(bad);
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => /postal/i.test(e))).toBe(true);
  });

  test("Optional fields can be omitted", () => {
    const data = {
      id: "1",
      name: "AB",
      email: "a@b.c",
      isActive: true,
      tags: []
      // age, address, metadata omitted
    };
    const result = userSchema.validate(data);
    expect(result.success).toBe(true);
  });
}); 