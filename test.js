const { Client } = require("pg");

const client = new Client({
    host: "postgres-1.cx0sme00gnsc.us-west-2.rds.amazonaws.com",
    port: 5432,
    user: "postgres",
    password: "4345YAdav&",
    database: "postgres",
    ssl: {
        rejectUnauthorized: false,
    },
});

(async () => {
    try {
        await client.connect();
        console.log("✅ Connected!");
        const res = await client.query("SELECT version();");
        console.log(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
})();