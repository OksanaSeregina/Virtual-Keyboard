module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  parser: "babel-eslint",
  extends: ["eslint-config-airbnb-base", "eslint-config-prettier"],
  settings: {
    "import/resolver": {
      webpack: { config: "webpack.config.js" }
    }
  },
  rules: {
    "import/prefer-default-export": "off",
    "import/no-extraneous-dependencies": "off",
    "no-param-reassign": 0
  },
};
