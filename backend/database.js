import mysql from "mysql2/promise";

import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSWL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

export const getItems = async (tableName) => {
  const [items] = await pool.query(`SELECT * FROM ??`, [tableName]);
  return items;
};

export const getItemById = async (tableName, id) => {
  const [[item]] = await pool.query(`SELECT * FROM ?? WHERE id = ?`, [
    tableName,
    id,
  ]);
  return item;
};

export const deleteItemById = async (tableName, id) => {
  await pool.query(`DELETE FROM ?? WHERE id = ?`, [tableName, id]);
};

export const updateItemById = async (tableName, id, updatedFields) => {
  const setClause = Object.keys(updatedFields)
    .map((key) => `\`${key}\` = ?`)
    .join(", ");
  const values = Object.values(updatedFields);

  await pool.query(`UPDATE ?? SET ${setClause} WHERE id = ?`, [
    tableName,
    ...values,
    id,
  ]);
};

export const addItem = async (tableName, newItem) => {
  const columns = Object.keys(newItem)
    .map((key) => `\`${key}\``)
    .join(", ");
  const placeholders = Object.keys(newItem)
    .map(() => "?")
    .join(", ");
  const values = Object.values(newItem);

  const [result] = await pool.query(
    `INSERT INTO ?? (${columns}) VALUES (${placeholders})`,
    [tableName, ...values],
  );
  return result.insertId;
};
