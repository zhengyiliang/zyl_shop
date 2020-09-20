module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-case-declarations': 0,
    'no-unused-vars': 1,
    'camelcase': 1,
    'indent': 1,
    'eqeqeq': 0,
    'space-before-function-paren': 0,
  }
}
