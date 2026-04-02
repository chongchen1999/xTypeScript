/**
 * Solution: 02-02 Precise Object Annotation
 */

// Dataset 1: discriminated union on `ok`
type ApiResponse =
  | { readonly status: 200; readonly ok: true;  readonly data: { userId: string; username: string } }
  | { readonly status: 404; readonly ok: false; readonly error: string };

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

// Dataset 2: literal union for `env`, nested readonly object
type AppConfig = {
  readonly env: "development" | "staging" | "production";
  readonly port: number;
  readonly features: {
    readonly darkMode: boolean;
    readonly betaSignup: boolean;
  };
  readonly allowedOrigins: readonly string[];
};

const config: AppConfig = {
  env: "production",
  port: 8080,
  features: { darkMode: true, betaSignup: false },
  allowedOrigins: ["https://app.example.com", "https://admin.example.com"],
};

// Dataset 3: discriminated union on `type`
type AppEvent =
  | { type: "click";   x: number; y: number }
  | { type: "keydown"; key: string; ctrlKey: boolean }
  | { type: "focus";   targetId: string };

const clickEvent: AppEvent = { type: "click", x: 100, y: 200 };
const keyEvent: AppEvent   = { type: "keydown", key: "Enter", ctrlKey: true };
const focusEvent: AppEvent = { type: "focus", targetId: "input-email" };

console.log(response1, response2, config, clickEvent, keyEvent, focusEvent);
