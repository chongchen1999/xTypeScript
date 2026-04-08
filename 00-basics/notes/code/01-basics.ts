// Basic type annotations and inference
let count: number = 42;
let name: string = "Alice";
let active: boolean = true;

// Type inference — no annotation needed
let inferred = 100; // number

// Union type
let id: number | string = "user-1";
id = 42; // also OK

// Optional and default parameters
function greet(name: string, title?: string): string {
  return title ? `${title} ${name}` : `Hello, ${name}`;
}

console.log(greet("Alice"));          // Hello, Alice
console.log(greet("Alice", "Dr."));   // Dr. Alice
