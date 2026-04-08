/**
 * Exercise 00-01: Type Annotations
 *
 * Add proper type annotations to all the variables and functions below.
 * The code should compile without errors when you're done.
 *
 * Run: bun 00-basics/exercises/01-type-annotations.ts
 */

// TODO: Add type annotations to these variables
let username = "Alice";
let age = 30;
let isVerified = true;
let scores = [95, 87, 92, 78];
let metadata = null;

// TODO: Add parameter types and return type
function formatUser(name, age, verified) {
  const status = verified ? "✓" : "✗";
  return `${name} (age: ${age}) ${status}`;
}

// TODO: Add types to this arrow function
const sum = (numbers) => {
  return numbers.reduce((acc, n) => acc + n, 0);
};

// TODO: Define a proper interface for this object and type the variable
const config = {
  host: "localhost",
  port: 8080,
  debug: false,
  tags: ["api", "v2"],
};

// TODO: Add types — this function should accept string OR number
function stringify(value) {
  if (typeof value === "string") return value;
  return value.toString();
}

// --- Verify your work ---
console.log(formatUser(username, age, isVerified));
console.log("sum:", sum(scores));
console.log("config:", config.host, config.port);
console.log(stringify(42), stringify("hello"));
