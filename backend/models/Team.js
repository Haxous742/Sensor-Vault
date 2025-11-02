import mongoose from "mongoose";
const { Schema } = mongoose;

const teamSchema = new Schema(
  {
    
    name: { type: String, required: true },
    turn: {type: Number, default: 0},
    
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

    isDone: { type: Boolean, default: false },

    result: { type: Boolean, default: false },

    timeTaken: { type: Number, default: 0 }, 

    task1CorrectAnswer: { type: String, default: "NESENWSW" },
    task1CurrentAnswer:{ type: String  },
    task1timeTaken: { type: Number, default: 0 },
    task1Done: { type: Boolean, default: false },

    task2CorrectAnswer: { type: String, default: "125" },
    task2CurrentAnswer:{ type: String  },
    task2timeTaken: { type: Number, default: 0 },
    task2Done: { type: Boolean, default: false },

    task3CorrectAnswer: {
      type: [Number],                 
      default: [0,-1,0,-1,0,-1,0,-1,0]
    },
    task3CurrentAnswer: {
      type: [Number],                
      default: [0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    task3timeTaken: { type: Number, default: 0 },
    task3Done: { type: Boolean, default: false },

    task4CorrectAnswer: { type: String, default: "12243268" },
    task4CurrentAnswer:{ type: String  },
    task4timeTaken: { type: Number, default: 0 },
    task4Done: { type: Boolean, default: false },

    startedAt: { type: Date },
    current: {type: Boolean, default: false},
    lastTaskEndTime: { type: Date },

  },
  
  { timestamps: true }
);

export default mongoose.model("Team", teamSchema);
