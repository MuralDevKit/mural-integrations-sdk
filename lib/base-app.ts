import express from "express";
import cors from "cors";

// Bootstrap Express
const app = express();

app.use(cors());

// Include request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

export default app;
