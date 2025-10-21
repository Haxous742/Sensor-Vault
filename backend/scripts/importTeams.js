import fs from "fs";
import csvParser from "csv-parser";
import Team from "../models/Team.js";

const csvFilePath = "./Teams.csv";

export async function importTeamsFromCSV() {
  const teams = [];
  let currentTeam = null;
  let turnCounter = 1; // for serial numbering

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on("data", (row) => {
        const teamName = row["Team Name"]?.trim();
        const role = row["Candidate role"]?.trim();
        const name = row["Candidate's Name"]?.trim();
        const email = row["Candidate's Email"]?.trim().toLowerCase();

        if (teamName) {
          // Start of a new team
          if (currentTeam) teams.push(currentTeam); // push the previous team before starting a new one

          currentTeam = {
            name: teamName,
            turn: turnCounter++,
            leader: { name: "", email: "" },
            members: [],
          };
        }

        // If we're processing a team
        if (currentTeam) {
          if (role === "Team Leader") {
            currentTeam.leader = { name, email };
          } else if (role === "Team Member") {
            currentTeam.members.push({ name, email });
          }
        }
      })
      .on("end", async () => {
        // Push last team
        if (currentTeam) teams.push(currentTeam);

        console.log(`✅ Parsed ${teams.length} teams from CSV.`);

        // Insert or update MongoDB entries
        for (const teamData of teams) {
          try {
            const existingTeam = await Team.findOne({ name: teamData.name });
            if (existingTeam) {
              console.log(`⚠️ Team already exists: ${teamData.name}`);
            } else {
              await Team.create(teamData);
              console.log(`✅ Added team: ${teamData.name}`);
            }
          } catch (err) {
            console.error(`❌ Error adding team ${teamData.name}:`, err.message);
          }
        }

        resolve();
      })
      .on("error", reject);
  });
}
