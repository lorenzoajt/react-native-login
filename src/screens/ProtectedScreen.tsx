import React from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const ProtectedScreen = () => {
  const { user, token, logOut} = useContext(AuthContext)

  return (
    <View style={ styles.container }>
        <Text style={ styles.title }>Protected</Text>

        <Button
          title='logout'
          color="#5856D6"
          onPress={ logOut }
        />
        <Text>
          {
            JSON.stringify(user, null, 5 )
          }
        </Text>
        <Text>
          {
            JSON.stringify(token, null, 5 )
          }
        </Text>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    title: {
      fontSize: 20,
      marginBottom: 20
    }
});