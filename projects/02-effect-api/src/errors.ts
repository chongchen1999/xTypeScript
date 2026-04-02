import { Data } from "effect";

export class NotFoundError extends Data.TaggedError("NotFoundError")<{
  resource: string;
  id:       number;
}> {}

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  cause: unknown;
}> {}

export class ValidationError extends Data.TaggedError("ValidationError")<{
  message: string;
}> {}
