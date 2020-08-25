import React, {useCallback, useEffect} from 'react'
import {useDropzone} from 'react-dropzone'

function Dropzone(props) {
    let input = React.useRef(null);

    const drop = (files) => {
        let func = props.drop.bind(props.main);
        func(files);
    }

    const onDrop = useCallback(files => {
        drop(files);
    }, [])

    const {getRootProps, getInputProps} = useDropzone({onDrop})

    useEffect(() => {
        input.current.addEventListener('click', function(event) {
            event.stopPropogation();
        })

        document.onpaste = (event) => {
            let items = (event.clipboardData || event.originalEvent.clipboardData).items;
            for (let item of items) {
                if (item.kind === 'file') {
                    let blob = item.getAsFile();
                    drop([blob]);
                }
            }
        }
    }, [])

    return (
        <div className="upload-area" {...getRootProps()}>
            <input {...getInputProps()} ref={input}/>
            <img className="upload-icon" src={require("../assets/upload-icon.png")}></img>  
        </div> 
    )
}

export default Dropzone;