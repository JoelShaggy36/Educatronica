import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  Pressable,
  Alert,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  FontAwesome,
  FontAwesome5,
  MaterialIcons,
  MaterialCommunityIcons,
  AntDesign,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Audio } from "expo-av";
import { Camera } from 'expo-camera';
import axios from "axios";
import * as FileSystem from "expo-file-system";
import * as Speech from "expo-speech";
import SVGTop from "../components/SVGTop";
import SVGSimulation from "../components/SVGSimulation";
import styles from "../styles/CodingStyles";
import playSound from "../functions/playSound";
import { levelsElevator, doorElevator } from "../functions/elevatorConstants";
import { SafeAreaView } from "react-native";
import { API_KEY } from "../config";

//Componente principal
export default function CodingScreen() {
  let contadorPiso = 1;
  let numPiso;
  const [nameProgram, setNameProgram] = useState(""); //Variables para ingresar texto en el ProgramName
  const [inputTextCoding, setInputTextCoding] = useState(""); //Variables para ingresar texto
  const [isValid, setIsValid] = useState(false); //Variables para saber si el comando es correcto
  const [isValidCoding, setIsValidCoding] = useState(false); //Variables para saber si todo es automata es correcto
  const [result, setResult] = useState("Ingresa tus comandos"); //Variable para saber cual es el resultado despues de cada estado
  const [resultVerific, setResultVerific] = useState("Comienza tu programa"); //Variable para saber cual es el resultado despues de cada estado
  const navigation = useNavigation(); //Permite hacer la navegacion para los iconos
  const [modalVisible, setModalVisible] = useState(false); //Variable para ver modal
  const [programsSaveds, setProgramsSaveds] = useState([]); //Variable para programas guardados
  const [recording, setRecording] = useState(); //Variable y funcion para grabacion de un audio
  const [recordings, setRecordings] = useState([]); //Variable y funcion para grabaciones de audios
  const inputRefCoding = useRef(); //Varible que apunta al inputTextCoding
  const inputRefName = useRef(); //Varible que apunta al inputTextName
  const [programSelect, setProgramSelect] = useState(null); //Varible de programa seleccionado en el modal
  const [selectedFloor, setSelectedFloor] = useState(1); //Variable de piso seleccionado
  const [modalVisibleSimulation, setModalVisibleSimulation] = useState(false); //Variable para ver modal
  const [iconCompile, setIconCompile] = useState("play-circle"); //Icono que cambia cuando esta compilando
  const [isButtonDisabled, setButtonDisabled] = useState(false); //Se desabilita el boton compilar durante la compilacion
  const [compilationInProgress, setCompilationInProgress] = useState(false); //Estado de compilacion
  const sectionBuildWidth = Dimensions.get("window").width; // Ancho del area para los elementos
  const sectionBuildHeight = Dimensions.get("window").height * 0.7; // Alto del area para los elementos
  const [currentLevelXElevator, setCurrentLevelXElevator] = useState(
    levelsElevator[0]
  ); //Nivel inicial del elevador
  const [currentDoorElevator, setCurrentDoorElevator] = useState(
    doorElevator[1]
  ); //Posicion inicial de la puerta

  //Funcion para cerrar puerta
  function closeDoor() {
    setCurrentDoorElevator(doorElevator[1]);
  }

  //Funcion para abrir puerta
  function openDoor() {
    setCurrentDoorElevator(doorElevator[0]);
  }

  //Funcion para recorrer el elevador de 1 en 1 para subir
  function upNextLevelElevator() {
    setCurrentLevelXElevator((prevLevel) => {
      const currentIndex = levelsElevator.indexOf(prevLevel); // Obtiene el índice del nivel actual en el arreglo de niveles del elevador
      if (currentIndex < levelsElevator.length - 1) {
        // Verificamos si no estamos en el último nivel
        const nextLevel = levelsElevator[currentIndex + 1]; //Recorre el siguiene nivel
        return nextLevel; // Devolvemos el siguiente nivel
      } else {
        Alert.alert("Nivel Máximo", "Ya no se puede subir más");
        return prevLevel; //Devuelve el nivel 7
      }
    });
  }

  //Funcion para recorrer el elevador de 1 en 1 para bajar
  function downNextLevelElevator() {
    setCurrentLevelXElevator((prevLevel) => {
      const currentIndex = levelsElevator.indexOf(prevLevel); // Obtiene el índice del nivel actual en el arreglo de niveles del elevador
      if (currentIndex > 0) {
        // Verificamos si no estamos en el último nivel
        const nextLevel = levelsElevator[currentIndex - 1]; //Recorre el siguiene nivel
        return nextLevel; // Devolvemos el siguiente nivel
      } else {
        Alert.alert("Nivel Minimo", "Ya no se puede bajar más");
        return prevLevel; //Devuelve el nivel 1
      }
    });
  }

  async function startRecording() {
    try {
      // Solicitar permisos de micrófono
      const { status } = await Camera.requestMicrophonePermissionsAsync();
      if (status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        // Configuración del audio
        const recordingOptions = {
          android: {
            extension: '.mp4', // Guardar en MP4 (se probo en .wav .m4a y mp3 y whisper rechaza la transcripcion de voz con expo-av usando esos tipos de grabado)
            outputFormat: 2,
            audioEncoder: 3,
            sampleRate: 8000,
            numberOfChannels: 1,
            bitRate: 128000,
          },
          ios: {
            extension: '.m4a',
            audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
            sampleRate: 8000,
            numberOfChannels: 1,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
        };

        // Crear la grabación
        const recordingObject = new Audio.Recording();
        await recordingObject.prepareToRecordAsync(recordingOptions);
        await recordingObject.startAsync();
        setRecording(recordingObject);
      } else {
        console.error("Permiso de micrófono denegado");
      }
    } catch (err) {
      console.error("Error al iniciar la grabación", err);
    }
  }

  //Detencion de grabacion
  async function stopRecording() {
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    let updatedRecordings = [...recordings];
    //Nueva localizacion del archivo de audio
    const fileUri = `${FileSystem.documentDirectory}recording${Date.now()}.mp4`;
    await FileSystem.copyAsync({
      from: recording.getURI(),
      to: fileUri,
    });
    const { sound } = await recording.createNewLoadedSoundAsync();
    updatedRecordings.push({
      sound: sound,
      file: fileUri,
    });
    setRecordings(updatedRecordings); //Actualizamos la lista de grabacione
    translateSpeechToText(fileUri);
    setRecordings([]); //Limpiamos la lista de grabaciones
  }

  //Llamada al API de Open AI
  async function translateSpeechToText(fileUri) {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: fileUri,
        type: "audio/mp4",
        name: "audio.mp4",
      });
      formData.append("model", "whisper-1");
      formData.append("response_format", "text");
      formData.append("language", "es");
      const response = await axios.post(
        "https://api.openai.com/v1/audio/transcriptions",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
             Authorization: `Bearer ${API_KEY}`,
          },
        }
      );

      const resultSpeech = response.data; //Resultado del reconocimiento del API

      console.log(resultSpeech); //Resultado del reconocimiento del API en concola

      //Creacion de diccionario de palabras
      const modifiedResultSpeech = resultSpeech
        .replace(/Inicio|inicio|INICIO/g, "I") // Reemplazar alguna opcion de Subir por "I"
        .replace(/Fin|fin|FIN/g, "F") // Reemplazar alguna opcion de Bajar por "F"
        .replace(/Enter|enter|ENTER/g, "\n") // Reemplazar alguna opcion de Bajar por "\n"
        .replace(/Sube|sube|suve|Suve|SUBE|SUVE/g, "S") // Reemplazar alguna opcion de Subir por "S"
        .replace(/Baja|baja|vaja|Vaja|BAJA|VAJA/g, "B") // Reemplazar alguna opcion de Bajar por "B"
        .replace(/Para|para|PARA/g, "P") // Reemplazar alguna opcion de Bajar por "P"
        .replace(/Abrir|abrir|ABRIR/g, "A") // Reemplazar alguna opcion de Bajar por "B"
        .replace(/Menor que|menor que|MENOR QUE/g, "<") // Reemplazar alguna opcion de menor que por "<"
        .replace(/Mayor que|mayor que|MAYOR QUE/g, ">") // Reemplazar alguna opcion de mayor que por ">"
        .replace(/Igual que|igual que|IGUAL QUE/g, "=") // Reemplazar alguna opcion de igual que por "="
        .replace(/Diferente que|diferente que|DIFERENTE QUE/g, "!=") // Reemplazar alguna opcion de diferente que por "!="


        .replace(/,/g, "") // Reemplazar "," por ""

        .replace(/\./g, "") // Reemplazar "." por ""

        .replace(/Código|código|CÓDIGO/g, "") //Reemplaza el comando "Codigo" por ""
        .replace(/Nombre|nombre|NOMBRE/g, "") //Reemplaza el comando "Nombre" por ""

        .replace(/Uno|uno|UNO/g, "1") // Reemplazar alguna opcion de Subir por "1"
        .replace(/Dos|dos|DOS/g, "2") // Reemplazar alguna opcion de Subir por "2"
        .replace(/Tres|tres|TRES/g, "3") // Reemplazar alguna opcion de Subir por "3"
        .replace(/Cuatro|cuatro|CUATRO/g, "4") // Reemplazar alguna opcion de Subir por "4"
        .replace(/Cinco|cinco|CINCO/g, "5") // Reemplazar alguna opcion de Subir por "5"
        .replace(/Seis|seis|SEIS/g, "6") // Reemplazar alguna opcion de Subir por "6"
        .replace(/Siete|siete|SIETE/g, "7") // Reemplazar alguna opcion de Subir por "7"
        .replace(/Ocho|ocho|OCHO/g, "8") // Reemplazar alguna opcion de Subir por "8"
        .replace(/Nueve|nueve|NUEVE/g, "9"); // Reemplazar alguna opcion de Subir por "9"

      //Comando para activar el dictado dentro del inputTextCoding
      if (
        resultSpeech.includes("fin") ||
        resultSpeech.includes("Fin") ||
        resultSpeech.includes("FIN")
      ) {
        
        setIsValidCoding(true);
      }

      //Comando para activar el dictado dentro del inputTextCoding
      if (
        resultSpeech.includes("inicio") ||
        resultSpeech.includes("Inicio") ||
        resultSpeech.includes("INICIO")
      ) {
        setInputTextCoding(modifiedResultSpeech);
        checkAutomatonComand(modifiedResultSpeech);
        checkAutomatonCoding(modifiedResultSpeech);
        inputRefCoding.current.focus();
      }

      //Comando para activar el dictado dentro del nameProgram
      if (
        resultSpeech.includes("nombre") ||
        resultSpeech.includes("Nombre") ||
        resultSpeech.includes("NOMBRE")
      ) {
        setNameProgram(modifiedResultSpeech);
        inputRefName.current.focus();
      }

      //Comando para activar ir Ayuda por voz
      if (
        resultSpeech.includes("ayuda") ||
        resultSpeech.includes("Ayuda") ||
        resultSpeech.includes("AYUDA")
      ) {
        await playSound(require("../assets/audio/soundCorrect.mp3"), 1);
        navigation.navigate("HelpCodingScreen");
        Speech.speak("Comando ver ayuda detectado");
      }

      //Compilar
      if (!compilationInProgress) {
        if (
          resultSpeech.includes("compilar") ||
          resultSpeech.includes("Compilar") ||
          resultSpeech.includes("COMPILAR")
        ) {
          await playSound(require("../assets/audio/soundCorrect.mp3"), 1);
          Speech.speak("Comando compilar detectado");
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Esperamos 1 segundo
          setCompilationInProgress(true); // Establece que la compilación está en progreso
          usedElevator(selectedFloor);
        }
      } else {
        Speech.speak("La compilación ya está en progreso");
      }

      //Guardar
      if (
        resultSpeech.includes("guardar") ||
        resultSpeech.includes("Guardar") ||
        resultSpeech.includes("GUARDAR")
      ) {
        await playSound(require("../assets/audio/soundCorrect.mp3"), 1);
        saveProgram();
        Speech.speak("Comando guardar detectado");
      }

      //Comando para piso 7
      if (
        resultSpeech.includes("Piso 7") ||
        resultSpeech.includes("piso 7") ||
        resultSpeech.includes("PISO 7") ||
        resultSpeech.includes("PISO SIETE")
      ) {
        await playSound(require("../assets/audio/soundCorrect.mp3"), 1);
        setSelectedFloor(7);
        setCurrentLevelXElevator(levelsElevator[6]);
        Speech.speak("Comando detectado");
      }

      //Comando para piso 6
      if (
        resultSpeech.includes("Piso 6") ||
        resultSpeech.includes("piso 6") ||
        resultSpeech.includes("PISO 6") ||
        resultSpeech.includes("PISO SEIS")
      ) {
        await playSound(require("../assets/audio/soundCorrect.mp3"), 1);
        setSelectedFloor(6);
        setCurrentLevelXElevator(levelsElevator[5]);
        Speech.speak("Comando detectado");
      }

      //Comando para piso 5
      if (
        resultSpeech.includes("Piso 5") ||
        resultSpeech.includes("piso 5") ||
        resultSpeech.includes("PISO 5") ||
        resultSpeech.includes("PISO CINCO")
      ) {
        await playSound(require("../assets/audio/soundCorrect.mp3"), 1);
        setSelectedFloor(5);
        setCurrentLevelXElevator(levelsElevator[4]);
        Speech.speak("Comando detectado");
      }

      //Comando para piso 4
      if (
        resultSpeech.includes("Piso 4") ||
        resultSpeech.includes("piso 4") ||
        resultSpeech.includes("PISO 4") ||
        resultSpeech.includes("PISO CUATRO")
      ) {
        await playSound(require("../assets/audio/soundCorrect.mp3"), 1);
        setSelectedFloor(4);
        setCurrentLevelXElevator(levelsElevator[3]);
        Speech.speak("Comando detectado");
      }

      //Comando para piso 3
      if (
        resultSpeech.includes("Piso 3") ||
        resultSpeech.includes("piso 3") ||
        resultSpeech.includes("PISO 3") ||
        resultSpeech.includes("PISO TRES")
      ) {
        await playSound(require("../assets/audio/soundCorrect.mp3"), 1);
        setSelectedFloor(3);
        setCurrentLevelXElevator(levelsElevator[2]);
        Speech.speak("Comando detectado");
      }

      //Comando para piso 2
      if (
        resultSpeech.includes("Piso 2") ||
        resultSpeech.includes("piso 2") ||
        resultSpeech.includes("PISO 2") ||
        resultSpeech.includes("PISO DOS")
      ) {
        await playSound(require("../assets/audio/soundCorrect.mp3"), 1);
        setSelectedFloor(2);
        setCurrentLevelXElevator(levelsElevator[1]);
        Speech.speak("Comando detectado");
      }

      //Comando para piso 1
      if (
        resultSpeech.includes("Piso 1") ||
        resultSpeech.includes("piso 1") ||
        resultSpeech.includes("PISO 1") ||
        resultSpeech.includes("PISO UNO")
      ) {
        await playSound(require("../assets/audio/soundCorrect.mp3"), 1);
        setSelectedFloor(selectedFloor);
        setCurrentLevelXElevator(levelsElevator[0]);
        Speech.speak("Comando detectado");
      }

      //Comando borrar
      if (
        resultSpeech.includes("borrar") ||
        resultSpeech.includes("Borrar") ||
        resultSpeech.includes("BORRAR")
      ) {
        await playSound(require("../assets/audio/soundCorrect.mp3"), 1);
        deletedProgram();
        Speech.speak("Comando borrar detectado");
      }

      //Comando para activar ir simulacion por voz
      if (
        resultSpeech.includes("simulación") ||
        resultSpeech.includes("Simulación") ||
        resultSpeech.includes("SIMULACIÓN")
      ) {
        await playSound(require("../assets/audio/soundCorrect.mp3"), 1);
        setModalVisibleSimulation(true);
        Speech.speak("Comando ver simulacion detectado");
      }

      //Comando para activar ir Inicio por voz
      if (
        resultSpeech.includes("Casa") ||
        resultSpeech.includes("casa") ||
        resultSpeech.includes("CASA")
      ) {
        await playSound(require("../assets/audio/soundCorrect.mp3"), 1);
        navigation.navigate("Home");
        Speech.speak("Comando Inicio detectado");
      }

      //Comando para activar ir Ver simulacion por voz
      if (
        resultSpeech.includes("Simular") ||
        resultSpeech.includes("simular") ||
        resultSpeech.includes("SIMULAR")
      ) {
        await playSound(require("../assets/audio/soundCorrect.mp3"), 1);
        navigation.navigate("Simulations");
        Speech.speak("Comando Simular detectado");
      }

      //Comando para activar ir Ayuda de App por voz
      if (
        resultSpeech.includes("Tutorial") ||
        resultSpeech.includes("tutorial") ||
        resultSpeech.includes("TUTORIAL")
      ) {
        await playSound(require("../assets/audio/soundCorrect.mp3"), 1);
        navigation.navigate("HelpAppScreen");
        Speech.speak("Comando Tutorial detectado");
      }

      if (
        !resultSpeech.includes("Piso 7") &&
        !resultSpeech.includes("Piso 6") &&
        !resultSpeech.includes("Piso 5") &&
        !resultSpeech.includes("Piso 4") &&
        !resultSpeech.includes("Piso 3") &&
        !resultSpeech.includes("Piso 2") &&
        !resultSpeech.includes("Piso 1") &&
        !resultSpeech.includes("piso 7") &&
        !resultSpeech.includes("piso 6") &&
        !resultSpeech.includes("piso 5") &&
        !resultSpeech.includes("piso 4") &&
        !resultSpeech.includes("piso 3") &&
        !resultSpeech.includes("piso 2") &&
        !resultSpeech.includes("piso 1") &&
        !resultSpeech.includes("PISO 7") &&
        !resultSpeech.includes("PISO 6") &&
        !resultSpeech.includes("PISO 5") &&
        !resultSpeech.includes("PISO 4") &&
        !resultSpeech.includes("PISO 3") &&
        !resultSpeech.includes("PISO 2") &&
        !resultSpeech.includes("PISO 1") &&
        !resultSpeech.includes("PISO SIETE") &&
        !resultSpeech.includes("PISO SEIS") &&
        !resultSpeech.includes("PISO CINCO") &&
        !resultSpeech.includes("PISO CUATRO") &&
        !resultSpeech.includes("PISO TRES") &&
        !resultSpeech.includes("PISO DOS") &&
        !resultSpeech.includes("PISO UNO") &&
        !resultSpeech.includes("código") &&
        !resultSpeech.includes("Código") &&
        !resultSpeech.includes("CÓDIGO") &&
        !resultSpeech.includes("nombre") &&
        !resultSpeech.includes("Nombre") &&
        !resultSpeech.includes("NOMBRE") &&
        !resultSpeech.includes("ayuda") &&
        !resultSpeech.includes("Ayuda") &&
        !resultSpeech.includes("AYUDA") &&
        !resultSpeech.includes("compilar") &&
        !resultSpeech.includes("Compilar") &&
        !resultSpeech.includes("COMPILAR") &&
        !resultSpeech.includes("casa") &&
        !resultSpeech.includes("Casa") &&
        !resultSpeech.includes("CASA") &&
        !resultSpeech.includes("borrar") &&
        !resultSpeech.includes("Borrar") &&
        !resultSpeech.includes("BORRAR") &&
        !resultSpeech.includes("guardar") &&
        !resultSpeech.includes("Guardar") &&
        !resultSpeech.includes("GUARDAR") &&
        !resultSpeech.includes("simulación") &&
        !resultSpeech.includes("Simulación") &&
        !resultSpeech.includes("SIMULACIÓN") &&
        !resultSpeech.includes("simular") &&
        !resultSpeech.includes("Simular") &&
        !resultSpeech.includes("SIMULAR") &&
        !resultSpeech.includes("inicio") &&
        !resultSpeech.includes("Inicio") &&
        !resultSpeech.includes("INICIO") &&
        !resultSpeech.includes("tutorial") &&
        !resultSpeech.includes("Tutorial") &&
        !resultSpeech.includes("TUTORIAL") 
      ) {
        await playSound(require("../assets/audio/incorrectSound.mp3"), 1);
        Speech.speak(
          `Comando'${resultSpeech}'no valido o posiblemente no lo detecte bien`
        );
      }
    } catch (error) {
      console.error("Fallo de transcripcion", { ...error });
      Alert.alert(
        "Error",
        "El reconocimiento de voz no es posible en Android o hubo un error externo."
      );
    }

    //Eliminamos el archivo del App
    try {
      await FileSystem.deleteAsync(fileUri);
    } catch (error) {
      console.error(
        `Error al eliminar el archivo ${fileUri}: ${error.message}`
      );
    }
  }

  //Funcion para Guardar NombredePrograma y Codigo
  function saveProgram() {
    if (nameProgram === "") {
      Alert.alert(
        "Falta nombre",
        "Por favor, ingresa un nombre para el programa."
      );
    } else if (inputTextCoding === "") {
      Alert.alert("Falta Codigo", "Por favor, ingresa el codigo del programa.");
    } else {
      // Verificar si el programa ya existe en la lista
      const isDuplicate = programsSaveds.some(
        (program) => program.nameProgram === nameProgram
      );
      if (isDuplicate) {
        Alert.alert(
          "Nombre duplicado",
          "Ya existe un programa con el mismo nombre. Por favor, ingresa un nombre diferente."
        );
      } else {
        const programfind = {
          nameProgram: nameProgram,
          inputTextCoding: inputTextCoding,
        };
        setProgramsSaveds([...programsSaveds, programfind]);
        Alert.alert(
          "Programa guardado",
          "El programa ha sido guardado exitosamente"
        );
      }
    }
  }

  //Funcion para cargar NombredePrograma y Codigo desde el modal
  function selectProgram(nameProgramSelect) {
    const selectProgram = programsSaveds.find(
      (program) => program.nameProgram === nameProgramSelect,

    );
    if (selectProgram) {
      setNameProgram(selectProgram.nameProgram);
      setInputTextCoding(selectProgram.inputTextCoding); 
      setSelectedFloor(selectedFloor);
      checkAutomatonComand(selectProgram.inputTextCoding);
      checkAutomatonCoding(selectProgram.inputTextCoding);
      setCurrentLevelXElevator(levelsElevator[selectedFloor]);
      setModalVisible(false);
      setProgramSelect(selectProgram); // Establecer el programa seleccionado
      setResult("Necesito verificar tus comandos");
      setResultVerific("Da un espacio para verificar");
      
      Alert.alert(
        "Programa cargado",
        "El programa ha sido cargado exitosamente"
      );
      setIsValidCoding(true);

    }
    
  }

  //Funcion para borrar el programa cargado desde el modal
  function deletedProgram() {
    if (!inputTextCoding && !nameProgram) {
      Alert.alert("Campos vacios", "Ingrese texto en los campos");
      return; // Salir de la función sin hacer el borrado
    }
    if (compilationInProgress === false) {
      if (programSelect === null) {
        Alert.alert("Campos restablecidos");
        setInputTextCoding("");
        setNameProgram("");
        setSelectedFloor(selectedFloor);
        setCurrentLevelXElevator(levelsElevator[selectedFloor]);
        setIsValidCoding(false);
        setResult("Comienza tu programa");
        setResultVerific("Ingresa tus comandos");
        return; // Salir de la función sin hacer el borrado
      } else {
        Alert.alert(
          "Confirmar eliminación",
          `¿Estás seguro de que deseas eliminar el programa '${programSelect.nameProgram}'?`,
          [
            {
              text: "Cancelar",
              style: "cancel",
            },
            {
              text: "Eliminar",
              onPress: () => {
                setProgramsSaveds((prevPrograms) =>
                  prevPrograms.filter(
                    (program) =>
                      program.nameProgram !== programSelect.nameProgram
                  )
                );
                setInputTextCoding("");
                setNameProgram("");
                setSelectedFloor(selectedFloor);
                setCurrentLevelXElevator(levelsElevator[selectedFloor]);
                setIsValidCoding(false);
                setResult("Comienza tu programa");
                setResultVerific("Ingresa tus comandos");
                Alert.alert(
                  "Programa Borrado",
                  "El programa ha sido borrado exitosamente"
                );
                setProgramSelect(null); // Reiniciar el programa seleccionado
              },
            },
          ]
        );
      }
    } else {
      Alert.alert("Compilacion en curso", "NO es posible borrar");
    }
  }

