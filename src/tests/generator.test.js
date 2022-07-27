const { readFileSync } = require("fs");
const path = require("path");
const { getMocks } = require("../generator");

const schema = readFileSync(
  path.join(__dirname, "./resources/testSchema.graphql"),
  "utf8"
);

describe("getMocks", () => {
  const item2SubQuery = `
    {
      name
    }
  `;

  const item1SubQuery = `
    {
      name
      item1 ${item2SubQuery}
    }
  `;

  const unionSubQuery = `
  {
    ...on TestItem1 ${item1SubQuery}
    ...on TestItem2 ${item2SubQuery}
  }
  `;

  const item2ExpectedObject = {
    name: expect.any(String),
  };

  const item1ExpectedObject = {
    name: expect.any(String),
    item1: item2ExpectedObject,
  };

  const testCases = [
    {
      title: "Return string scalar",
      subQuery: "text",
      expectedResult: { text: expect.any(String) },
    },
    {
      title: "Return non null number scalar",
      subQuery: "score",
      expectedResult: { score: expect.any(Number) },
    },
    {
      title: "Return list of string scalar",
      subQuery: "arr1",
      expectedResult: { arr1: expect.arrayContaining([expect.any(String)]) },
    },
    {
      title: "Return list of non null scalar",
      subQuery: "arr2",
      expectedResult: { arr2: expect.arrayContaining([expect.any(Number)]) },
    },
    {
      title: "Return non empty list of Non null scalar",
      subQuery: "arr3",
      expectedResult: { arr3: expect.arrayContaining([expect.any(Number)]) },
    },
    {
      title: "Return named type",
      subQuery: `
    item ${item1SubQuery}
    `,
      expectedResult: { item: item1ExpectedObject },
    },
    {
      title: "Return non null type",
      subQuery: `requiredItem  ${item1SubQuery}`,
      expectedResult: { requiredItem: item1ExpectedObject },
    },
    {
      title: "Return named type list",
      subQuery: `items1 ${item1SubQuery}`,
      expectedResult: { items1: expect.arrayContaining([item1ExpectedObject]) },
    },
    {
      title: "Return non null named type list",
      subQuery: `items2 ${item1SubQuery}`,
      expectedResult: { items2: expect.arrayContaining([item1ExpectedObject]) },
    },
    {
      title: "Return named type non-empty list",
      subQuery: `items3 ${item1SubQuery}`,
      expectedResult: { items3: expect.arrayContaining([item1ExpectedObject]) },
    },
    {
      title: "Return non null named type non-empty list",
      subQuery: `items4 ${item1SubQuery}`,
      expectedResult: { items4: expect.arrayContaining([item1ExpectedObject]) },
    },
    {
      title: "Return union type",
      subQuery: `both ${unionSubQuery}`,
      expectedResult: { both: expect.any(Object) },
    },
    {
      title: "Return union type list",
      subQuery: `bothArr1 ${unionSubQuery}`,
      expectedResult: { bothArr1: expect.any(Array) },
    },
    {
      title: "Return non null union type list",
      subQuery: `bothArr2 ${unionSubQuery}`,
      expectedResult: { bothArr2: expect.any(Array) },
    },
    {
      title: "Return non null union type non-empty list",
      subQuery: `bothArr3 ${unionSubQuery}`,
      expectedResult: { bothArr3: expect.any(Array) },
    },
  ];

  test.concurrent.each(testCases)(
    "$title",
    async ({ subQuery, expectedResult }) => {
      const query = `
      query {
        test {
           ${subQuery}
        }
      }
      `;

      const mockedData = await getMocks({
        query,
        schema,
      });

      expect(mockedData).toEqual(expectedResult);
    }
  );
});
