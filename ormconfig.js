module.exports = {
  type: "sqlite",
  name: "default",
  database: "./database.sqlite",
  synchronize: true,
  logging: false,
  entities: ["out/entity/**/*.js"],
  migrations: ["out/migration/**/*.js"],
  subscribers: ["out/subscriber/**/*.js"],
  cli: {
    entitiesDir: "src/entity",
    migrationsDir: "src/migration",
    subscribersDir: "src/subscriber",
  },
};
