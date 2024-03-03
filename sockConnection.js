const { Boom } = require("@hapi/boom");
const path = require("path");
const {
  useMultiFileAuthState,
  DisconnectReason,
  default: makeWASocket,
} = require("@whiskeysockets/baileys");

const sockConnection = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
  });

  return {sock, state, saveCreds}
};

module.exports = sockConnection