// Autómata para comando individual
  function automatonComands(input) {
    let currentState = 0; //estado inicial
    let currentFloor = null; //piso actual actualizado 
    let conditionMet = false; //control de condicion if (verdadera o falsa)

    setResult("Ingresa tus comandos");
    const lines = input.split("\n");//separa el texto en lineas (despues de un salto de linea)

    for (let line of lines) { //se va a iterar de linea en linea en ves de carater por caracter
      const tokens = line.trim().split(" ");//se separaran las lineas de codigo por instrucciones (despues de un espacio) y se guaradara en tokens
      if (tokens.length === 0) continue; //si tokens esta vacio continuan las intrucciones

      const command = tokens[0].toLowerCase(); //se manejan mas faciles los comandos (se convierten a minusculas) para no tener I,i,A,a etc 
      switch (currentState) {
        case 0: // Estado inicial
          if (command === "i") {
            const floor = parseInt(tokens[1]); //despues de i debe de haber un numero, se convierte a entero y se pasa ese valor a floor
            if (!isNaN(floor) && floor > 0 && floor <= 7) {//si el piso es un numero entre 1 y 7 
              currentFloor = floor;
              setResult(`Inicio en piso '${currentFloor}'`);
              setSelectedFloor(floor);
              setCurrentLevelXElevator(levelsElevator[floor - 1]);
              currentState = 1;
            } else {
              setResult("Error: Se esperaba un número de piso válido después de I");
              return false;
            }
          } else {
            setResult("Error: El programa debe iniciar con 'I X'");
            return false;
          }
          break;

        case 1: // Estado de operación normal
          if (command === "s" || command === "sub") {//se agrega sub para que sea parecida a la primer version de educatronicapp
            const floors = parseInt(tokens[1]); //se convierte a entero el caracter despues de s o sub
            if (!isNaN(floors)) { //si es un numero 
              currentFloor += floors; //aumenta el valor del piso actual por el numero de pisos que quiere subir
              setResult(`Subiendo a piso '${currentFloor}'`);//mensaje
            } else {
              setResult("Error: Se esperaba un número después de S");
              return false;
            }
          } else if (command === "b" || command === "baj") {
            const floors = parseInt(tokens[1]);
            if (!isNaN(floors)) {
              currentFloor -= floors;
              setResult(`Bajando a piso '${currentFloor}'`);
            } else {
              setResult("Error: Se esperaba un número después de B");
              return false;
            }
          } else if (command === "p" || command === "pausa") {
            const time = parseInt(tokens[1]);
            if (!isNaN(time)) {
              setResult(`Pausa de '${time}' unidades`);
            } else {
              setResult("Error: Se esperaba un número después de Pausa");
              return false;
            }
          } else if (command === "a" || command === "abr") {
            const time = parseInt(tokens[1]);
            if (!isNaN(time)) {
              setResult(`Abrir por '${time}' unidades`);
            } else {
              setResult("Error: Se esperaba un número después de A");
              return false;
            }
          } else if (command === "si" && tokens[1] && tokens[1].toLowerCase() === "piso") { /*condicion si se cumplira
           si[piso]*/
            const operator = tokens[2];//se guarda el operador
            const conditionFloor = parseInt(tokens[3]);//el piso condicional se convierte a entero
            if (isNaN(conditionFloor)) {//si el piso condicional no es un numero
              setResult("Error: Se esperaba un número después de 'Si piso operador'");
              return false;
            }
            if (operator === ">") conditionMet = currentFloor > conditionFloor;
            else if (operator === "<") conditionMet = currentFloor < conditionFloor;
            else if (operator === "=") conditionMet = currentFloor === conditionFloor;
            else if (operator === "<=") conditionMet = currentFloor <= conditionFloor;
            else if (operator === ">=") conditionMet = currentFloor >= conditionFloor;
            else {
              setResult("Error: Operador inválido en 'Si piso'");
              return false;
            }
            if (conditionMet) {
              setResult(`Condición 'Si piso ${operator} ${conditionFloor}' cumplida`);
              currentState = 2; // Si se cumple, pasa al estado 2
          } else {
              setResult(`Condición no cumplida`);
              currentState = 1; // Si no se cumple, regresa al estado 1 (se omiten las instrucciones internas)
          }
          } else if (command === "f" || command === "fin") { //fin de instrucciones sin if
            setResult("Programa finalizado");
            return true;
          } else {
            setResult(`Comando desconocido '${command}'`);
            return false;
          }
          break;

        case 2: // Dentro de una condición cumplida
          if (command === "s" || command === "sub") {
            const floors = parseInt(tokens[1]);
            if (!isNaN(floors)) {
              currentFloor += floors;
              setResult(`Subiendo a piso '${currentFloor}'`);
            } else {
              setResult("Error: Se esperaba un número después de S");
              return false;
            }
          } else if (command === "b" || command === "baj") {
            const floors = parseInt(tokens[1]);
            if (!isNaN(floors)) {
              currentFloor -= floors;
              setResult(`Bajando a piso '${currentFloor}'`);
            } else {
              setResult("Error: Se esperaba un número después de B");
              return false;
            }
          } else if (command === "p" || command === "pausa") {
            const time = parseInt(tokens[1]);
            if (!isNaN(time)) {
              setResult(`Pausa de '${time}' unidades`);
            } else {
              setResult("Error: Se esperaba un número después de Pausa");
              return false;
            }
          } else if (command === "a") {
            const time = parseInt(tokens[1]);
            if (!isNaN(time)) {
              setResult(`Abrir por '${time}' unidades`);
            } else {
              setResult("Error: Se esperaba un número después de A");
              return false;
            }
          } else if (command === "fin" && tokens[1] && tokens[1].toLowerCase() === "si") { //fin si
            setResult("Fin de bloque Si");
            currentState = 1;
          } else {
            setResult(`Comando desconocido '${command}' dentro de Si`);
            return false;
          }
          break;
      }
    }
    return true;
  }

  // Autómata para verificar la estructura del código
  function automatonCoding(input) {
    let currentState = 0;

    setResultVerific("Comienza tu programa");
    const lines = input.split("\n"); //igual se seprara por lineas en ves de caracteres

    for (let line of lines) { //recorrido linea por linea
      const tokens = line.trim().split(" "); //se separan las lineas en pequeñas instrucciones
      if (tokens.length === 0) continue;//si esta vacia continua la siguiente 

      const command = tokens[0].toLowerCase();//se pasa el comando a minusculas para obviar los demas casos
      switch (currentState) { 
        case 0: // Estado inicial (esperando "I")
          if (command === "i") {
            const floor = parseInt(tokens[1]);//se convierte el piso a entero
            if (!isNaN(floor) && floor > 0 && floor <= 7) {// si es un piso ente 1 y 7
              setResultVerific(`Piso inicial detectado: '${floor}'`);//mensaje
              setSelectedFloor(floor);//se seleciona el piso
              setCurrentLevelXElevator(levelsElevator[floor - 1]); //se coloca el elevadoor en el piso inicial
              currentState = 1; //pasa al estado 1
            } else {
              setResultVerific("Error: Se esperaba un número de piso válido después de I");
              return false;
            }
          } else {
            setResultVerific("Debes iniciar con el comando I o i");
            return false;
          }
          break;

        case 1: // Estado normal
          if (["s", "sub"].includes(command)) {// si el comando incluye s o sub
            const floors = parseInt(tokens[1]); //se convierte el siguiente valor a entero
            if (!isNaN(floors)) {//si es un numero
              setResultVerific("Tu código va por buen camino"); //mensaje de correcto
              currentState = 1; //vuelve a entrar al caso para seguir verificando mas instrucciones
            } else {
              setResultVerific("Error: Se esperaba un número después de S");
              return false;
            }
          } else if (["b", "baj"].includes(command)) {
            const floors = parseInt(tokens[1]);
            if (!isNaN(floors)) {
              setResultVerific("Tu código va por buen camino");
              currentState = 1;
            } else {
              setResultVerific("Error: Se esperaba un número después de B");
              return false;
            }
          } else if (["p", "pausa"].includes(command)) {
            const time = parseInt(tokens[1]);
            if (!isNaN(time)) {
              setResultVerific("Tu código va por buen camino");
              currentState = 1;
            } else {
              setResultVerific("Error: Se esperaba un número después de Pausa");
              return false;
            }
          } else if (command === "a" || command === "abr") {
            const time = parseInt(tokens[1]);
            if (!isNaN(time)) {
              setResultVerific("Tu código va por buen camino");
              currentState = 1;
            } else {
              setResultVerific("Error: Se esperaba un número después de A");
              return false;
            }
          } else if (command === "si" && tokens[1] && tokens[1].toLowerCase() === "piso") { //condicion si piso
            const operator = tokens[2]; //operador
            const conditionFloor = parseInt(tokens[3]); //numero de condicion
            if (!isNaN(conditionFloor) && [">", "<", "=", "<=", ">="].includes(operator)) { //si el numero condicional esta acompañado de un operador
              setResultVerific("Condición Si detectada");
              currentState = 2;
            } else {
              setResultVerific("Error: Formato inválido en 'Si piso operador numero'");
              return false;
            }
          } else if (command === "f" || command === "fin") {  //fin del si para poder terminar el bloque si
            setResultVerific("La estructura de tu código es correcta");
            currentState = 3;
          } else if (command === "i") {
            setResultVerific("Error ya tienes un comando Inicio");
            return false;
          } else {
            setResultVerific(`Comando desconocido '${command}'`);
            return false;
          }
          break;

        case 2: // Dentro de bloque "Si"
          if (["s", "sub"].includes(command)) {
            const floors = parseInt(tokens[1]);
            if (!isNaN(floors)) {
              setResultVerific("Tu código va por buen camino");
            } else {
              setResultVerific("Error: Se esperaba un número después de S");
              return false;
            }
          } else if (["b", "baj"].includes(command)) {
            const floors = parseInt(tokens[1]);
            if (!isNaN(floors)) {
              setResultVerific("Tu código va por buen camino");
            } else {
              setResultVerific("Error: Se esperaba un número después de B");
              return false;
            }
          } else if (["p", "pausa"].includes(command)) {
            const time = parseInt(tokens[1]);
            if (!isNaN(time)) {
              setResultVerific("Tu código va por buen camino");
            } else {
              setResultVerific("Error: Se esperaba un número después de Pausa");
              return false;
            }
          } else if (command === "a" || command === "abr") {
            const time = parseInt(tokens[1]);
            if (!isNaN(time)) {
              setResultVerific("Tu código va por buen camino");
            } else {
              setResultVerific("Error: Se esperaba un número después de A");
              return false;
            }
          } else if (command === "fin" && tokens[1] && tokens[1].toLowerCase() === "si") { //fin si
            setResultVerific("Bloque Si cerrado correctamente");
            currentState = 1;
          } else {
            setResultVerific(`Comando desconocido '${command}' dentro de Si`);
            return false;
          }
          break;

        case 3: // Estado final
          if (tokens[0] !== "") {
            setResultVerific("Error ya haz colocado un comando Fin");
            return false;
          }
          break;
      }
    }
    setIsValidCoding(currentState === 3);
    return currentState === 3;
  }

  // Función para validar autómata de comandos
  function checkAutomatonComand(text) {
    const isValid = automatonComands(text);
    setIsValid(isValid);
  }

  // Función para validar autómata de estructura de código
  function checkAutomatonCoding(text) {
    const isValidCoding = automatonCoding(text);
    setIsValidCoding(isValidCoding);
  }

