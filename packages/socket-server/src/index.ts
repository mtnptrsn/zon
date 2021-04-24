import { Server, Socket } from "socket.io";
import { connect } from "mongoose";
import { routes } from "./routes";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { RoomModel } from "./models/RoomModel";
import { ticker } from "./ticker";

const port = Number(process.env.PORT) || 3000;

const connectToMongoDB = async () => {
  console.log("Connecting to MongoDB...");
  await connect("mongodb://localhost:27017", {
    user: "root",
    pass: "rootpassword",
    dbName: "orient",
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: "admin",
  });
  console.log("Successfully connected to MongoDB");
};

const initiateSocketServer = () => {
  const io = new Server();
  io.on("connection", (socket: Socket) => {
    routes(io, socket);
  });
  io.listen(port);
  console.log(`Server started on port ${port}`);

  return io;
};

const initiateTicker = (io: Server<DefaultEventsMap, DefaultEventsMap>) => {
  setInterval(() => {
    ticker(io);
  }, 3000);
};

const main = async () => {
  await connectToMongoDB();
  const io = initiateSocketServer();
  initiateTicker(io);
};

main();
