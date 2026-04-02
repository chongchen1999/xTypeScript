/**
 * Solution: 02-01 Pick and Omit
 */

// MyPick: keep only keys K from T
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// MyOmit: remove keys K from T
// Strategy: use Exclude to get the keys we want to keep, then map over them
type MyOmit<T, K extends keyof T> = {
  [P in Exclude<keyof T, K>]: T[P];
};

// Alternative MyOmit using key remapping (TS 4.1+):
// type MyOmit2<T, K extends keyof T> = {
//   [P in keyof T as P extends K ? never : P]: T[P];
// };

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

type UserPreview = MyPick<User, "id" | "name">;
type UserWithoutEmail = MyOmit<User, "email">;

const preview: UserPreview = { id: 1, name: "Alice" };
const noEmail: UserWithoutEmail = { id: 1, name: "Alice", role: "user" };

console.log(preview, noEmail);
