import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.WASH_BOARD_PORT || 3010;

app.use(
  "/wash-board",
  express.static(path.join(__dirname, "public", "wash-board")),
);

app.listen(PORT, () => {
  console.log(`Wash-board draft started on port ${PORT}`);
});
