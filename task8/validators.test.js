import {
  Schema,
  StringValidator,
  NumberValidator,
  BooleanValidator,
  DateValidator,
  ArrayValidator,
  ObjectValidator
} from "./schema.js";

// Utility helper to quickly expect failure
const expectFail = (result) => {
  expect(result.success).toBe(false);
  expect(result.errors.length).toBeGreaterThan(0);
};

describe("Primitive validators", () => {
  describe("StringValidator", () => {
    const validator = Schema.string().minLength(3).maxLength(5);

    test("min length failure", () => {
      const res = validator.validate("ab");
      expectFail(res);
    });

    test("max length failure", () => {
      const res = validator.validate("abcdef");
      expectFail(res);
    });

    test("pattern success / failure", () => {
      const patternVal = Schema.string().pattern(/^a+$/);
      expect(patternVal.validate("aaa").success).toBe(true);
      expectFail(patternVal.validate("bbb"));
    });

    test("optional passes when undefined", () => {
      const opt = Schema.string().optional();
      expect(opt.validate(undefined).success).toBe(true);
    });
  });

  describe("NumberValidator", () => {
    const validator = Schema.number().min(10).max(20);

    test("below min failure", () => {
      expectFail(validator.validate(5));
    });

    test("above max failure", () => {
      expectFail(validator.validate(25));
    });

    test("NaN failure", () => {
      expectFail(validator.validate(NaN));
    });
  });

  describe("BooleanValidator", () => {
    test("invalid type", () => {
      expectFail(Schema.boolean().validate("true"));
    });
  });

  describe("DateValidator", () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const validator = Schema.date().min(yesterday).max(tomorrow);

    test("invalid date format", () => {
      expectFail(validator.validate("not-a-date"));
    });

    test("before min", () => {
      const past = new Date(yesterday.getTime() - 1000);
      expectFail(validator.validate(past));
    });

    test("after max", () => {
      const future = new Date(tomorrow.getTime() + 1000);
      expectFail(validator.validate(future));
    });

    test("valid date", () => {
      const res = validator.validate(now);
      expect(res.success).toBe(true);
    });
  });
});

describe("Complex validators", () => {
  describe("ArrayValidator", () => {
    const validator = Schema.array(Schema.string().minLength(2)).minLength(2).maxLength(3);

    test("not an array", () => {
      expectFail(validator.validate("oops"));
    });

    test("min length fail", () => {
      expectFail(validator.validate(["a"]));
    });

    test("max length fail", () => {
      expectFail(validator.validate(["ab", "cd", "ef", "gh"]));
    });

    test("element validation failure aggregated", () => {
      const res = validator.validate(["ok", "x"]); // second too short
      expectFail(res);
      expect(res.errors.some((e) => /\[1\]/.test(e))).toBe(true); // path has [1]
    });

    test("valid array", () => {
      expect(validator.validate(["ab", "cd"]).success).toBe(true);
    });
  });

  describe("ObjectValidator", () => {
    const userSchema = Schema.object({
      id: Schema.string(),
      age: Schema.number().optional()
    });

    test("non-object fails", () => {
      expectFail(userSchema.validate("string"));
    });

    test("missing required key fails", () => {
      const res = userSchema.validate({});
      expectFail(res);
      expect(res.errors.some((e) => /id/.test(e))).toBe(true);
    });

    test("custom message override", () => {
      const v = Schema.string().withMessage("My custom error");
      const res = Schema.object({ a: v }).validate({});
      expectFail(res);
      expect(res.errors.includes("My custom error")).toBe(true);
    });
  });
}); 