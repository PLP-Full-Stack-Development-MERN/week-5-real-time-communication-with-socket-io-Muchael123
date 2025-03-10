import express, { json } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { connect } from "mongoose";
import cors from "cors";
import notesRouter from "./routes/notes.route.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

app.use(cors());
app.use(json());
app.use("/notes", notesRouter);

connect(process.env.MONGO_URI)
.then(()=> console.log("MongoDB Database Connected"))
.catch(err => console.error("MongoDB Error:", err));

io.on("connection", (socket)=> {
    console.log(`connected on: ${socket.id}`);

    socket.on("message", async(msg)=>{
        console.log(`Message received: ${msg}`);

        const savedMessage = new Message({ text: msg });
        await savedMessage.save();

        io.emit("message", savedMessage);
    });

    socket.on("disconnect", ()=> {
        console.log(`sockets disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, ()=> console.log(`Server is running on http://localhost:${PORT}`));
