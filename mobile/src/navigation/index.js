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
import ClientesScreen from '../screens/ClientesScreen';
import NovoClienteScreen from '../screens/NovoClienteScreen';
import ClienteDetalheScreen from '../screens/ClienteDetalheScreen';
import OrdensScreen from '../screens/OrdensScreen';
import NovaOrdemScreen from '../screens/NovaOrdemScreen';
import FornecedoresScreen from '../screens/FornecedoresScreen';
import NovoFornecedorScreen from '../screens/NovoFornecedorScreen';
import FornecedorDetalheScreen from '../screens/FornecedorDetalheScreen';
import EstoqueScreen from '../screens/EstoqueScreen';
import FluxoCaixaScreen from '../screens/FluxoCaixaScreen';
import CalculadorasScreen from '../screens/CalculadorasScreen';
import ConfiguracoesScreen from '../screens/ConfiguracoesScreen';
import MaisMenuScreen from '../screens/MaisMenuScreen';

const Tab = createBottomTabNavigator();
const StackMoveis = createNativeStackNavigator();
const StackMateriais = createNativeStackNavigator();
const StackClientes = createNativeStackNavigator();
const StackMais = createNativeStackNavigator();

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

function ClientesStack() {
  return (
    <StackClientes.Navigator screenOptions={opcoesStackPadrao}>
      <StackClientes.Screen name="ClientesLista" component={ClientesScreen} options={{ title: 'Clientes' }} />
      <StackClientes.Screen name="ClienteDetalhe" component={ClienteDetalheScreen} options={{ title: 'Cliente' }} />
      <StackClientes.Screen name="NovoCliente" component={NovoClienteScreen} options={{ title: 'Novo cliente' }} />
    </StackClientes.Navigator>
  );
}

// Agrupa as áreas secundárias (Ordens, Fornecedores, Estoque, Calculadoras,
// Config) numa única pilha acessada pela aba "Mais", para não sobrecarregar
// a barra de abas inferior com muitos itens.
function MaisStack() {
  return (
    <StackMais.Navigator screenOptions={opcoesStackPadrao}>
      <StackMais.Screen name="MaisMenu" component={MaisMenuScreen} options={{ title: 'Mais' }} />
      <StackMais.Screen name="OrdensLista" component={OrdensScreen} options={{ title: 'Ordens de Montagem' }} />
      <StackMais.Screen name="NovaOrdem" component={NovaOrdemScreen} options={{ title: 'Nova ordem' }} />
      <StackMais.Screen name="FornecedoresLista" component={FornecedoresScreen} options={{ title: 'Fornecedores' }} />
      <StackMais.Screen name="FornecedorDetalhe" component={FornecedorDetalheScreen} options={{ title: 'Fornecedor' }} />
      <StackMais.Screen name="NovoFornecedor" component={NovoFornecedorScreen} options={{ title: 'Novo fornecedor' }} />
      <StackMais.Screen name="Estoque" component={EstoqueScreen} options={{ title: 'Entrada · Saída' }} />
      <StackMais.Screen name="FluxoCaixa" component={FluxoCaixaScreen} options={{ title: 'Fluxo de Caixa' }} />
      <StackMais.Screen name="Calculadoras" component={CalculadorasScreen} options={{ title: 'Calculadoras' }} />
      <StackMais.Screen name="Config" component={ConfiguracoesScreen} options={{ title: 'Configurações' }} />
    </StackMais.Navigator>
  );
}

const ICONES = {
  Painel: 'home-outline',
  Materiais: 'cube-outline',
  Moveis: 'hammer-outline',
  Clientes: 'people-outline',
  Mais: 'grid-outline',
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
        <Tab.Screen name="Clientes" component={ClientesStack} options={{ title: 'Clientes' }} />
        <Tab.Screen name="Mais" component={MaisStack} options={{ title: 'Mais' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
