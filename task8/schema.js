// Schema Builder and Validation Library

/**
 * ValidationResult represents the outcome of a validation call.
 * @typedef {Object} ValidationResult
 * @property {boolean} success – Indicates if the value passed validation.
 * @property {string[]} errors – List of human-readable error messages.
 */

/**
 * Base class that all validators extend. Provides common optional & custom
 * message helpers.
 * @template T
 */
class BaseValidator {
  constructor() {
    /** @type {boolean} */
    this._isOptional = false;
    /** @type {string|null} */
    this._customMessage = null;
  }

  /** Mark the value as optional. */
  optional() {
    this._isOptional = true;
    return this;
  }

  /** Attach a custom validation message. */
  withMessage(message) {
    this._customMessage = message;
    return this;
  }

  /** Helper to wrap error messages honoring custom overrides. */
  _error(defaultMsg) {
    return this._customMessage ?? defaultMsg;
  }

  /**
   * Implemented by concrete validators.
   * @param {*} _value
   * @param {string} _path – dot-notation path for nested validations.
   * @returns {ValidationResult}
   */
  // eslint-disable-next-line no-unused-vars
  validate(_value, _path = "") {
    throw new Error("validate() not implemented");
  }
}

// -------------------------------------------------------------
// Primitive Validators
// -------------------------------------------------------------
class StringValidator extends BaseValidator {
  constructor() {
    super();
    this._min = null;
    this._max = null;
    /** @type {RegExp|null} */
    this._pattern = null;
  }

  minLength(n) {
    this._min = n;
    return this;
  }

  maxLength(n) {
    this._max = n;
    return this;
  }

  pattern(reg) {
    this._pattern = reg;
    return this;
  }

  /** @param {*} value */
  validate(value, path = "") {
    /** @type {string[]} */ const errs = [];

    if (value === undefined || value === null) {
      if (this._isOptional) return { success: true, errors: [] };
      errs.push(this._error(`${path || "Value"} is required`));
      return { success: false, errors: errs };
    }

    if (typeof value !== "string") {
      errs.push(this._error(`${path || "Value"} must be a string`));
    } else {
      if (this._min !== null && value.length < this._min) {
        errs.push(this._error(`${path || "Value"} must be at least ${this._min} characters`));
      }
      if (this._max !== null && value.length > this._max) {
        errs.push(this._error(`${path || "Value"} must be at most ${this._max} characters`));
      }
      if (this._pattern && !this._pattern.test(value)) {
        errs.push(this._error(`${path || "Value"} is invalid`));
      }
    }
    return { success: errs.length === 0, errors: errs };
  }
}

class NumberValidator extends BaseValidator {
  constructor() {
    super();
    this._min = null;
    this._max = null;
  }

  min(n) {
    this._min = n;
    return this;
  }

  max(n) {
    this._max = n;
    return this;
  }

  validate(value, path = "") {
    const errs = [];
    if (value === undefined || value === null) {
      if (this._isOptional) return { success: true, errors: [] };
      errs.push(this._error(`${path || "Value"} is required`));
      return { success: false, errors: errs };
    }

    if (typeof value !== "number" || Number.isNaN(value)) {
      errs.push(this._error(`${path || "Value"} must be a number`));
    } else {
      if (this._min !== null && value < this._min) {
        errs.push(this._error(`${path || "Value"} must be >= ${this._min}`));
      }
      if (this._max !== null && value > this._max) {
        errs.push(this._error(`${path || "Value"} must be <= ${this._max}`));
      }
    }
    return { success: errs.length === 0, errors: errs };
  }
}

class BooleanValidator extends BaseValidator {
  validate(value, path = "") {
    if (value === undefined || value === null) {
      if (this._isOptional) return { success: true, errors: [] };
      return { success: false, errors: [this._error(`${path || "Value"} is required`)] };
    }

    if (typeof value !== "boolean") {
      return { success: false, errors: [this._error(`${path || "Value"} must be a boolean`)] };
    }
    return { success: true, errors: [] };
  }
}

class DateValidator extends BaseValidator {
  constructor() {
    super();
    /** @type {Date|null} */ this._min = null;
    /** @type {Date|null} */ this._max = null;
  }

  min(date) {
    this._min = date;
    return this;
  }

  max(date) {
    this._max = date;
    return this;
  }

