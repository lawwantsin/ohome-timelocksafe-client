var browserSync = require("browser-sync").create();
var historyApiFallback = require('connect-history-api-fallback')

browserSync.init({
    files: ["dist/*"],
    server: {
        baseDir: "dist",
        middleware: [ historyApiFallback() ]
    }
});
