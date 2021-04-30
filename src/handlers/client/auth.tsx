import React, {useState, useEffect, useContext} from 'react'
import Router from "next/router";
import {fetchUser, logout} from "@client/fetcher/user";
import UserData from "../../interfaces/userData";
import {Tracker} from "@client/tracker/track";

interface IAuthContext {
  onReady: ((callback: (logged: boolean, userData: UserData | null) => any) => any),
  signout: () => void,
  tracker: Tracker,
  reFetch: () => Promise<void>
}

const AuthContext = React.createContext<IAuthContext | null>(null)

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({children}) => {

  const auth = useProvideAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

function useProvideAuth() {

  const onReady = (callback: (logged: boolean, userData: UserData | null) => any) => {
    if (userData !== null) return callback("student_id" in userData, userData)
    return {logged: false, userData: null}
  }

  const [userData, setUserData] = useState(null)
  const [tracker, setTracker] = useState(new Tracker())

  const reFetch = async () => {
    const data = await fetchUser()
    setUserData(data.userData)
    setTracker(await new Tracker().setUserID(data.userID).init())
  }

  const singoutAction = async () => {
    await logout()
    setUserData(null)
    setTracker(new Tracker())
    Router.push("/auth")
  }

  const signout = () => {
    singoutAction()
  }

  useEffect(() => {

    reFetch()

  }, [])

  return {
    onReady,
    signout,
    tracker,
    reFetch
  }
}