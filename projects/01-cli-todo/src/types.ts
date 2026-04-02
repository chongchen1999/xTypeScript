// Shared types for the todo domain
export type Priority = "low" | "medium" | "high";
export type Status   = "pending" | "done";

export type Todo = {
  id:        number;
  title:     string;
  priority:  Priority;
  status:    Status;
  createdAt: string; // ISO 8601
  doneAt:    string | null;
};

export type TodoStore = {
  nextId: number;
  todos:  Todo[];
};
