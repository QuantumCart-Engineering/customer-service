import fs from "fs";
import path from "path";

import mysql from "mysql2/promise";

import { env } from "../config/env";

const migrationsDirectory =
    path.join(
        __dirname,
        "../migrations"
    );

const createDatabase = async (): Promise<void> => {
    const connection =
        await mysql.createConnection({
            host: env.db.host,
            port: env.db.port,
            user: env.dbRoot.user,
            password:
                env.dbRoot.password
        });

    try {
        const databaseName =
            mysql.escapeId(
                env.db.name
            );

        const applicationUser =
            mysql.escapeId(
                env.db.user
            );

        await connection.execute(
            `CREATE DATABASE IF NOT EXISTS ${databaseName}`
        );

        await connection.query(
            `GRANT ALL PRIVILEGES ON ${databaseName}.* TO ${applicationUser}@'%'`
        );

        await connection.query(
            "FLUSH PRIVILEGES"
        );

        console.log(
            `Database "${env.db.name}" is ready.`
        );
    } finally {
        await connection.end();
    }
};

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

const migrate = async (): Promise<void> => {
    try {
        console.log(
            "Starting database migration..."
        );

        await createDatabase();

        await runMigrations();

        console.log(
            "Database migration completed successfully."
        );
    } catch (error) {
        console.error(
            "Migration failed:",
            error
        );

        process.exit(1);
    }
};

migrate();