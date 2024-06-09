import { WebSocketServer, WebSocket } from "ws";

interface Room {
  sender: WebSocket | null;
  receiver: WebSocket | null;
}

const wss = new WebSocketServer({ port: 8080 });
const rooms: { [key: string]: Room } = {}; //..........

wss.on("connection", (socket) => {
  socket.on("error", (err) => console.log("Something Went Wrong", err));

  socket.on("message", (data: any) => {
    const message = JSON.parse(data);

    const { type, roomId } = message;

    if (!roomId) {
      console.error("Room ID is missing");
      return;
    }

    if (!rooms[roomId]) {
      rooms[roomId] = {
        sender: null,
        receiver: null,
      };
    }

    switch (type) {
      case "identify-sender":
        console.log(`Sender Joined the room ${roomId}`);
        rooms[roomId].sender = socket;
        (socket as any).roomId = roomId;
        break;
      case "identify-receiver":
        console.log(`Receiver Joined the room ${roomId}`);
        rooms[roomId].receiver = socket;
        (socket as any).roomId = roomId;
        break;
      case "create-offer":
      case "create-answer":
      case "ice-candidate":
        handleMessage(socket, message, roomId);
        break;
      default:
        console.warn(`Unknown message type: ${type}`);
    }
  });

  socket.on("close", () => {
    const roomId = (socket as any).roomId;
    if (roomId && rooms[roomId]) {
      if (rooms[roomId].sender == socket) {
        rooms[roomId].sender = null;
      } else if (rooms[roomId].receiver == socket) {
        rooms[roomId].receiver = null;
      }
      if (!rooms[roomId].sender && !rooms[roomId].receiver) {
        delete rooms[roomId];
      }
      console.log(`Socket disconnected from room ${roomId}`);
    }
  });
});

const handleMessage=(socket:WebSocket,message:any,roomId:string)=>{
    const type=message.type;
    const room=rooms[roomId];
    let target:WebSocket |null=null;

    if(type==="create-offer" || type === "ice-candidate" && socket==room.sender){
        console.log("Offer Created")
        target=room.receiver;
    }
    else if(type === "create-answer" || type ==="ice-candidate" && socket== room.receiver){
        console.log("Answer Given")
        target=room.sender;
    }

    if(target){
        target.send(JSON.stringify(message));
    }

}

console.log('WebSocket server is running on ws://localhost:8080');
