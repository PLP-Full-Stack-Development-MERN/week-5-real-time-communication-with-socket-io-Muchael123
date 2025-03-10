import express, { json } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { connect } from "mongoose";
import cors from "cors";
import notesRouter from "./routes/notes.route.js";
import Note from "./models/notes.js";
import { title } from "process";

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

io.on("connection", async (socket) => {
    console.log(`Client connected: ${socket.id}`);

    try {
        
        const pastNotes = await Note.find();
        socket.emit("previousMessages", pastNotes); 
    } catch (err) {
        console.error("Error fetching messages:", err);
        socket.emit("error", { error: "Failed to load previous messages" });
    }

    socket.on("message", async (msg) => {
        console.log(`Note received:`, msg);

        try {
            const savedNote = new Note({ title: msg.title, content: msg.content });
            await savedNote.save();
            io.emit("message", savedNote);
        } catch (err) {
            console.error(err);
            socket.emit("error", { error: "An error occurred while saving the note" });
        }
    });

    socket.on("deletemessage", async(id) => {
        console.log(`Note deleted:`, id);
        try {
            await Note.findByIdAndDelete(id);
            io.emit("messageDeleted", id);
        } catch (err) {
            console.error(err);
            socket.emit("error", { error: "An error occurred while deleting the note" });
        }
    })

    socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, ()=> console.log(`Server is running on http://localhost:${PORT}`));
