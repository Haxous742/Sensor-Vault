import mongoose from "mongoose";
const { Schema } = mongoose;

const teamSchema = new Schema(
  {
    
    name: { type: String, required: true },
    turn: {type: Integer},
    
    leader: {
      name: { type: String, required: true },
      email: { type: String, required: true, lowercase: true},
    },
    
    
    members: [
      {
        name: { type: String, required: true},
        email: { type: String, required: true, lowercase: true},
      },
    ],
    






  },
  
  { timestamps: true }
);

export default mongoose.model("Team", teamSchema);
