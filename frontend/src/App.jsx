import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://ce6d-197-248-74-74.ngrok-free.app", { transports: ["websocket"] });

function ChatComponent() {
    const [message, setMessage] = useState({ title: "", content: "" });
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(socket.connected); // Track connection status

    useEffect(() => {
        // Listen for successful connection
        socket.on("connect", () => {
            console.log("Connected to server:", socket.id);
            setIsConnected(true);
        });

        // Fetch previous messages when connected
        socket.on("previousMessages", (msgs) => {
            setMessages(msgs);
        });

        // Listen for real-time messages
        socket.on("message", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });
        socket.on("messageDeleted", (id) => {
          setMessages((prev) => prev.filter((msg) => msg._id !== id)); // Remove from UI
      });

        // Handle disconnection
        socket.on("disconnect", () => {
            console.log("Disconnected from server");
            setIsConnected(false);
        });

        return () => {
            socket.off("connect");
            socket.off("previousMessages");
            socket.off("message");
            socket.off("disconnect");
            socket.off("messageDeleted");
        };
    }, []);

    const sendMessage = () => {
        if (message.title.trim() && message.content.trim()) {
            socket.emit("message", message);
            setMessage({ title: "", content: "" });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
                <div className={`text-center p-2 mb-4 rounded-md ${isConnected ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
                    {isConnected ? "Connected to server" : "Disconnected"}
                </div>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Note App</h2>

                <div className="space-y-2 max-h-64 overflow-y-auto p-4 border rounded-md bg-gray-50">
                    {messages.length > 0 ? (
                        messages.map((msg, index) => (
                            <div key={index} className="p-2 bg-white shadow-sm flex flex-row rounded-md">
                                <div className="flex-1 flex flex-col">
                                <span className="text-gray-500 text-sm">{new Date(msg.createdAt).toLocaleString()}</span>
                                <p className="font-bold text-blue-600">{msg.title}</p>
                                <p className="text-gray-700">{msg.content}</p>
                                </div>
                                <button
                                onClick={async () => socket.emit("deletemessage", msg._id)}
                                 className="bg-red-500 px-3 hover:cursor-pointer py-1 rounded-md hover:bg-red-600 text-white">Delete</button>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center">No messages yet</p>
                    )}
                </div>

                <div className="mt-4 space-y-3">
                    <input
                        type="text"
                        value={message.title}
                        onChange={(e) => setMessage({ ...message, title: e.target.value })}
                        placeholder="Enter title..."
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                        value={message.content}
                        onChange={(e) => setMessage({ ...message, content: e.target.value })}
                        placeholder="Enter message..."
                        rows="4"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none"
                    ></textarea>
                    <button
                        onClick={sendMessage}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition-all"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChatComponent;
