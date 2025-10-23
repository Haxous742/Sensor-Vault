import Team from "../models/Team.js";
import { getIO } from "../socket/socket.js";




export const taskArrowsController = async(req, res) => {
  const { current } = req.body;

  if(!current || typeof current !== 'string'){
    return res.status(400).json({message:"Invalid current value"});
  }

  const io = getIO();

  const team = await Team.findOne({current:true});

  if(!team ){
    res.status(404).json({message:"No team found with current task active"});
  }

  const correctAnswer= team.task1CorrectAnswer;
  
  
  // save current answer to db unconditionally
  team.task1CurrentAnswer=current;
  await team.save();


  if(correctAnswer===current){
    team.task1Done=true;
    await team.save();
    io.emit("task1Update", { current:current, isDone:true });
    res.status(200).json({team:team.name ,message:"Correct answer!", isCorrect:true});
  }
  else{
    io.emit("task1Update", { current:current, isDone:false });
    res.status(200).json({team:team.name ,message:"Incorrect answer!", isCorrect:false});
  }
};




// ==========================================================================================





export const taskDistanceController = async(req, res) => {
  const { current } = req.body;

   if(!current || typeof current !== 'string'){
    return res.status(400).json({message:"Invalid current value"});
  }

  const io = getIO();

  const team = await Team.findOne({current:true});

  if(!team){
    res.status(404).json({message:"No team found with current task active"});
  }

  const correctAnswer= team.task2CorrectAnswer;
  
  
  // save current answer to db unconditionally
  team.task2CurrentAnswer=current;
  await team.save();    

    if(correctAnswer===current){   
        team.task2Done=true;
        await team.save();
        io.emit("task2Update", { current:current, isDone:true });
        res.status(200).json({message:"Correct answer!", isCorrect:true});
    }
    else{
        io.emit("task2Update", { current:current, isDone:false });
        res.status(200).json({message:"Incorrect answer!", isCorrect:false});
    }
};




// ==========================================================================================





export const taskMorseController = async(req, res) => {
  const { current } = req.body;

   if(!current || typeof current !== 'string'){
    return res.status(400).json({message:"Invalid current value"});
  }

  const io = getIO();

  const team = await Team.findOne({current:true});

  if(!team){
    res.status(404).json({message:"No team found with current task active"});
  }

  const correctAnswer= team.task3CorrectAnswer;
  
  
  // save current answer to db unconditionally
  team.task3CurrentAnswer=current;
  await team.save();    

    if(correctAnswer===current){   
        team.task3Done=true;
        await team.save();
        io.emit("task3Update", { current:current, isDone:true });
        res.status(200).json({message:"Correct answer!", isCorrect:true});              
    }
    else{
        io.emit("task3Update", { current:current, isDone:false });
        res.status(200).json({message:"Incorrect answer!", isCorrect:false});
    }
};




// ==========================================================================================



export const taskMagneticController = async(req, res) => {
  const { current } = req.body;

   if(!current || typeof current !== 'string'){
    return res.status(400).json({message:"Invalid current value"});
  }

  const io = getIO();

  const team = await Team.findOne({current:true});

  if(!team){
    res.status(404).json({message:"No team found with current task active"});
  }

  const correctAnswer= team.task4CorrectAnswer;
  
  
  // save current answer to db unconditionally
  team.task4CurrentAnswer=current;
  await team.save();    

    if(correctAnswer===current){   
        team.task4Done=true;
        await team.save();
        io.emit("task4Update", { current:current, isDone:true });
        res.status(200).json({message:"Correct answer!", isCorrect:true});              
    }
    else{
        io.emit("task4Update", { current:current, isDone:false });
        res.status(200).json({message:"Incorrect answer!", isCorrect:false});
    }
};