// Función para usar elevador
async function usedElevator(selectedFloor) {
  if (nameProgram === "") {
    Alert.alert(
      "Falta nombre",
      "Por favor, ingresa un nombre para el programa."
    );
  } else if (inputTextCoding === "") {
    Alert.alert("Falta Código", "Por favor, ingresa el código del programa.");
  } else {
    if (!isValidCoding) {
      Alert.alert("Error", "La compilación NO es posible, tienes errores.");
      return;
    } else {
      console.log("----------Compilación en proceso----------");
      setButtonDisabled(true);
      setCompilationInProgress(true);
      setIconCompile("clock-o");
      setSelectedFloor(selectedFloor);
      setCurrentLevelXElevator(levelsElevator[selectedFloor - 1]);

      let currentFloor = selectedFloor;
      console.log("Piso elegido:", selectedFloor);
      console.log("Piso actual:", currentFloor);
      console.log("Texto ingresado:\n", inputTextCoding);

      const floorMax = 7;
      const floorMin = 1;
      let conditionMet = false; //condicion if
      let inConditionBlock = false; //bloque de condiciones del if (cumplio o no)

      //se divide el texto en lineas
      const lines = inputTextCoding.split("\n");

      for (let line of lines) {
        const tokens = line.trim().split(" ");
        if (tokens.length === 0) continue;

        const command = tokens[0].toLowerCase();

        // omitir comandos si estamos en un bloque de condicion y la condicion no se cumple
        if (inConditionBlock && !conditionMet) {// si la condicion interna es cumplida pero el if no 
          if (command === "fin" && tokens[1] && tokens[1].toLowerCase() === "si") {// se verifica que existe el fin si
            inConditionBlock = false; // sale del bloque de instrucciones
            console.log("Saliendo del bloque Si");
          }
          continue;
        }

        if (command === "i") {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          console.log("Comando Inicio detectado");
          playSound(require("../assets/audio/dtmf_12.wav"), 1);
          const numFloors = parseInt(tokens[1]); //convierte el siguiente caracter en numero
          if (!isNaN(numFloors)) { //si es un numero de piso valido 
            currentFloor = numFloors;
            console.log("Subiendo el elevador al piso...", currentFloor);
            setSelectedFloor(currentFloor);
            setCurrentLevelXElevator(levelsElevator[currentFloor - 1]);
          }
        } else if (command === "s" || command === "sub") {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const numFloors = parseInt(tokens[1]);
          if (!isNaN(numFloors)) {
            console.log("Comando Subir detectado, subiendo:", numFloors, "pisos");
            for (let j = 0; j < numFloors; j++) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              if (currentFloor < floorMax) {
                currentFloor++;
                console.log("Subiendo a piso:", currentFloor);
                setSelectedFloor(currentFloor);
                upNextLevelElevator();
                playSound(require("../assets/audio/dtmf_2.wav"), 1);
              } else {
                console.log(
                  "El elevador no puede subir más. Límite de piso alcanzado:",
                  floorMax
                );
                Alert.alert(
                  "Piso máximo alcanzado",
                  "Pasaremos al siguiente comando"
                );
                break;
              }
            }
          } else {
            console.log(
              "Comando Subir detectado, pero el siguiente carácter no es un número."
            );
          }
        } else if (command === "b" || command === "baj") {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const numFloors = parseInt(tokens[1]);
          if (!isNaN(numFloors)) {
            console.log("Comando Bajar detectado, bajando:", numFloors, "pisos");
            for (let j = 0; j < numFloors; j++) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              if (currentFloor > floorMin) {
                currentFloor--;
                console.log("Bajando a piso:", currentFloor);
                setSelectedFloor(currentFloor);
                downNextLevelElevator();
                playSound(require("../assets/audio/dtmf_1.wav"), 1);
              } else {
                console.log(
                  "El elevador no puede bajar más. Límite de piso alcanzado:",
                  floorMin
                );
                Alert.alert(
                  "Piso mínimo alcanzado",
                  "Pasaremos al siguiente comando"
                );
                break;
              }
            }
          } else {
            console.log(
              "Comando Bajar detectado, pero el siguiente carácter no es un número."
            );
          }
        } else if (command === "p" || command === "pausa") {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const numSeg = parseInt(tokens[1]);
          if (!isNaN(numSeg)) {
            console.log("Comando Parar detectado, parando:", numSeg, "segundos");
            for (let j = 0; j < numSeg; j++) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              console.log("Pausa del:", j + 1, "segundo");
              playSound(require("../assets/audio/dtmf_3.wav"), 1);
            }
          } else {
            console.log(
              "Comando Parar detectado, pero el siguiente carácter no es un número."
            );
          }
        } else if (command === "a" || command === "abr") {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          console.log("Comando Abrir detectado, abriendo puertas");
          playSound(require("../assets/audio/dtmf_8.wav"), 1);
          await new Promise((resolve) => setTimeout(resolve, 800));
          console.log("Deteniendo puertas");
          openDoor();
          playSound(require("../assets/audio/dtmf_3.wav"), 1);

          const numSeg = parseInt(tokens[1]);
          if (!isNaN(numSeg)) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            console.log("Puerta abierta por:", numSeg, "segundos");
            for (let j = 0; j < numSeg; j++) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              console.log("Apertura del:", j + 1, "segundo");
              playSound(require("../assets/audio/dtmf_3.wav"), 1);
            }
          } else {
            console.log(
              "Comando Abrir detectado, pero el siguiente carácter no es un número."
            );
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
          console.log("Cerrando puertas");
          playSound(require("../assets/audio/dtmf_4.wav"), 1);
          await new Promise((resolve) => setTimeout(resolve, 800));
          console.log("Deteniendo puertas");
          closeDoor();
          playSound(require("../assets/audio/dtmf_3.wav"), 1);

        } else if (command === "si" && tokens[1] && tokens[1].toLowerCase() === "piso") { // condicion si piso
          const operator = tokens[2];
          const conditionFloor = parseInt(tokens[3]);
          if (!isNaN(conditionFloor)) {
            if (operator === ">") conditionMet = currentFloor > conditionFloor;
            else if (operator === "<") conditionMet = currentFloor < conditionFloor;
            else if (operator === "=") conditionMet = currentFloor === conditionFloor;
            else if (operator === "<=") conditionMet = currentFloor <= conditionFloor;
            else if (operator === ">=") conditionMet = currentFloor >= conditionFloor;
            else {
              console.log("Operador inválido en 'Si piso'");
              continue;
            }
            inConditionBlock = true;
            if (conditionMet) {
              console.log(`Condición 'Si piso ${operator} ${conditionFloor}' cumplida`);
          } else {
              console.log(`Condición no cumplida`);
          }
          } else {
            console.log("Error: Se esperaba un número después de 'Si piso operador'");
          }
        } else if (command === "fin" && tokens[1] && tokens[1].toLowerCase() === "si") {//fin si
          inConditionBlock = false;
          conditionMet = false;
          console.log("Saliendo del bloque Si");
        } else if (command === "f" || command === "fin") {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          console.log("Comando Fin detectado");
          playSound(require("../assets/audio/dtmf_d.wav"), 1);
          break; // salir al encontrar el fin
        } else {
          console.log(`Comando desconocido: '${command}'`);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Piso final:", currentFloor);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Valores restablecidos");
      Alert.alert("Programa terminado", "Reiniciando el elevador");
      console.log("Bajando el elevador al piso... 1");
      setSelectedFloor(1);
      setCurrentLevelXElevator(levelsElevator[0]);
      setIconCompile("play-circle");
      setButtonDisabled(false);
      setCompilationInProgress(false);
      console.log("----------Fin de la Compilación----------");
    }
  }
}

  return (
    <SafeAreaView style={styles.maincontainer}>
      <View
        style={[styles.containerSVG, { flex: 1.5, backgroundColor: "#56D0F6" }]}
      >
        <SVGTop />
      </View>

      <View style={[styles.sectionforName, { flex: 1 }]}>
        <TextInput
          style={[styles.programName]}
          ref={inputRefName}
          placeholder="Nombra tu programa aquí"
          value={nameProgram}
          onChangeText={(text) => {
            if (text.length <= 15) {
              setNameProgram(text);
            } else {
              Alert.alert(
                "Advertencia",
                "El nombre no puede superar los 15 caracteres"
              );
            }
          }}
        ></TextInput>
      </View>

      <View style={[styles.sectionOfPrograms, { flex: 10 }]}>
        <View style={[styles.sectionforIcons, { flex: 1 }]}>
          <View style={[styles.Icons, { flex: 1 }]}>
            <Picker
              style={styles.picker}
              selectedValue={selectedFloor}
              mode="dropdown" // Opcion desplegable para android
              itemStyle={{
                height: 50,
                fontSize: Platform.OS === "android" ? 10 : 10,
                textAlign: "center",
                justifyContent: "center",
              }}
              onValueChange={(itemValue) => {
                setSelectedFloor(itemValue);
                const selectedLevel = levelsElevator[itemValue - 1]; // Resta 1 porque los valores de Picker comienzan desde 1
                setCurrentLevelXElevator(selectedLevel);
              }}
            >
              <Picker.Item label="1" value={1} />
              <Picker.Item label="2" value={2} />
              <Picker.Item label="3" value={3} />
              <Picker.Item label="4" value={4} />
              <Picker.Item label="5" value={5} />
              <Picker.Item label="6" value={6} />
              <Picker.Item label="7" value={7} />
            </Picker>
            <Text style={styles.textComand}>Piso: {selectedFloor}</Text>
          </View>

          <View style={[styles.Icons, { flex: 1 }]}>
            <FontAwesome
              name={iconCompile}
              size={Platform.OS === "android" ? 40 : 35}
              color="black"
              onPress={() => usedElevator(selectedFloor)}
              disabled={isButtonDisabled}
            />
            <Text style={styles.textComand}>Compilar</Text>
          </View>

          <TouchableOpacity style={[styles.Icons, { flex: 1 }]}>
            <MaterialCommunityIcons
              name="usb-port"
              size={Platform.OS === "android" ? 40 : 35}
              color="black"
              onPress={saveProgram}
            />
            <Text style={styles.textComand}>Guardar</Text>
          </TouchableOpacity>

          <View style={[styles.Icons, { flex: 1 }]}>
            <FontAwesome5
              name="file-upload"
              size={Platform.OS === "android" ? 40 : 35}
              color="black"
              onPress={() => {setModalVisible(true);}}

              onChangeText={(text) => {
                setInputTextCoding(text);
              }}
            />
            <Text style={styles.textComand}>Cargar</Text>
            <Text style={styles.textComand}>Programa</Text>
          </View>

          <Modal
            visible={modalVisible}
            animationType="slide"
            alignItems="center"
            transparent={true}
            onDismiss={() => setModalVisible(false)}
          >
            <View style={styles.modalView}>
              <Text
                style={{
                  fontSize: Platform.OS === "android" ? 10 : 15,
                  marginBottom: 10,
                }}
              >
                Tus Programas:
              </Text>
              {programsSaveds.map((program, index) => (
                <Text
                  key={index}
                  onPress={() => selectProgram(program.nameProgram)}
                  style={{
                    fontSize: 20,
                    marginBottom: 20,
                    padding: 5, // Espaciado interno para separar el texto del borde
                  }}
                >
                  {program.nameProgram}
                </Text>
              ))}

              <Pressable
                style={styles.buttonCloseModal}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <AntDesign name="closecircle" size={25} color="black" />
              </Pressable>
            </View>
          </Modal>

          <View style={[styles.Icons, { flex: 1 }]}>
            <MaterialIcons
              name="delete"
              size={Platform.OS === "android" ? 40 : 35}
              color="black"
              onPress={() => {
                deletedProgram();
              }}
            />
            <Text style={styles.textComand}>Borrar</Text>
          </View>

          <View style={[styles.Icons, { flex: 1 }]}>
            <MaterialCommunityIcons
              name="gamepad-variant"
              size={Platform.OS === "android" ? 40 : 35}
              color="black"
              onPress={() => {
                usedElevator(selectedFloor),
                setModalVisibleSimulation(true);
              }}
            />
            <Text style={styles.textComand}>Ver</Text>
            <Text style={styles.textComand}>Simulación</Text>
          </View>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisibleSimulation}
            onRequestClose={() => setModalVisibleSimulation(false)}
          >
            <View style={styles.maincontainer}>
              <View
                style={[
                  styles.containerSVG,
                  { flex: 1.5, backgroundColor: "#56D0F6" },
                ]}
              >
                <SVGTop />
              </View>

              <View style={[styles.sectionforPicker, { flex: 1 }]}>
                <Picker
                  style={styles.pickerSimulation}
                  selectedValue={selectedFloor}
                  mode="dropdown" // Opcion desplegable para android
                  itemStyle={{
                    height: 50,
                    fontSize: 10,
                    textAlign: "center",
                    justifyContent: "center",
                  }}
                  onValueChange={(itemValue) => {
                    setSelectedFloor(itemValue);
                    const selectedLevel = levelsElevator[itemValue - 1]; // Se resta 1 porque los valores de Picker comienzan desde 1
                    setCurrentLevelXElevator(selectedLevel);
                  }}
                >
                  <Picker.Item label="Piso 1" value={1} />
                  <Picker.Item label="Piso 2" value={2} />
                  <Picker.Item label="Piso 3" value={3} />
                  <Picker.Item label="Piso 4" value={4} />
                  <Picker.Item label="Piso 5" value={5} />
                  <Picker.Item label="Piso 6" value={6} />
                  <Picker.Item label="Piso 7" value={7} />
                </Picker>
              </View>

              <View
                style={[
                  styles.sectionforElementsSimulations,
                  { flex: 9, marginLeft: 10 },
                ]}
              >
                <SVGSimulation
                  pathWidth={sectionBuildWidth}
                  pathHeight={sectionBuildHeight}
                  levelXElevator={currentLevelXElevator}
                  statusDoor={currentDoorElevator}
                />
              </View>

              <Pressable
                style={styles.buttonCloseModal}
                onPress={() =>
                  setModalVisibleSimulation(!modalVisibleSimulation)
                }
              >
                <AntDesign name="closecircle" size={35} color="black" />
              </Pressable>
            </View>

            <TouchableOpacity style={styles.recordButtonContainer}>
              <FontAwesome5
                name={recording ? "microphone-slash" : "microphone"}
                size={35}
                color="#f0ffff"
                onPress={recording ? stopRecording : startRecording}
                disabled={isButtonDisabled}
              />
            </TouchableOpacity>
          </Modal>

          <View style={[styles.Icons, { flex: 1 }]}>
            <MaterialIcons
              name="help"
              size={Platform.OS === "android" ? 40 : 35}
              color="black"
              onPress={() => navigation.navigate("HelpCodingScreen")}
            />
            <Text style={styles.textComand}>Ayuda</Text>
          </View>
        </View>

        <View style={[styles.sectiontextProgram, { flex: 3 }]}>
          <Text style={styles.resultCheck}>
            {resultVerific}
            {"\n"}
          </Text>
          <Text style={styles.resultCommand}>{result}</Text>
          <Text style={styles.message}>
            {isValidCoding
              ? "La compilación es posible "
              : "La compilación aun es imposible"}
          </Text>

          <TextInput
            style={[styles.textCoding]}
            multiline={true} //Permite muchas lineas
            ref={inputRefCoding}
            value={inputTextCoding}
            textAlignVertical="top" //El cursor inicia hasta la parte de arriba
            placeholder="Escribe el codigo de tu programa aqui" //Leyenda del inputText
            onChangeText={(text) => {
              setInputTextCoding(text);
              checkAutomatonComand(text);
              checkAutomatonCoding(text);
              

            }}
          ></TextInput>

          <TouchableOpacity style={styles.recordButtonContainer}>
            <FontAwesome5
              name={recording ? "microphone-slash" : "microphone"}
              size={35}
              color="#f0ffff"
              onPress={recording ? stopRecording : startRecording}
              
              disabled={isButtonDisabled}
              
              
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
