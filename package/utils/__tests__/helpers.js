const { replacePlaceholders } = require('../helpers');
describe('replacePlaceholders()', () => {
  it('replaces placeholders with values from object', () => {
    const values = {
      PLACEHOLDER1: "value1",
      PLACEHOLDER2: "value2",
    }
    expect(replacePlaceholders("Part1 ${PLACEHOLDER1} part2 ${PLACEHOLDER2}", values)).toEqual("Part1 value1 part2 value2");
  });
});
