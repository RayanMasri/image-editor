import React, {useCallback, useEffect} from 'react'
import {useDropzone} from 'react-dropzone'

function Dropzone(props) {
    let input = React.useRef(null);

    const onDrop = useCallback(files => {
        let func = props.drop.bind(props.main);
        func(files);
    }, [])
    const {getRootProps, getInputProps} = useDropzone({onDrop})

    useEffect(() => {
        input.current.addEventListener('click', function(event) {
            event.stopPropogation();
        })
    }, [])

    return (
        <div className="upload-area" {...getRootProps()}>
            <input {...getInputProps()} ref={input}/>
            <img className="upload-icon" src={require("../assets/upload-icon.png")}></img>  
        </div> 
    )
}

export default Dropzone;