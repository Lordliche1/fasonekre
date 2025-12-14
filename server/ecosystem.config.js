module.exports = {
    apps: [{
        name: "fasonekre-api",
        script: "./index.js",
        env_production: {
            NODE_ENV: "production",
            PORT: 3000,
            MONGO_URI: "mongodb://127.0.0.1:27017/municipal-db",
            JWT_SECRET: "FASONEKRE_SECRET_KEY_2025_SECURE"
        }
    }]
}
