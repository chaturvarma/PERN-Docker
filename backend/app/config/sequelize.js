import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
  dialect: "postgres",
  host: "postgres",
  username: "postgres",
  password: "localhost",
  database: "Dev",
  port: 5432,
});

export default sequelize;