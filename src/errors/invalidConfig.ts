export class InvalidConfig extends Error {
  constructor() {
    super(`Invalid config format`);
    this.name = "InvalidConfig";
  }
}
