import { Server, Socket } from "socket.io";
import { connect } from "mongoose";
import { routes } from "./routes";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { ticker } from "./ticker";
import dotenv from "dotenv";

const port = Number(process.env.PORT) || 3000;

const getDBName = (mongoUrl: string) =>
  /mongodb.*\/\/.*:.*@.*\/(?<dbname>([A-z]|-|_)*).*/g.exec(mongoUrl)?.groups
    ?.dbname || "";

const connectToMongoDB = async () => {
  console.log("Connecting to MongoDB...");
  await connect(process.env.MONGO_URL as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: "admin",
  });
  console.log(
    `Successfully connected to MongoDB: ${process.env.MONGO_URL as string}`
  );
};

const initiateSocketServer = () => {
  const io = new Server();
  io.on("connection", (socket: Socket) => {
    console.log("Client connected!");
    routes(io, socket);
  });
  io.listen(port);
  console.log(`Server started on port ${port}`);

  return io;
};

const initiateTicker = (io: Server<DefaultEventsMap, DefaultEventsMap>) => {
  setInterval(() => {
    ticker(io);
  }, 2000);
};

const main = async () => {
  dotenv.config();
  await connectToMongoDB();
  const io = initiateSocketServer();
  initiateTicker(io);
};

main();
