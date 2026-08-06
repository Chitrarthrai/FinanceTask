const React = require('react');
const { View } = require('react-native');

module.exports = new Proxy(
  {},
  {
    get: (_target, _prop) => (props) => React.createElement(View, props),
  }
);
