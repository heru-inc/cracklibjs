const rulesOverrides = {
  "array-bracket-spacing": "off",
  "@typescript-eslint/no-confusing-void-expression": "off",
  "@typescript-eslint/comma-dangle": "off",
  "@typescript-eslint/strict-boolean-expressions": "off",
};
const love = require("eslint-config-love");
love.rules = { ...love.rules, ...rulesOverrides };

module.exports = {
  ...love,
  files: ["src/*.ts"],
};
