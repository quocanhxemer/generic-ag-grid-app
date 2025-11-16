import mysql from "mysql2/promise";
import csvtojson from "csvtojson";
import dotenv from "dotenv";

dotenv.config();

let pool;
try {
  pool = mysql.createPool({
    host: process.env.MYSWL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });
  await pool.query(`DROP TABLE IF EXISTS ${process.env.MYSQL_DEFAULT_TABLE}`);
  await pool.query(`CREATE TABLE ${process.env.MYSQL_DEFAULT_TABLE} (
    \`ID\` INT PRIMARY KEY AUTO_INCREMENT,
    \`Brand\` VARCHAR(255),
    \`Model\` VARCHAR(255),
    \`AccelSec\` DECIMAL(5, 2),
    \`TopSpeed_KmH\` INT,
    \`Range_Km\` INT,
    \`Efficiency_WhKm\` INT,
    \`FastCharge_KmH\` INT,
    \`RapidCharge\` VARCHAR(10),
    \`PowerTrain\` VARCHAR(50),
    \`PlugType\` VARCHAR(50),
    \`BodyStyle\` VARCHAR(50),
    \`Segment\` VARCHAR(10),
    \`Seats\` INT,
    \`PriceEuro\` INT,
    \`Date\` VARCHAR(50)
  )`);

  const jsonArray = await csvtojson().fromFile(
    "./default-database/sample_input.csv",
  );
  for (const {
    Brand,
    Model,
    AccelSec,
    TopSpeed_KmH,
    Range_Km,
    Efficiency_WhKm,
    FastCharge_KmH,
    RapidCharge,
    PowerTrain,
    PlugType,
    BodyStyle,
    Segment,
    Seats,
    PriceEuro,
    Date,
  } of jsonArray) {
    await pool.query(
      `INSERT INTO ${process.env.MYSQL_DEFAULT_TABLE} 
        (Brand, Model, AccelSec, TopSpeed_KmH, Range_Km, Efficiency_WhKm, FastCharge_KmH, RapidCharge, PowerTrain, PlugType, BodyStyle, Segment, Seats, PriceEuro, Date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Brand,
        Model,
        AccelSec,
        TopSpeed_KmH,
        Range_Km,
        Efficiency_WhKm,
        FastCharge_KmH,
        RapidCharge,
        PowerTrain,
        PlugType,
        BodyStyle,
        Segment,
        Seats,
        PriceEuro,
        Date,
      ].map((value) => (value === "-" ? null : value)),
    );
  }
} catch (error) {
  console.error("Error loading default data: " + error);
} finally {
  await pool.end();
}
