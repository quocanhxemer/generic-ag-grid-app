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

const columnsName = new Map();

const getColumnNames = async (tableName) => {
  if (columnsName.has(tableName)) {
    return columnsName.get(tableName);
  }

  const [columnsData] = await pool.query(`SHOW COLUMNS FROM ??`, [tableName]);
  const cols = columnsData.map((c) => `\`${c.Field}\``);
  columnsName.set(tableName, cols);
  return cols;
};

const isValidColumn = async (tableName, column) => {
  const columns = await getColumnNames(tableName);
  return columns.includes(`\`${column}\``);
};

export const queryItems = async (
  tableName,
  option = { search: "", filters: [] },
) => {
  // option.filters in form [{column, operation, value}, ...]
  const whereClauses = [];
  const values = [];
  if (option.filters) {
    for (const filter of option.filters) {
      // Validate column name - against maybe SQL injection
      if (!(await isValidColumn(tableName, filter.column))) {
        throw new Error(`Invalid column name: ${filter.column}`);
      }

      switch (filter.operation) {
        case "contains":
          whereClauses.push(`\`${filter.column}\` LIKE ?`);
          values.push(`%${filter.value}%`);
          break;
        case "equals":
          whereClauses.push(`\`${filter.column}\` = ?`);
          values.push(filter.value);
          break;
        case "starts_with":
          whereClauses.push(`\`${filter.column}\` LIKE ?`);
          values.push(`${filter.value}%`);
          break;
        case "ends_with":
          whereClauses.push(`\`${filter.column}\` LIKE ?`);
          values.push(`%${filter.value}`);
          break;
        case "is_empty":
          whereClauses.push(
            `(\`${filter.column}\` IS NULL OR \`${filter.column}\` = '')`,
          );
          break;
        case "greater_than":
          whereClauses.push(`\`${filter.column}\` > ?`);
          values.push(filter.value);
          break;
        case "less_than":
          whereClauses.push(`\`${filter.column}\` < ?`);
          values.push(filter.value);
          break;
        default:
          throw new Error(`Unsupported operation: ${filter.operation}`);
      }
    }
  }

  if (option.search) {
    const searchColumns = (await getColumnNames(tableName)).join(", ");
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
