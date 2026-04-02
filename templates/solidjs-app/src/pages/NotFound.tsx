import { A } from "@solidjs/router";

export default function NotFound() {
  return (
    <main>
      <h1>404 — Not Found</h1>
      <p>The page you requested does not exist.</p>
      <A href="/">Go home</A>
    </main>
  );
}
