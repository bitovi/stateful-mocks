const { readFileSync } = require("fs");
const path = require("path");
const { getMock } = require("../../utils/mock");

describe("getMock", () => {
  it("Return all fields for Person", () => {
    const mocks = getMock({
      schema: readFileSync(
        path.join(__dirname, "../resources/testSchema.graphql"),
        "utf8"
      ),
      entity: "Person",
    });

    expect(mocks).toStrictEqual({
      id: expect.any(Number),
      name: expect.any(String),
      age: expect.any(Number),
      car: {
        id: expect.any(Number),
        name: expect.any(String),
        colour: {
          id: expect.any(Number),
          name: expect.any(String),
          shade: {
            id: expect.any(Number),
            name: expect.any(String),
            hex: expect.any(String),
          },
        },
      },
    });
  });

  it("Return only selected fields for Person", () => {
    const mocks = getMock({
      schema: readFileSync(
        path.join(__dirname, "../resources/testSchema.graphql"),
        "utf8"
      ),
      entity: "Person",
      fields: ["name", "age"],
    });

    expect(mocks).toStrictEqual({
      name: expect.any(String),
      age: expect.any(Number),
    });
  });

  it("Handles nested properties", () => {
    const mocks = getMock({
      schema: readFileSync(
        path.join(__dirname, "../resources/testSchema.graphql"),
        "utf8"
      ),
      entity: "Person",
      fields: ["name", "age", "car.name", "car.id", "car.colour.shade.name"],
    });

    expect(mocks).toStrictEqual({
      name: expect.any(String),
      age: expect.any(Number),
      car: {
        id: expect.any(Number),
        name: expect.any(String),
        colour: {
          shade: {
            name: expect.any(String),
          },
        },
      },
    });
  });
});
