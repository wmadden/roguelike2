// http://www.browsersync.io/docs/options/
module.exports = {
  port: 9004,
  ui: false,
  files: ["out"],
  server: {
    baseDir: [ "out" ],
  },
  proxy: false,
  open: false,
  host: "roguelike.dev",
};
