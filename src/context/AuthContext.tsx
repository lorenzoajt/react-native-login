import { createContext, useEffect, useReducer } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginData, LoginResponse, RegisterData, Usuario } from '../interfaces/appInterfaces';
import { AuthState, authreducer } from "./authReducer";
import cafeApi from "../api/cafeApi";

type AuthContextProps = {
  errorMessage: string, 
  token: string | null
  user: Usuario | null
  status: 'checking' | 'authenticated' | 'not-authenticated'
  signUp: ( registerData: RegisterData ) => void
  signIn: ( loginData: LoginData ) => void
  logOut: () => void
  removeError: () => void
}

const authInitialState: AuthState = {
  status: 'checking',
  token: null,
  user: null,
  errorMessage: ''
}

export const AuthContext = createContext({} as AuthContextProps);

export const AuthProvider = ({children}: any) => {

  useEffect(() => {
    checkToken()
  }, [])

  const checkToken = async () => {
    const token = await AsyncStorage.getItem('token')
    
    // no token no authenticado
    if( !token ) return dispatch({ type: 'notAuthenticated'  })

    // hay token
    const res = await cafeApi.get('/auth')
    
    // check response status
    if( res.status !== 200 ){
      return dispatch({type: 'notAuthenticated' })
    }
    // save new token
    await AsyncStorage.setItem('token', res.data.token)
    // let users in
    dispatch({
      type: 'signUp',
      payload: {
        token: res.data.token,
        user: res.data.usuario
      }
    })
      
  }
  

  const signUp = async ({ nombre, correo, password}: RegisterData) => {
    try {
      const res = await cafeApi.post<LoginResponse>('/usuarios', {
        nombre, 
        correo, 
        password
      })
      
      dispatch({
        type: 'signUp',
        payload:{
          token: res.data.token,
          user: res.data.usuario,          
        }
      })
      await AsyncStorage.setItem('token', res.data.token)
    } catch (error: any) {
      console.log(error.response.data.errors)
      dispatch({
        type: 'addError',
        payload: error.response.data.errors[0].msg || "Revise la infromación"
      })
    }
  }

  const signIn = async ( { correo, password } : LoginData) => {
    try {
      const { data } = await cafeApi.post<LoginResponse>('/auth/login', {
        correo,
        password
      })
      dispatch({
        type: 'signUp',
        payload: {
          token: data.token,
          user: data.usuario
        }
      })
      // save token
      await AsyncStorage.setItem('token', data.token)
    } catch (error: any) {
      
      dispatch({
        type: 'addError',
        payload: error.response.data.msg || "Información incorrecta"
      })
    }
  }
  // clean async storage
  const logOut = async () => {
    await AsyncStorage.removeItem('token')
    dispatch({ type: 'logout' })
  

  }

  const removeError = () => {
    dispatch({
      type: 'removeError'
    })
  }

  const [state, dispatch] = useReducer(authreducer, authInitialState)
  
  return (
    <AuthContext.Provider value={{
      ...state, 
      signIn,
      signUp, 
      logOut, 
      removeError
    }}>
      { children }
    </AuthContext.Provider>
  )
}