module.exports = {
  type: "postgres",
  name: "default",
  synchronize: true,
  entities: ["out/entity/**/*.js"],
  migrations: ["out/migration/**/*.js"],
  subscribers: ["out/subscriber/**/*.js"],
  cli: {
    entitiesDir: "src/entity",
    migrationsDir: "src/migration",
    subscribersDir: "src/subscriber",
  },
};
