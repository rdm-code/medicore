import { HttpError } from "./api";

export function isHttpError(err: unknown): err is HttpError {
  return err instanceof HttpError;
}

export function errorMessage(err: unknown): string {
  if (isHttpError(err)) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}
