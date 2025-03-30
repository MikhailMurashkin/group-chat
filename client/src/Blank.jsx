import React, {useEffect, useContext} from 'react'
import { AuthContext } from './modules/AuthContext'
import { useNavigate } from 'react-router-dom'

const Blank = () => {
  console.log("BLANK")
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  console.log(user)
  
  useEffect(() => {
    if(user) {
      navigate("/groups")
    } else {
      console.log("NO CONTEXT")
    }
  })

  return (
    <div>
      BLANK PAGE
    </div>
  )
}

export default Blank