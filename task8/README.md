# Validation Library

A lightweight yet expressive JavaScript validation library that helps you declaratively define constraints for primitive and complex data types.

## ✨ Features

- **Chainable API** – Compose multiple rules fluently.
- **Primitive & Complex Types** – Validate strings, numbers, booleans, dates, objects, and arrays.
- **Optional Fields & Custom Messages** – Mark any validator optional and override default error messages.
- **Rich Error Reporting** – Collect every validation problem with dot-notation paths for rapid debugging.
- **Zero Dependencies** – Only **Jest** as a dev-dependency for tests.

---

## 📦 Installation

```bash
# clone the repository or copy the files, then
npm install
```

> This installs Jest which is only required for running the test-suite.

---

## 🚀 Usage

```js
const { Schema } = require("./schema");

// 1. Build a schema
const addressSchema = Schema.object({
  street: Schema.string(),
  city: Schema.string(),
  postalCode: Schema.string()
    .pattern(/^\d{5}$/)
    .withMessage("Postal code must be 5 digits"),
  country: Schema.string(),
});

const userSchema = Schema.object({
  id: Schema.string(),
  name: Schema.string().minLength(2).maxLength(50),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: Schema.number().optional(),
  isActive: Schema.boolean(),
  tags: Schema.array(Schema.string()),
  address: addressSchema.optional(),
});

// 2. Validate data
const user = {
  id: "123",
  name: "Jane",
  email: "jane@example.com",
  isActive: true,
  tags: ["developer"],
};

const { success, errors } = userSchema.validate(user);

if (!success) {
  console.error("Validation failed:", errors);
} else {
  console.log("Everything looks good ✨");
}
```

---

## 🧪 Running Tests

The project ships with an extensive Jest test-suite. Execute:

```bash
npm test
```

To generate a **coverage report**:

```bash
npm run coverage
```

A summary will be printed to the console and an HTML report saved to `coverage/`.

---

## 📄 Project Structure

```text
├── schema.js            # The validation library (exported via CommonJS)
├── validation.test.js   # Jest test-suite
├── package.json         # npm metadata & scripts
└── README.md            # This file
```

---

## 📝 License

MIT © 2025
