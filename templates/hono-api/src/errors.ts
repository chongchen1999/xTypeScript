import { Data } from "effect";

export class NotFoundError extends Data.TaggedError("NotFoundError")<{
  resource: string;
  id:       number;
}> {}

export class ValidationError extends Data.TaggedError("ValidationError")<{
  message: string;
}> {}

export class UnauthorizedError extends Data.TaggedError("UnauthorizedError")<{
  message: string;
}> {}
