/**
 * Exercise 02-02: Precise Object Annotation
 *
 * Given runtime data (plain JS objects), write the most precise TypeScript
 * types for them. Use literal types, readonly, optional fields, and union types
 * where appropriate — avoid overly wide types like `string` or `any`.
 */

// --- Dataset 1: HTTP response ---
// TODO: replace `any` with a precise type
type ApiResponse = any;

const response1: ApiResponse = {
  status: 200,
  ok: true,
  data: { userId: "u-42", username: "alice" },
};

const response2: ApiResponse = {
  status: 404,
  ok: false,
  error: "User not found",
};

// --- Dataset 2: Config object ---
// TODO: replace `any` with a precise type
type AppConfig = any;

const config: AppConfig = {
  env: "production",      // one of: "development" | "staging" | "production"
  port: 8080,
  features: {
    darkMode: true,
    betaSignup: false,
  },
  allowedOrigins: ["https://app.example.com", "https://admin.example.com"],
};

// --- Dataset 3: DOM event-like ---
// TODO: replace `any` with a precise type
type AppEvent = any;

const clickEvent: AppEvent = { type: "click", x: 100, y: 200 };
const keyEvent: AppEvent   = { type: "keydown", key: "Enter", ctrlKey: true };
const focusEvent: AppEvent = { type: "focus", targetId: "input-email" };

console.log(response1, response2, config, clickEvent, keyEvent, focusEvent);
