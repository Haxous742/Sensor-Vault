import fs from "fs";
import csvParser from "csv-parser";
import Team from "../models/Team.js";

const csvFilePath = "./Teams.csv";

export async function importTeamsFromCSV() {
  const teamNames = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on("data", (row) => {
        // Assume first column has the team name (could also use Object.keys(row)[0])
        const firstColumn = Object.values(row)[0];
        if (firstColumn && firstColumn.trim()) {
          teamNames.push(firstColumn.trim());
        }
      })
      .on("end", async () => {
        console.log("✅ CSV parsed successfully");

        // Insert teams into MongoDB
        for (const name of teamNames) {
          try {
            const exists = await Team.findOne({ name });
            if (!exists) {
              await Team.create({
                name,
                turn: 0,
                leader: { name: "Default Leader", email: "leader@example.com" },
                members: [
                  { name: "Member 1", email: "member1@example.com" },
                  { name: "Member 2", email: "member2@example.com" },
                ],
              });
              console.log(`✅ Added team: ${name}`);
            } else {
              console.log(`⚠️  Team already exists: ${name}`);
            }
          } catch (err) {
            console.error(`❌ Error adding ${name}:`, err.message);
          }
        }

        resolve();
      })
      .on("error", reject);
  });
}
