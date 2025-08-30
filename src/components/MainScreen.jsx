import React, { useState, useEffect, useContext } from 'react';
import { GlobalContext } from "./GlobalContext";
import SandPackEditor  from "./SandPackEditor";
import "../index.css"; 

const MainScreen = (props) => {
  const { escapp, appSettings, Utils, I18n } = useContext(GlobalContext);
  const [currentSolution, setCurrentSolution] = useState([]);
 
 
  const checkSol = (value) => {
     const solution = value.map(s=> (s.name + (s.status == "passed") ? "1" : ("error" + s.error))).join(";");
     Utils.log("Check solution", solution);
        escapp.checkNextPuzzle(solution, {}, (success, erState) => {
          Utils.log("Check solution Escapp response", success, erState);
          try {
            setTimeout(() => {
              console.log("Set light to", success ? "ok" : "error");
            }, 700);
          } catch(e){
            Utils.log("Error in checkNextPuzzle",e);
          }
        });
  
  }

  const  submitPuzzleSolution = (value) => {
    const solution = value.map(s=> (s.name + (s.status == "passed") ? "1" : ("error" + s.error))).join(";");
    Utils.log("Submit puzzle solution", solution);

    escapp.submitNextPuzzle(solution, {}, (success, erState) => {
      
      Utils.log("Solution submitted to Escapp", solution, success, erState);
    });
  }


  return (
    <div id="screen_main" className={"screen_content"} >
        <SandPackEditor checkSol={checkSol} sendSol={submitPuzzleSolution}/>
    </div>);
};

export default MainScreen;


