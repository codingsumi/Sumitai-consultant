import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { assertProdSecrets } from "./config/env";

assertProdSecrets();

const PORT = process.env.PORT || 5900;

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
