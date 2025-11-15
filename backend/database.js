import mysql from "mysql2/promise";

import {
  isValidColumn,
  getColumnNames,
  getWhereClause,
} from "./utils/index.js";

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

  const [result] = await pool.query(`UPDATE ?? SET ${setClause} WHERE id = ?`, [
    tableName,
    ...values,
    id,
  ]);

  if (result.affectedRows === 0) {
    throw new Error(`Item with id ${id} not found in table ${tableName}`);
  }

  return getItemById(tableName, id);
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

  if (result.affectedRows === 0) {
    throw new Error(`Failed to insert item into table ${tableName} :(`);
  }

  return getItemById(tableName, result.insertId);
};

export const queryItems = async (
  tableName,
  option = { search: "", filters: {} },
) => {
  // Option.filters in form a Map from column to { filterType, type, filter }
  // OR: to { filterType, operator, conditions: [ { filterType, type, filter }, ... ] }
  // From the IDatasource interface https://www.ag-grid.com/react-data-grid/infinite-scrolling
  // Don't need filterType for now ¯\(o_o)/¯
  const whereClauses = [];
  const values = [];
  if (option.filters) {
    for (const col of Object.keys(option.filters)) {
      // Validate column name - against maybe SQL injection
      if (!(await isValidColumn(tableName, col, pool))) {
        throw new Error(`Invalid column name: ${col}`);
      }

      const filter = option.filters[col];

      if (filter.conditions) {
        if (filter.operator !== "AND" && filter.operator !== "OR") {
          throw new Error(`Unsupported operator: ${filter.operator}`);
        }

        const conditionClauses = [];
        for (const condition of filter.conditions) {
          const [clause, val] = getWhereClause(condition, col);
          conditionClauses.push(clause);
          if (val !== undefined) {
            values.push(val);
          }
        }

        whereClauses.push(
          "(" + conditionClauses.join(` ${filter.operator} `) + ")",
        );
        continue;
      }

      const [clause, val] = getWhereClause(filter, col);
      whereClauses.push(clause);
      if (val !== undefined) {
        values.push(val);
      }
    }
  }

  if (option.search) {
    const searchColumns = (await getColumnNames(tableName, pool)).join(", ");
    whereClauses.push(`CONCAT_WS(' ', ${searchColumns}) LIKE ?`);
    values.push(`%${option.search}%`);
  }

  const whereClause = whereClauses.length
    ? "WHERE " + whereClauses.join(" AND ")
    : "";

  const [items] = await pool.query(`SELECT * FROM ?? ${whereClause}`, [
    tableName,
    ...values,
  ]);
  return items;
};
