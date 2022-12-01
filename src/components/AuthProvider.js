/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Jan 14 2022
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as React from 'react'
import PropTypes from 'prop-types'
import AuthService from '../api/marketplace/AuthService'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { postMPLogin } from '../api/device/DeviceAuthAPI'

let SET_USER

const AuthContext = React.createContext()

const userReducer = (state, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        user: action.payload
      }
    default:
      return state
  }
}

function AuthProvider (props) {
  React.useEffect(() => {
    validateUser()
  })

  const validateUser = async () => {
    const currentUser = AuthService.getCurrentUser()
    if (currentUser) {
      AuthService.validate(currentUser?.jwt?.token).then(
        () => {
          postMPLogin(currentUser).then(
            () => {
              return true
            },
            error => {
              console.log(error)
              value.user = undefined
            }
          )
        },
        error => {
          const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.reason) ||
          error.message ||
          error.toString()
          console.log(resMessage)
          value.user = undefined
        }
      )
    }
  }
  const initialState = {
    user: AuthService.getCurrentUser()
  }

  const [state, dispatch] = React.useReducer(userReducer, initialState)

  const setUser = async (user) => {
    dispatch({
      type: SET_USER,
      payload: user
    })
  }

  const value = { user: state.user, setUser }

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
}

function useAuth () {
  return React.useContext(AuthContext)
}

function RequireAuth (props) {
  const auth = useAuth()
  const location = useLocation()

  if (!auth.user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export { AuthContext, AuthProvider, useAuth, RequireAuth }

AuthProvider.propTypes = {
  children: PropTypes.any
}

RequireAuth.propTypes = {
  children: PropTypes.any
}
