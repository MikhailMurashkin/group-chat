import React from 'react'
import Spinner from 'react-bootstrap/Spinner'

const Loading = () => {
    return(
        <div className="loadingScreen">
            <Spinner size={36} animation="border" variant="dark" />
        </div>
        
    )
}

export default Loading