import { gen } from "../../../bin/actions";

describe("Gen", () => {
  const schema = "./src/tests/bin/actions-schema.graphql";
  const entity = "Account";
  test("Should return all fields for entity if none are specified", async () => {
    const mock = await gen({ schema, entity, fields: "" });
    expect(mock).toEqual({
      id: expect.any(Number),
      name: expect.any(String),
      email: expect.any(String),
      password: expect.any(String),
      token: {
        header: expect.any(String),
        signature: expect.any(Number),
        payload: {
          userName: expect.any(String),
          userId: expect.any(String),
          userEmail: expect.any(String),
          isActiveUser: expect.any(Boolean),
        },
      },
    });
  });

  test("Should return only specified fields for entity", async () => {
    const fields = "id,name,token[header,payload[userId]]";

    const mock = await gen({ schema, entity, fields });

    expect(mock).toEqual({
      id: expect.any(Number),
      name: expect.any(String),
      token: {
        header: expect.any(String),
        payload: {
          userId: expect.any(String),
        },
      },
    });

    expect(mock).not.toHaveProperty("email");
    expect(mock).not.toHaveProperty("password");
    expect(mock.token).not.toHaveProperty("signature");
    expect(mock.token.payload).not.toHaveProperty("isActiveUser");
  });
});
