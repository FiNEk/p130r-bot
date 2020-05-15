const rootDir = process.env.NODE_ENV === "development" ? "src" : "out";
module.exports = {
  type: "sqlite",
  name: "default",
  database: "./database.sqlite",
  synchronize: true,
  logging: false,
  entities: [`${rootDir}/entity/**/*.{ts,js}`],
  migrations: [`${rootDir}/migration/**/*.{ts,js}`],
  subscribers: [`${rootDir}/subscriber/**/*.{ts,js}`],
  cli: {
    entitiesDir: `${rootDir}/entity`,
    migrationsDir: `${rootDir}/migration`,
    subscribersDir: `${rootDir}/subscriber`,
  },
};
