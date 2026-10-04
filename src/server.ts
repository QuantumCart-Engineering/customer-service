import app from "./app";

import { env } from "./config/env";

const server =
    app.listen(
        env.port,
        () => {
            console.log(
                `Customer Service running on port ${env.port}`
            );
        }
    );

const shutdown = (
    signal: string
): void => {

    console.log(
        `${signal} received. Shutting down...`
    );

    server.close(() => {

        console.log(
            "Customer Service stopped."
        );

        process.exit(0);
    });
};

process.on(
    "SIGTERM",
    () => shutdown("SIGTERM")
);

process.on(
    "SIGINT",
    () => shutdown("SIGINT")
);