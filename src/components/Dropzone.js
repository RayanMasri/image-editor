import React, {useCallback, useEffect} from 'react'
import {useDropzone} from 'react-dropzone'

function Dropzone(props) {
    let area = React.useRef(null);

    const drop = (files) => {
        let func = props.drop.bind(props.main);
        func(files);
    }

    const onDrop = useCallback(files => {
        drop(files);
    }, [])

    const {getRootProps, getInputProps} = useDropzone({onDrop})

    useEffect(() => {
        // area.current.addEventListener('click', function(event) {
        //     console.log(this.className);
        //     // event.stopPropagation();
        // })
// 
        // console.log(input.current
        // input.current.addEven


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
        <div className="upload-area" {...getRootProps()} ref={area}>
            <input className="upload-input" {...getInputProps()}/>
            <img className="upload-icon" src={require("../assets/upload-icon.png")}></img>  
        </div> 
    )
}

export default Dropzone;