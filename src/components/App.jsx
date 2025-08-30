import React from 'react';
import {useState, useEffect, useRef, useContext } from 'react';
import { GlobalContext } from "./GlobalContext";
 

import { DEFAULT_APP_SETTINGS, ESCAPP_CLIENT_SETTINGS, MAIN_SCREEN, MESSAGE_SCREEN } from '../constants/constants.jsx';
import MainScreen from './MainScreen.jsx';
 
export default function App() {
  const { escapp, setEscapp, appSettings, setAppSettings, Storage, setStorage, Utils, I18n } = useContext(GlobalContext);
  const hasExecutedEscappValidation = useRef(false);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState(MAIN_SCREEN); 
  const prevScreen = useRef(screen);
  const solution = useRef(null);
 
  
  useEffect(() => {
    //Init Escapp client
    if(escapp !== null){
      return;
    }
    //Create the Escapp client instance.
    let _escapp = new ESCAPP(ESCAPP_CLIENT_SETTINGS);
    setEscapp(_escapp);
    Utils.log("Escapp client initiated with settings:", _escapp.getSettings());

    //Use the storage feature provided by Escapp client.
    setStorage(_escapp.getStorage());

    //Get app settings provided by the Escapp server.
    let _appSettings = processAppSettings(_escapp.getAppSettings());
    setAppSettings(_appSettings);
    Utils.log("App settings:", _appSettings);

    
  }, []);

  function processAppSettings(_appSettings){
    if(typeof _appSettings !== "object"){
      _appSettings = {};
    }
     
    
  
     // Merge _appSettings with DEFAULT_APP_SETTINGS_SKIN to obtain final app settings
     
    const allowedActions = ["NONE", "SHOW_MESSAGE"];
    if(!allowedActions.includes(_appSettings.actionAfterSolve)) {
      _appSettings.actionAfterSolve = DEFAULT_APP_SETTINGS.actionAfterSolve;
    }

     

    //Init internacionalization module
    I18n.init(_appSettings);

    //Change HTTP protocol to HTTPs in URLs if necessary
    _appSettings = Utils.checkUrlProtocols(_appSettings);

    //Preload resources (if necessary)
    Utils.preloadImages([_appSettings.backgroundMessage]);
    //Utils.preloadAudios([_appSettings.soundBeep,_appSettings.soundNok,_appSettings.soundOk]); //Preload done through HTML audio tags
    //Utils.preloadVideos(["videos/some_video.mp4"]);

    return _appSettings;
  }

  useEffect(() => {
    if (!hasExecutedEscappValidation.current && escapp !== null && appSettings !== null && Storage !== null) {
      hasExecutedEscappValidation.current = true;

      //Register callbacks in Escapp client and validate user.
      escapp.registerCallback("onNewErStateCallback", function(erState){
        try {
          Utils.log("New escape room state received from ESCAPP", erState);
          restoreAppState(erState);
        } catch (e){
          Utils.log("Error in onNewErStateCallback", e);
        }
      });

      escapp.registerCallback("onErRestartCallback", function(erState){
        try {
          Utils.log("Escape Room has been restarted.", erState);
          if(typeof Storage !== "undefined"){
            Storage.removeSetting("state");
          }
        } catch (e){
          Utils.log("Error in onErRestartCallback", e);
        }
      });

      //Validate user. To be valid, a user must be authenticated and a participant of the escape room.
      escapp.validate((success, erState) => {
        try {
          Utils.log("ESCAPP validation", success, erState);
          if(success){
            restoreAppState(erState);
            setLoading(false);
          }
        } catch (e){
          Utils.log("Error in validate callback", e);
        }
      });
    }
  }, [escapp, appSettings, Storage]);

   

  function restoreAppState(erState){
    Utils.log("Restore application state based on escape room state:", erState);
    if (escapp.getAllPuzzlesSolved()){
      //Puzzle already solved
      if((appSettings.actionAfterSolve === "SHOW_MESSAGE")&&(screen !== MESSAGE_SCREEN)){
        setScreen(MESSAGE_SCREEN);
      }
    } else {
      //Puzzle not solved. Restore app state based on local storage.
      restoreAppStateFromLocalStorage();
    }
  }

  function restoreAppStateFromLocalStorage(){
    if(typeof Storage !== "undefined"){
      let stateToRestore = Storage.getSetting("state");
      if(stateToRestore){
        Utils.log("Restore app state", stateToRestore);
        setScreen(stateToRestore.screen);
        if(typeof stateToRestore.solution === "string"){
          solution.current = stateToRestore.solution;
        }
      }
    }
  }

  function saveAppState(){
    if(typeof Storage !== "undefined"){
      let currentAppState = {screen: screen};
      if(screen === MESSAGE_SCREEN){
        currentAppState.solution = solution.current;
      }
      Utils.log("Save app state in local storage", currentAppState);
      Storage.saveSetting("state",currentAppState);
    }
  }




  const renderScreens = (screens) => {
    if (loading === true) {
      return null;
    } else {
      return (
        <>
          {screens.map(({ id, content }) => renderScreen(id, content))}
        </>
      );
    }
  };

  const renderScreen = (screenId, screenContent) => (
    <div key={screenId} className={`screen_wrapper ${screen === screenId ? 'active' : ''}`} >
      {screenContent}
    </div>
  );

  let screens = [
    {
      id: MAIN_SCREEN,
      content: <MainScreen />
    }
  ];

  return (
    <div id="global_wrapper" className={`${(appSettings !== null && typeof appSettings.skin === "string") ? appSettings.skin.toLowerCase() : ''}`}>
      {renderScreens(screens)}
    </div>
  )
}