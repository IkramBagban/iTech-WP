// filePath;
const fs = require("fs");

const readFileFn = (filePath, cb) => {
  fs.readFile(filePath, "utf-8", (err, data) => {
    try {
      if (err) {
        console.error("Error reading file:", err);
        cb([]);
        return;
      }

      cb(JSON.parse(data));
    } catch (error) {
      cb([]);
      console.error("Error parsing JSON from file:", error);
      return;
    }
  });
};

module.exports = readFileFn;

// readFileFn(filePath, (data) => {
//     // Initialize groupsDetailArray with an empty array as default
//     let groupsDetailArray = data;
  
//     const groupIdx = groupsDetailArray.findIndex(
//       (group) => group.id === groupDetails.id
//     );
//     if (groupIdx === -1) {
//       groupsDetailArray.push(groupDetails);
//     } else {
//       groupsDetailArray[groupIdx] = groupDetails;
//     }
  
//     // Write the updated array back to the file
//     fs.writeFile(groupDetailPath, JSON.stringify(groupsDetailArray), (err) => {
//       if (err) {
//         console.error("Error writing file:", err);
//       }
//     });
//   });
  