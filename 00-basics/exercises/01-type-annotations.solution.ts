/**
 * Solution: 00-01 Type Annotations
 */

let username: string = "Alice";
let age: number = 30;
let isVerified: boolean = true;
let scores: number[] = [95, 87, 92, 78];
let metadata: null = null;

function formatUser(name: string, age: number, verified: boolean): string {
  const status = verified ? "✓" : "✗";
  return `${name} (age: ${age}) ${status}`;
}

const sum = (numbers: number[]): number => {
  return numbers.reduce((acc, n) => acc + n, 0);
};

interface Config {
  host: string;
  port: number;
  debug: boolean;
  tags: string[];
}

const config: Config = {
  host: "localhost",
  port: 8080,
  debug: false,
  tags: ["api", "v2"],
};

function stringify(value: string | number): string {
  if (typeof value === "string") return value;
  return value.toString();
}

// --- Verify ---
console.log(formatUser(username, age, isVerified));
console.log("sum:", sum(scores));
console.log("config:", config.host, config.port);
console.log(stringify(42), stringify("hello"));
