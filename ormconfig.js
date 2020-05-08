module.exports = {
  type: "sqlite",
  name: "default",
  database: "./database.sqlite",
  synchronize: true,
  logging: false,
  entities: ["src/entity/**/*.ts", "out/entity/**/*.js"],
  migrations: ["src/migration/**/*.ts", "out/migration/**/*.js"],
  subscribers: ["src/subscriber/**/*.ts", "out/subscriber/**/*.js"],
  cli: {
    entitiesDir: "src/entity",
    migrationsDir: "src/migration",
    subscribersDir: "src/subscriber",
  },
};
