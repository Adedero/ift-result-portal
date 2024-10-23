const fs = require("node:fs");
const path = require("node:path");

module.exports = (Router, dir) => {
  fs.readdirSync(dir)
    .filter(file => file.endsWith('.js'))
    .forEach(file => {
      const controller = require(path.join(dir, file));
      const [fileName, method] = file.split('.').slice(0, 2);
      const middleware = controller.md || [];
      const params = (controller.params || []).map(param => `:${param}`).join("/").toString();
      let subroute = controller.subroute || "";
      if (subroute && !subroute.startsWith("/")) subroute = `/${subroute}`
      const route = `/${fileName}${subroute}${params.length ? "/"+params : ''}`.trim();
      Router[method](route, middleware, controller.fn);
    });
}