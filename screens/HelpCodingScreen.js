import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import SVGTop from "../components/SVGTop";
import styles from "../styles/HelpCodingStyles";
import { SafeAreaView } from "react-native";

const DataRow = ({ instruction, abbreviated, interval, description }) => (
  <View style={{ flexDirection: "row" }}>
    <View style={styles.cell}>
      <Text style={styles.cellText}>{instruction}</Text>
    </View>
    <View style={styles.cell}>
      <Text style={styles.cellText}>{abbreviated}</Text>
    </View>
    <View style={styles.cell}>
      <Text style={styles.cellText}>{interval}</Text>
    </View>
    <View style={styles.cell}>
      <Text style={styles.cellText}>{description}</Text>
    </View>
  </View>
);

//Componente principal
export default function HelpCodingScreen() {
  const navigation = useNavigation(); //Permite hacer la navegacion para los iconos

  return (
    <SafeAreaView style={styles.maincontainer}>
      <View
        style={[styles.containerSVG, { flex: 1.3, backgroundColor: "#56D0F6" }]}
      >
        <SVGTop />
      </View>

      <View style={[styles.containerIconReturn, { flex: 0.5 }]}>
        <Icon
          name="arrow-undo"
          size={30}
          color="black"
          onPress={() => navigation.navigate("CodingScreen")}
        ></Icon>
      </View>

      <View style={[styles.containerInfoHelpCoding, { flex: 8 }]}>
        <ScrollView contentContainerStyle={styles.infoElements}>
          <Text style={styles.headerText}>
            ¿COMO CREAR MI PRIMER PROGRAMA?{"\n"}
          </Text>
          <Text style={styles.infoText}>
            Para crear tu primer programa debes tener en cuenta las siguientes
            intrucciones básicas:{"\n"}
          </Text>

          <Text style={styles.infoText}>Comandos:{"\n"}</Text>

          <View style={{ width: "95%" }}>
            <View style={{ flexDirection: "row" }}>
              <View style={styles.cell}>
                <Text style={styles.cellHeaderText}>Instrucción:</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.cellHeaderText}>Comando Abreviado:</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.cellHeaderText}>Intervalo valido:</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.cellHeaderText}>Descripción:</Text>
              </View>
            </View>
          </View>

          <View style={{ width: "95%" }}>
            <DataRow
              instruction="Inicio"
              abbreviated="I-i"
              interval="[No aplica]"
              description="Inicia el programa"
            />
            <DataRow
              instruction="Subir"
              abbreviated="S-s"
              interval="[1-6]"
              description="Sube piso"
            />
            <DataRow
              instruction="Bajar"
              abbreviated="B-b"
              interval="[1-6]"
              description="Baja piso"
            />
            <DataRow
              instruction="Parar"
              abbreviated="P-p"
              interval="[1-9]"
              description="Permite un alto"
            />
            <DataRow
              instruction="Abrir"
              abbreviated="A-a"
              interval="[1-9]"
              description="Abre/Cierra puertas"
            />
            <DataRow
              instruction="Fin"
              abbreviated="F-f"
              interval="[No aplica]"
              description="Fin del programa"
            />
          </View>

          <Text style={styles.infoText}>
            {"\n"}Notas importantes:{"\n"}
            {"\n"}La estrutura básica para un programa válido corresponde de un
            comando Inicio, seguido por comandos de instrucciones válidas y para
            finalizar un comando Fin.{"\n"}
            {"\n"}Debes iniciar tu programa con el comando I o i.{"\n"}
            {"\n"}Debes terminar tu programa con el comando F o f{"\n"}
            {"\n"}La sintaxis del lenguaje no hace diferencia entre mayúsculas y
            minúsculas.{"\n"}
            {"\n"}Un intervalo válido para los comandos corresponde a:{"\n"}
            Pisos/Tiempo.{"\n"}
            {"\n"}Un comando indica la acción a llevar acabo.{"\n"}
            {"\n"}En la parte superior de nuestro programa habrá un texto sobre
            si es correcto la sintaxis o si hay un error.{"\n"}
          </Text>

          <Text style={styles.infoText}>Ejemplo Básico:{"\n"}</Text>

          <Text style={styles.exampleCoding}>
            I{"\n"}S 3{"\n"}B 1{"\n"}F
          </Text>

          <Text style={styles.infoText}>
            {"\n"}Ejemplo Avanzado:{"\n"}
          </Text>

          <Text style={styles.exampleCoding}>
            I{"\n"}S 5{"\n"}P 7{"\n"}A 4{"\n"}B 3{"\n"}F
          </Text>

          <Text style={styles.infoText}>
            {"\n"}Comandos de voz:{"\n"}
          </Text>

          <View style={{ width: "95%" }}>
            <View style={{ flexDirection: "row" }}>
              <View style={styles.cell}>
                <Text style={styles.cellHeaderText}>Instrucción:</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.cellHeaderText}>Comando de Voz:</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.cellHeaderText}>Intervalo válido:</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.cellHeaderText}>Descripción:</Text>
              </View>
            </View>
          </View>

          <View style={{ width: "95%" }}>
            <DataRow
              instruction="Nombre"
              abbreviated="Nombre"
              interval="[No aplica]"
              description="Dictado de nombre"
            />
            <DataRow
              instruction="Código"
              abbreviated="Código"
              interval="[No aplica]"
              description="Dictado de código"
            />
            <DataRow
              instruction="Enter"
              abbreviated="Enter"
              interval="[No aplica]"
              description="Se da un enter"
            />
            <DataRow
              instruction="Inicio"
              abbreviated="Inicio"
              interval="[No aplica]"
              description="Inicia el programa"
            />
            <DataRow
              instruction="Subir"
              abbreviated="Sube"
              interval="[1-6]"
              description="Sube piso"
            />
            <DataRow
              instruction="Bajar"
              abbreviated="Baja"
              interval="[1-6]"
              description="Baja piso"
            />
            <DataRow
              instruction="Parar"
              abbreviated="Para"
              interval="[1-9]"
              description="Permite un alto"
            />
            <DataRow
              instruction="Abrir"
              abbreviated="Abrir"
              interval="[1-9]"
              description="Abre/Cierra puertas"
            />
            <DataRow
              instruction="Fin"
              abbreviated="Fin"
              interval="[No aplica]"
              description="Fin del programa"
            />
          </View>

          <Text style={styles.infoText}>
            {"\n"}Notas importantes:{"\n"}
            {"\n"}Para el uso de comandos de voz es necesario un comando en
            especifico para su activación.{"\n"}
            {"\n"}Para nombrar tu programa di "Nombre" seguido del nombre.{"\n"}
            {"\n"}Para comenzar a dictar tu programa di "Código" seguido de tus
            instrucciones.{"\n"}
            {"\n"}La sintaxis del lenguaje de voz no hace diferencia entre
            mayúsculas y minúsculas.{"\n"}
            {"\n"}Un comando de voz indica la acción a llevar acabo.{"\n"}
            {"\n"}La estrutura básica para un programa válido con el uso de la
            voz corresponde de un comando de activacion por voz "Código" seguido
            por comandos de instrucciones.{"\n"}
            {"\n"}Para dar un enter debes decir "Enter".{"\n"}
            {"\n"}Para terminar de dictar tu programa debes decir "Fin".{"\n"}
            {"\n"}Es muy importante que despues de terminar tu programa des 1
            espacio en blanco".{"\n"}
          </Text>

          <Text style={styles.infoText}>Ejemplo Básico:{"\n"}</Text>

          <Text style={styles.exampleCoding}>
            Código Inicio Enter{"\n"}Sube Dos Enter{"\n"}Baja Uno Enter{"\n"}Fin
          </Text>

          <Text style={styles.infoText}>
            {"\n"}Ejemplo Avanzado:{"\n"}
          </Text>

          <Text style={styles.exampleCoding}>
            Código Inicio Enter{"\n"}Sube Cinco Enter{"\n"}Para Siete Enter
            {"\n"}Abrir Cinco Enter{"\n"}Baja Tres Enter{"\n"}Fin
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
