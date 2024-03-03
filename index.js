
const { Boom } = require("@hapi/boom");
const {
  useMultiFileAuthState,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const fs = require("fs");

const { default: makeWASocket } = require("@whiskeysockets/baileys");

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect.error instanceof Boom &&
        lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
      console.log(
        "Connection closed due to",
        lastDisconnect.error,
        "reconnecting",
        shouldReconnect
      );
      if (shouldReconnect) {
        // Attempt to reconnect
        connectToWhatsApp();
      } else {
        console.log("Connection closed, not reconnecting");
      }
    } else if (connection === "open") {
      console.log("Opened connection");
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // sock.ev.on('messages.upsert', async m => {
  //     const message = m.messages[0];
  //     if(message.message.conversation.startsWith('!.')) {
  //         console.log('Received message:', message.message.conversation);
  //         await sock.sendMessage(message.key.remoteJid, {
  //             text: 'Your auto-reply message here'
  //         });
  //     }
  // });
  sock.ev.on("messages.upsert", async (m) => {
    console.log(
      "-------------------------------- m -----------------------------------"
    );
    const message = m.messages[0];
    if (m.messages[0].key.fromMe) {
      console.log("m.messages[0].key", m.messages[0].key.fromMe);
      console.log("M", m);
      console.log("Message ------------- \n ", m.messages[0].key);
      console.log(
        "-------------------------------- message -----------------------------------"
      );
    } else {
      console.log("FROM OTHER");
    }

    let text = "";
    if (message.message?.conversation) {
      text = message.message.conversation;
    }
    else if (message.message?.extendedTextMessage?.text) {
      text = message.message.extendedTextMessage.text;
    }

    else if (message.message?.imageMessage?.caption) {
      text = message.message.imageMessage.caption;
    }
    console.log("text", text);

    if (text.startsWith("!.")) {
      await sock.sendMessage(message.key.remoteJid, {
        text: "Your auto-reply message here", // Replace this with your desired response
      });
    } else {
      console.log("Received non-text message or message without prefix:");
    }
  });
}

connectToWhatsApp();
