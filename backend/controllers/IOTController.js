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

  const correctAnswer= team.task2CorrectAnswer;
  
  
  // save current answer to db unconditionally
  team.task2CurrentAnswer=current;
  await team.save();    

  console.log("Correct Answer:", correctAnswer);
  console.log("Current Answer:", current);
  

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




export const taskMagneticController = async (req, res) => {
  const { current } = req.body;

  if (!current || !Array.isArray(current) || current.length !== 9) {
    console.error('Invalid current array:', current); 
    return res.status(400).json({ message: "Invalid current value: Must be a 9-element array" });
  }

  const validatedCurrent = current.map(val => {
    const num = Number(val);
    return (num === 0 || num === 1 || num === -1) ? num : 0;
  });

  const io = getIO();
  const team = await Team.findOne({ current: true });

  if (!team) {
    return res.status(404).json({ message: "No team found with current task active" });
  }

  const correctAnswer = team.task3CorrectAnswer;
  
  let normalizedCorrect;
  if (Array.isArray(correctAnswer)) {
    normalizedCorrect = correctAnswer;
  } else {
    normalizedCorrect = []; // Fallback for invalid
  }

  normalizedCorrect = [...normalizedCorrect, ...Array(9 - normalizedCorrect.length).fill(0)].slice(0, 9);

  console.log('Validated current:', validatedCurrent); 
  console.log('Normalized correct:', normalizedCorrect); 

  const isMatch = JSON.stringify(normalizedCorrect) === JSON.stringify(validatedCurrent);

  team.task3CurrentAnswer = validatedCurrent;
  await team.save();

  if (isMatch) {   
    team.task3Done = true;
    await team.save();
    io.emit("task3Update", { current: validatedCurrent, isDone: true });
    res.status(200).json({ message: "Correct answer!", isCorrect: true });
  } else {
    io.emit("task3Update", { current: validatedCurrent, isDone: false });
    res.status(200).json({ message: "Incorrect answer!", isCorrect: false });
  }
};