import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const baseURL = 'http://192.168.0.154:8080/api'

const cafeApi = axios.create({ baseURL })

// add axios middleware to add token to all requests  
cafeApi.interceptors.request.use(
    async(config) => {
        const token = await AsyncStorage.getItem('token')
        if ( token ) {
            config.headers['x-token'] = token
        }
        return config
    }
)


export default cafeApi