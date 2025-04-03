import { StyleSheet,Platform} from "react-native";

//Estilos
const styles = StyleSheet.create({
    maincontainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f0f8ff",
    },
    containerSVG: {
      width: "100%",
      alignItems: "center",
    },
    containerIconReturn: {
      width: "95%",
      alignItems: "flex-start",
    },
    containerInfoHelpCoding: {
      width: "95%",
    },
    infoElements:{
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerText: {
      fontSize: 20,
      color: "#56D0F6",
      textAlign: "center",
      fontSize: Platform.OS === 'android' ? 25 : 15,
    },
    infoText: {
      fontSize: 20,
      textAlign: "justify",
      fontSize: Platform.OS === 'android' ? 20 : 15,
    },
    exampleCoding: {
      marginTop: "3%",
      backgroundColor: "#ffe4e1",
      borderColor: "#ccc",
      borderWidth: 2,
      padding: 8,
      borderRadius: 5,
      justifyContent: 'center',
      textAlign: 'center',
      width:'70%',
      fontSize: Platform.OS === 'android' ? 20 : 15,
      
    },
    cell:{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cellText:{
      marginBottom:5,
      marginTop:5,
      fontSize: Platform.OS === 'android' ? 20 : 15,
    },
    cellHeaderText:{
      marginBottom:5,
      marginTop:5,
      color: "#56D0F6",
      fontSize: Platform.OS === 'android' ? 20 : 15,
    },
  });

  export default styles;
