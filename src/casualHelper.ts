const casual = require("casual");

export const casualHelper = () => {
  const casualMockTypes = {
    string: {
      mock: casual.word,
    },
    number: {
      mock: casual.integer(1, 100),
    },
    float: {
      mock: casual.double(1, 100),
    },
    boolean: {
      mock: Math.random() < 0.5,
    },
  };

  const mock = ({ name, type }) => {
    const casualMock = casual[name];
    const isAccurateType = typeof casualMock === type;
    if (isAccurateType) {
      return casualMock;
    } else {
      return casualMockTypes[type].mock;
    }
  };

  return { mock };
};
