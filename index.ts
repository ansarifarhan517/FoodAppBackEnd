import express from 'express';
import App from './services/ExpressApp'
import DBConnection from './services/Database'

const PORT = 9000;

const StartServer = async () => {
  const app = express();
  await DBConnection()
  await App(app);

  app.listen(PORT, () => console.log(`Server Started ${PORT}`))

}
StartServer();