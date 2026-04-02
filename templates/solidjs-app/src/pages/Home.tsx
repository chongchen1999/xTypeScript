import { A } from "@solidjs/router";

export default function Home() {
  return (
    <main>
      <h1>SolidJS App</h1>
      <p>Welcome! Navigate to <A href="/items">Items</A> to get started.</p>
    </main>
  );
}
