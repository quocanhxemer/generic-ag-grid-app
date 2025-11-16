const columnsName = new Map();

export const getColumnNames = async (tableName, pool) => {
  if (columnsName.has(tableName)) {
    return columnsName.get(tableName);
  }

  const [columnsData] = await pool.query(`SHOW COLUMNS FROM ??`, [tableName]);
  const cols = columnsData.map((c) => `\`${c.Field}\``);
  columnsName.set(tableName, cols);
  return cols;
};

export const isValidColumn = async (tableName, column, pool) => {
  const columns = await getColumnNames(tableName, pool);
  return columns.includes(`\`${column}\``);
};

export const getWhereClause = (filter, col) => {
  switch (filter.type) {
    case "contains":
      return [`\`${col}\` LIKE ?`, `%${filter.filter}%`];
    case "notContains":
      return [`\`${col}\` NOT LIKE ?`, `%${filter.filter}%`];
    case "equals":
      return [`\`${col}\` = ?`, `${filter.filter}`];
    case "notEqual":
      return [`\`${col}\` <> ?`, `${filter.filter}`];
    case "startsWith":
      return [`\`${col}\` LIKE ?`, `${filter.filter}%`];
    case "endsWith":
      return [`\`${col}\` LIKE ?`, `%${filter.filter}`];
    case "blank":
      return [`(\`${col}\` IS NULL OR \`${col}\` = '')`];
    case "notBlank":
      return [`\`${col}\` IS NOT NULL AND \`${col}\` <> ''`];
    case "greaterThan":
      return [`\`${col}\` > ?`, `${filter.filter}`];
    case "lessThan":
      return [`\`${col}\` < ?`, `${filter.filter}`];
    default:
      throw new Error(`Unsupported operation: ${filter.type}`);
  }
};
