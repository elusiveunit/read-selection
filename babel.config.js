module.exports = {
  plugins: [
    [
      '@babel/plugin-transform-react-jsx',
      {
        runtime: 'classic',
        pragma: 'el',
        useBuiltIns: true,
      },
    ],
  ],
};
