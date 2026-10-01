import fs from "fs";
import path from "path";

import mysql from "mysql2/promise";

import { env } from "../config/env";

const migrationsDirectory =
    path.join(
        __dirname,
        "../migrations"
    );

const runMigrations = async (): Promise<void> => {
    const connection =
        await mysql.createConnection({
            host: env.db.host,
            port: env.db.port,
            user: env.dbRoot.user,
            password:
                env.dbRoot.password,
            database: env.db.name,
            multipleStatements: true
        });

    try {
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                migration_name VARCHAR(255) NOT NULL UNIQUE,
                applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const [appliedRows] =
            await connection.execute<
                mysql.RowDataPacket[]
            >(
                `SELECT migration_name
                 FROM schema_migrations
                 ORDER BY id`
            );

        const appliedMigrations =
            new Set(
                appliedRows.map(
                    row =>
                        row.migration_name
                )
            );

        const migrationFiles =
            fs.readdirSync(
                migrationsDirectory
            )
            .filter(file =>
                file.endsWith(".sql")
            )
            .sort();

        for (
            const migrationFile
            of migrationFiles
        ) {
            if (
                appliedMigrations.has(
                    migrationFile
                )
            ) {
                continue;
            }

            const migrationPath =
                path.join(
                    migrationsDirectory,
                    migrationFile
                );

            const sql =
                fs.readFileSync(
                    migrationPath,
                    "utf-8"
                );

            console.log(
                `Applying migration: ${migrationFile}`
            );

            await connection.beginTransaction();

            try {
                await connection.query(
                    sql
                );

                await connection.execute(
                    `INSERT INTO schema_migrations
                     (migration_name)
                     VALUES (?)`,
                    [migrationFile]
                );

                await connection.commit();

                console.log(
                    `Applied migration: ${migrationFile}`
                );
            } catch (error) {
                await connection.rollback();
                throw error;
            }
        }

        console.log(
            "Database migrations completed successfully."
        );
    } finally {
        await connection.end();
    }
};

runMigrations().catch(error => {
    console.error(
        "Migration failed:",
        error
    );

    process.exit(1);
});