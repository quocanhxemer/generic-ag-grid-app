import express from "express";
import {
  getItemById,
  getItems,
  addItem,
  deleteItemById,
  updateItemById,
} from "./database.js";

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

  if (!item) {
    return res.status(404).send({ error: "Item not found" });
  }

  res.send(item);
});

app.post("/:tableName", async (req, res) => {
  const tableName = req.params.tableName;
  const newItem = req.body;
  const item = await addItem(tableName, newItem);
  res.status(201).send(item);
});

app.delete("/:tableName/:id", async (req, res) => {
  const tableName = req.params.tableName;
  const id = req.params.id;
  await deleteItemById(tableName, id);
  res.status(204).send();
});

app.put("/:tableName/:id", async (req, res) => {
  const tableName = req.params.tableName;
  const id = req.params.id;
  const updatedFields = req.body;
  const item = await updateItemById(tableName, id, updatedFields);
  res.status(200).send(item);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
