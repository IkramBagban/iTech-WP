const { Boom } = require("@hapi/boom");
const path = require("path");
const {
  useMultiFileAuthState,
  DisconnectReason,
  default: makeWASocket,
} = require("@whiskeysockets/baileys");
const fs = require("fs");
// const sock = require("./sock");
const getGroupDetails = require("./src/getGroupDetails");
const readFileFn = require("./readAndWriteFile");

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
        connectToWhatsApp();
      } else {
        console.log("Connection closed, not reconnecting");
      }
    } else if (connection === "open") {
      console.log("Opened connection");
    }
  });

  sock.ev.on("creds.update", saveCreds);

  const groupDetailPath = path.join(__dirname, "/groupsDetail.json");

  sock.ev.on("messages.upsert", async (m) => {
    const message = m.messages[0];

    // Check if the message is from a group and starts with the prefix
    if (
      message.key.remoteJid.endsWith("@g.us") &&
      message.message?.conversation?.startsWith("!.")
    ) {
      console.log("Received group command:", message.message.conversation);
      const groupDetails = await getGroupDetails(sock, message.key.remoteJid);
      //   fs.readFile(groupDetailPath, "utf-8", (err, data) => {
      //     if (err) {
      //       console.error("Error reading file:", err);
      //       return;
      //     }

      //     // Initialize groupsDetailArray with an empty array as default
      //     let groupsDetailArray = [];

      //     // Try parsing the JSON data from the file
      //     try {
      //       if (data) {
      //         // Check if data is not empty
      //         groupsDetailArray = JSON.parse(data);
      //       }
      //     } catch (parseErr) {
      //       console.error("Error parsing JSON from file:", parseErr);
      //       // Optionally, handle recovery, such as rewriting a valid empty array to the file
      //     //   fs.writeFileSync(groupDetailPath, JSON.stringify([]));
      //       return; // Exit if there's a parsing error after logging it
      //     }

      //     const groupIdx = groupsDetailArray.findIndex(
      //       (group) => group.id === groupDetails.id
      //     );
      //     if (groupIdx === -1) {
      //       groupsDetailArray.push(groupDetails);
      //     } else {
      //       groupsDetailArray[groupIdx] = groupDetails;
      //     }

      //     // Write the updated array back to the file
      //     fs.writeFile(
      //       groupDetailPath,
      //       JSON.stringify(groupsDetailArray),
      //       (err) => {
      //         if (err) {
      //           console.error("Error writing file:", err);
      //         }
      //       }
      //     );
      //   });

      readFileFn(groupDetailPath, (data) => {
        // Initialize groupsDetailArray with an empty array as default
        let groupsDetailArray = data;

        const groupIdx = groupsDetailArray.findIndex(
          (group) => group.id === groupDetails.id
        );
        if (groupIdx === -1) {
          groupsDetailArray.push(groupDetails);
        } else {
          groupsDetailArray[groupIdx] = groupDetails;
        }

        // Write the updated array back to the file
        fs.writeFile(
          groupDetailPath,
          JSON.stringify(groupsDetailArray),
          (err) => {
            if (err) {
              console.error("Error writing file:", err);
            }
          }
        );
      });

      //   const responseMessage = `Group Details:\nID: ${groupDetails.id}\nName: ${
      //     groupDetails.subject
      //   }\nCreated: ${new Date(
      //     groupDetails.created * 1000
      //   ).toUTCString()}\nOwner: ${JSON.stringify(
      //     groupDetails.owner
      //   )}\nDescription: ${groupDetails.description}\nTotal Members: ${
      //     groupDetails.participantsCount
      //   }\nMembers: ${groupDetails.participantsList
      //     .map((participant) => participant.id.split("@")[0])
      //     .join(",\n")}`;

      const responseMessage = `Group Details:\nID: ${groupDetails.id}\nName: ${
        groupDetails.subject
      }\nCreated: ${new Date(
        groupDetails.created * 1000
      ).toUTCString()}\nDescription: ${
        groupDetails.description
      }\nTotal Members: ${groupDetails.participantsCount}`;

      await sock.sendMessage(message.key.remoteJid, { text: responseMessage });
    } else if (message.message?.conversation) {
      console.log("Received message:", message.message.conversation);
    } else {
      console.log(
        "Received non-text message or message without prefix:",
        message
      );
    }
  });
}

connectToWhatsApp();
