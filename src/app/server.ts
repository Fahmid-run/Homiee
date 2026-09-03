import app from "./app.js";
import { configs } from "./config/index.js";

const port = configs.port;
app.listen(port, () => {
  console.log("Server is listening on port ", port);
});
