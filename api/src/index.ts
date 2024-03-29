import { initApp } from './api';

const PORT = parseInt(process.env.API_PORT || '') || 8080;

const URL_DATA_FILE = process.env.URL_DATA_FILE || './urlData.json';

async function startApp() {
  const app = await initApp(URL_DATA_FILE);

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startApp();
