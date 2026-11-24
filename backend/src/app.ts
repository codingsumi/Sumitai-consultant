import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.routes";
import { errorHandler } from "./middlewares/errorHandler";
import { attachUser, csrfOriginCheck } from "./middlewares/auth";
import { env } from "./config/env";

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = env.frontendOrigin.split(",").map((o) => o.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(attachUser);
app.use(csrfOriginCheck);

app.use("/api", routes);

app.use(errorHandler);

export default app;
