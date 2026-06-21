import dotenv from "dotenv";
import app from "./app.js";
import { checkDatabaseConnection } from "./db.js";

dotenv.config();

const port = Number(process.env.PORT || 3001);

async function startServer() {
  try {
    console.log("Verificando conexión a base de datos...");

    await checkDatabaseConnection();

    console.log("Base de datos conectada");

    app.listen(port, () => {
      console.log(`Backend escuchando en puerto ${port}`);
    });

  } catch (error) {
    console.error("DB no lista, pero el backend seguirá ejecutándose");

    app.listen(port, () => {
      console.log(`Backend iniciado en puerto ${port} (sin validar DB)`);
    });
  }
}

startServer();