  validate(value, path = "") {
    const errs = [];
    if (value === undefined || value === null) {
      if (this._isOptional) return { success: true, errors: [] };
      errs.push(this._error(`${path || "Value"} is required`));
      return { success: false, errors: errs };
    }

    const dateVal = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(dateVal.getTime())) {
      errs.push(this._error(`${path || "Value"} must be a valid date`));
    } else {
      if (this._min && dateVal < this._min) {
        errs.push(this._error(`${path || "Value"} must be after ${this._min.toISOString()}`));
      }
      if (this._max && dateVal > this._max) {
        errs.push(this._error(`${path || "Value"} must be before ${this._max.toISOString()}`));
      }
    }
    return { success: errs.length === 0, errors: errs };
  }
}

// -------------------------------------------------------------
// Complex Validators
// -------------------------------------------------------------
class ArrayValidator extends BaseValidator {
  /**
   * @param {BaseValidator} itemValidator – validator applied to every item.
   */
  constructor(itemValidator) {
    super();
    this._itemValidator = itemValidator;
    this._min = null;
    this._max = null;
  }

  minLength(n) {
    this._min = n;
    return this;
  }

  maxLength(n) {
    this._max = n;
    return this;
  }

  validate(value, path = "") {
    const errs = [];
    if (value === undefined || value === null) {
      if (this._isOptional) return { success: true, errors: [] };
      errs.push(this._error(`${path || "Value"} is required`));
      return { success: false, errors: errs };
    }

    if (!Array.isArray(value)) {
      return { success: false, errors: [this._error(`${path || "Value"} must be an array`)] };
    }

    if (this._min !== null && value.length < this._min) {
      errs.push(this._error(`${path || "Value"} must contain at least ${this._min} items`));
    }
    if (this._max !== null && value.length > this._max) {
      errs.push(this._error(`${path || "Value"} must contain at most ${this._max} items`));
    }

    value.forEach((item, idx) => {
      const itemPath = path ? `${path}[${idx}]` : `[${idx}]`;
      const res = this._itemValidator.validate(item, itemPath);
      if (!res.success) errs.push(...res.errors);
    });

    return { success: errs.length === 0, errors: errs };
  }
}

class ObjectValidator extends BaseValidator {
  /**
   * @param {Record<string, BaseValidator>} schema
   */
  constructor(schema = {}) {
    super();
    this._schema = schema;
  }

  validate(value, path = "") {
    const errs = [];
    if (value === undefined || value === null) {
      if (this._isOptional) return { success: true, errors: [] };
      errs.push(this._error(`${path || "Value"} is required`));
      return { success: false, errors: errs };
    }

    if (typeof value !== "object" || Array.isArray(value)) {
      return { success: false, errors: [this._error(`${path || "Value"} must be an object`)] };
    }

    for (const [key, validator] of Object.entries(this._schema)) {
      const propPath = path ? `${path}.${key}` : key;
      const res = validator.validate(value[key], propPath);
      if (!res.success) errs.push(...res.errors);
    }

    return { success: errs.length === 0, errors: errs };
  }
}

// -------------------------------------------------------------
// Public Schema Builder
// -------------------------------------------------------------
const Schema = {
  string: () => new StringValidator(),
  number: () => new NumberValidator(),
  boolean: () => new BooleanValidator(),
  date: () => new DateValidator(),
  /**
   * @param {Record<string, BaseValidator>} schema
   */
  object: (schema) => new ObjectValidator(schema),
  array: (itemValidator) => new ArrayValidator(itemValidator)
};

// -------------------------------------------------------------
// Exports (ES Modules) – makes the library usable by tests & consumers.
// -------------------------------------------------------------
export {
  BaseValidator,
  StringValidator,
  NumberValidator,
  BooleanValidator,
  DateValidator,
  ArrayValidator,
  ObjectValidator,
  Schema
};

// -------------------------------------------------------------
// Example Usage (will only execute when run directly, not when imported)
// -------------------------------------------------------------
if (import.meta.url === process.argv[1] || import.meta.url === new URL(process.argv[1], import.meta.url).href) {
  /* eslint-disable no-console */
  // Define a complex schema
  const addressSchema = Schema.object({
    street: Schema.string(),
    city: Schema.string(),
    postalCode: Schema.string()
      .pattern(/^\d{5}$/)
      .withMessage("Postal code must be 5 digits"),
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

  // Validate data
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
  console.log("Validation result:", result);
}
