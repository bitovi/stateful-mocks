export class ServerError extends Error {
  constructor(errorMessage?: string) {
    super(`Internal server error.${errorMessage}`);
    this.name = "ServerError";
  }
}
