import config from 'dos-config';
import express from 'express';
import cors from 'cors';
import { Request, Response } from 'express';

// Bootstrap Express
const app = express();

app.use(cors())

// Include request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// public app config endpoint
app.get('/app-config', (_: Request, res: Response) =>
  res.status(200).json({
    endpoints: {
      webapp: config.endpoints.webapp,
    },
  }),
);

export default app;
