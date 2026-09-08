import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { cores } from '../theme';

import PainelScreen from '../screens/PainelScreen';
import MateriaisScreen from '../screens/MateriaisScreen';
import NovoMaterialScreen from '../screens/NovoMaterialScreen';
import MoveisScreen from '../screens/MoveisScreen';
import MovelDetalheScreen from '../screens/MovelDetalheScreen';
import NovoMovelScreen from '../screens/NovoMovelScreen';
import OrdensScreen from '../screens/OrdensScreen';
import NovaOrdemScreen from '../screens/NovaOrdemScreen';
import CalculadorasScreen from '../screens/CalculadorasScreen';
import ConfiguracoesScreen from '../screens/ConfiguracoesScreen';

const Tab = createBottomTabNavigator();
const StackMoveis = createNativeStackNavigator();
const StackMateriais = createNativeStackNavigator();
const StackOrdens = createNativeStackNavigator();

const opcoesStackPadrao = {
  headerStyle: { backgroundColor: cores.teal },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '600' },
};

function MoveisStack() {
  return (
    <StackMoveis.Navigator screenOptions={opcoesStackPadrao}>
      <StackMoveis.Screen name="MoveisLista" component={MoveisScreen} options={{ title: 'Móveis · BOM' }} />
      <StackMoveis.Screen name="MovelDetalhe" component={MovelDetalheScreen} options={{ title: 'Estrutura do móvel' }} />
      <StackMoveis.Screen name="NovoMovel" component={NovoMovelScreen} options={{ title: 'Novo modelo' }} />
    </StackMoveis.Navigator>
  );
}

function MateriaisStack() {
  return (
    <StackMateriais.Navigator screenOptions={opcoesStackPadrao}>
      <StackMateriais.Screen name="MateriaisLista" component={MateriaisScreen} options={{ title: 'Materiais' }} />
      <StackMateriais.Screen name="NovoMaterial" component={NovoMaterialScreen} options={{ title: 'Novo material' }} />
    </StackMateriais.Navigator>
  );
}

function OrdensStack() {
  return (
    <StackOrdens.Navigator screenOptions={opcoesStackPadrao}>
      <StackOrdens.Screen name="OrdensLista" component={OrdensScreen} options={{ title: 'Ordens de Montagem' }} />
      <StackOrdens.Screen name="NovaOrdem" component={NovaOrdemScreen} options={{ title: 'Nova ordem' }} />
    </StackOrdens.Navigator>
  );
}

const ICONES = {
  Painel: 'home-outline',
  Materiais: 'cube-outline',
  Moveis: 'hammer-outline',
  Ordens: 'clipboard-outline',
  Calculadoras: 'calculator-outline',
  Config: 'settings-outline',
};

export default function Navegacao() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: cores.accent,
          tabBarInactiveTintColor: cores.muted,
          tabBarStyle: { borderTopColor: cores.line },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={ICONES[route.name]} size={size} color={color} />
          ),
        })}
      >
        <Tab.Screen name="Painel" component={PainelScreen} />
        <Tab.Screen name="Materiais" component={MateriaisStack} options={{ title: 'Materiais' }} />
        <Tab.Screen name="Moveis" component={MoveisStack} options={{ title: 'Móveis' }} />
        <Tab.Screen name="Ordens" component={OrdensStack} options={{ title: 'Ordens' }} />
        <Tab.Screen name="Calculadoras" component={CalculadorasScreen} />
        <Tab.Screen name="Config" component={ConfiguracoesScreen} options={{ title: 'Config' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
