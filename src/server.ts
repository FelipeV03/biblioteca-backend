import { app } from "./app";
import { env } from "./config/env";
import { sequelize } from "./config/database";

async function start() {
  await sequelize.authenticate();
  console.log("Conexión a MySQL establecida correctamente.");

  app.listen(env.PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${env.PORT}`);
  });
}

start().catch((err) => {
  console.error("No se pudo iniciar el servidor:", err);
  process.exit(1);
});
