import express from "express";
import { getItemById, getItems, addItem } from "./database.js";

const app = express();
app.use(express.json());

app.get("/:tableName", async (req, res) => {
  const tableName = req.params.tableName;
  const items = await getItems(tableName);
  res.send(items);
});

app.get("/:tableName/:id", async (req, res) => {
  const tableName = req.params.tableName;
  const id = req.params.id;
  const item = await getItemById(tableName, id);
  res.send(item);
});

app.post("/:tableName", express.json(), async (req, res) => {
  const tableName = req.params.tableName;
  const newItem = req.body;
  const insertId = await addItem(tableName, newItem);
  res.status(201).send({ id: insertId });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
