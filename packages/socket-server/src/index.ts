import { Server, Socket } from "socket.io";
import { connect } from "mongoose";
import { routes } from "./routes";

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

const startSocketServer = () => {
  const io = new Server();
  io.on("connection", (socket: Socket) => routes(io, socket));
  io.listen(3000);
  console.log("Server started on port 3000");
};

const main = async () => {
  await connectToMongoDB();
  startSocketServer();
};

main();
