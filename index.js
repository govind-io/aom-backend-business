import { app } from "./src/App.js";

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("app running on port " + PORT);
});
