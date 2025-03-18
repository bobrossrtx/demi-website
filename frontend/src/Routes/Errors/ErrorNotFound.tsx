import React from 'react'

// Change import from CSS to SCSS
import "./Errors.scss"

type Props = {}

export default function ErrorNotFound(props: Props) {
    const queryParameters = new URLSearchParams(window.location.search)
    const reason = queryParameters.get('reason')

    return (
        <div className='container-error-center'>
            <h1 className='error-title'>404</h1>
            <p className='error-reason'>{reason ? reason : "Page not found"}</p>
        </div>
    )
}