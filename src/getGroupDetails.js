// const { sock } = require("../sockConnection")();

// const sockConnection= require("../sockConnection");
// const { sock, saveCreds } = sockConnection()

const getGroupDetails = async (sock, groupId) => {
  // await sock.groupMetadata(message.key.remoteJid);
  const groupMetadata = await sock.groupMetadata(groupId);
  const groupDetails = {
    id: groupMetadata.id,
    subject: groupMetadata.subject,
    created: groupMetadata.creation,
    owner: groupMetadata.owner,
    description: groupMetadata.desc,
    participantsCount: groupMetadata.participants.length,
    participantsList: groupMetadata.participants,
  };

  return groupDetails;
};

module.exports = getGroupDetails;
