import { model, Schema } from "mongoose";

const NoteSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }

}, {versionKey: false, timestamps: true});

const Note = model("Note", NoteSchema);
export default Note;