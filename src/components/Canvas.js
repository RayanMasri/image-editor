import React, {useEffect} from 'react';
import {useDropzone} from 'react-dropzone';

function isObjEmpty(obj) {
    return obj ? Object.keys(obj).length === 0 && obj.constructor === Object : true
}

function Canvas(props) {
    // References
    const canvas = React.useRef(null);
    const downloadButton = React.useRef(null);
    const uploadButton = React.useRef(null);
    // add index property

    let dragging = [undefined, undefined];
    let mouseX = undefined;
    let mouseY = undefined;

    let backgroundImage = {}

    // Canvas Elements
    let textElements = [];
    // Text Element Layout
    // { text, font, x, y, selected }

    const deleteCanvas = () => {
        window.location.reload(false); 
    }

    const saveCanvas = () => {
        let dataURL = canvas.current.toDataURL("image/png");
        downloadButton.current.href = dataURL;
        downloadButton.current.click();
        console.log(`Saved to URL: ${dataURL}`);
    }

    const getContext = () => {
        return canvas.current.getContext('2d');
    }

    const clearCanvas = () => {
        const ctx = getContext();
        ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
    };

    const getMouseFromEvent = function(event) {
        return [event.layerX, event.layerY]
    }

    const getTextSize = function(text) {
        let ctx = getContext();
        return [ctx.measureText(text).width, ctx.measureText("M").width]
    }

    const addInput = function(object) {
        textElements.map((e) => {
            e.selected = false;
        });
        textElements.push({
            text: "",
            font: object.font,
            x: object.x,
            y: object.y,
            selected: true
        })
        updateTextElements();
    }
    
    const drawTextElement = function(e) {
        if(!e.selected && !e.text)  {            
            return;
        }

        let ctx = getContext();
        ctx.font = e.font;                
        // let lines = []        
        // let lineWidth = 0;
        // let currentLine = "";
        // for(let i = 0; i < e.text.length; i++) {
        //     let char = e.text[i];
        //     let width = ctx.measureText(char).width

        //     if(lineWidth >= canvas.current.width) {
        //         lines.push(currentLine);
        //         currentLine = "";
        //         lineWidth = 0;
        //     }

        //     lineWidth += width;            
        //     currentLine += char;
        // }
        // console.log(lines);
        ctx.fillText(e.text, e.x, e.y);
        let [txtWidth, txtHeight] = getTextSize(e.text);
        if(e.selected) {
            // ctx.strokeRect(e.x, e.y-txtHeight, Math.min(canvas.current.width - 5, txtWidth), txtHeight*lines.length);
            ctx.strokeRect(e.x, e.y-txtHeight, txtWidth, txtHeight);
        }
    }

    const updateTextElements = function() { 
        clearCanvas();
        textElements.map((e) => {
            drawTextElement(e);
        })
        drawBackgroundImage();
    }

    const selectTextElement = function(index) {
        textElements.map((e) => {
            e.selected = false;
        });
        textElements[index].selected = true;
        updateTextElements();
    }

    const getHoveredText = function(e) {
        let [mouseX, mouseY] = getMouseFromEvent(e);
        for(let i = 0; i < textElements.length; i++) {
            let textElement = textElements[i];
            let dist = {
                x: textElement.x - mouseX,
                y: textElement.y - mouseY,
            }
            let [width, height] = getTextSize(textElement.text)
            if(dist.y >= 0 && dist.y <= height) {
                if(dist.x <= 0 && dist.x >= -width) {
                    if(textElement.selected || textElement.text) {
                        return [textElement, i];
                    }
                }
            }
        }
        return [undefined, undefined];
    }

    const getSelectedText = function() {
        for(let i = 0; i < textElements.length; i++) {
            let textElement = textElements[i];
            if(textElement.selected) {
                return [textElement, i];
            }
        }
        return [undefined, undefined];
    }

    const drawBackgroundImage = function() {
        if(!isObjEmpty(backgroundImage)) {
            let ctx = getContext();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.drawImage(backgroundImage.image, backgroundImage.x, backgroundImage.y);
        }  
    }

    const mousemove = function(event) {
        let [mousePosX, mousePosY] = getMouseFromEvent(event);
        mouseX = mousePosX;
        mouseY = mousePosY;

        let [hovered, index] = getHoveredText(event);
        let [drag, dragIndex] = dragging;

        if(drag) {
            textElements.map((e) => {e.selected = false});

            let [width, height] = getTextSize(drag);
            textElements[dragIndex].x = mouseX - width / 2;
            textElements[dragIndex].y = mouseY - height / 2;

            updateTextElements();       
        }

        console.log(hovered ? hovered.text : undefined);


    }

    const mousedown = function(e) {
        let [hovered, index] = getHoveredText(e);

        if(hovered) {
            dragging = [hovered, index];
        }
    }
    
    const mouseup = function(e) {
        let [hovered, index] = getHoveredText(e);
        if(!hovered) {
            console.log(textElements);
            textElements.map((e) => {
                e.selected = false;
            });
            updateTextElements();
        } else {
            selectTextElement(index);        
        }
        dragging = [undefined, undefined];
    }

    const dblclick = function(e) {
        console.log("double click");
    }

    const keydown = function(event) {
        let [selected, index] = getSelectedText();

        if(selected) {
            // if(event.keyCode == 17 && event.keyCode == 65) {
            //     // Ctrl + A
            // }
            if(event.key.length == 1) {
                textElements[index].text += event.key;
            } else {
                if(event.keyCode == 8) {
                    // backspace
                    console.log("backspace");
                    let text = textElements[index].text;
                    textElements[index].text = text.substring(0, text.length - 1);
                }
            }
        } else {
            console.log(event.keyCode);
            if(event.altKey && event.keyCode == 84) {
                addInput({
                    x: mouseX,
                    y: mouseY,
                    font: "30px Arial"
                });
            }

        }
        // if(!selected) {
        //     console.log("none selected");

        // }
        updateTextElements();
        console.log("key down");
    }

    useEffect(function() {
        document.body.addEventListener('mouseup', mouseup, true);
        document.body.addEventListener('mousedown', mousedown, true);
        document.body.addEventListener('mousemove', mousemove, true);
        document.body.addEventListener('keydown', keydown, true);
        document.body.addEventListener('dblclick', dblclick, true);
    }, [])

    const onDrop = React.useCallback((files) => {        
        let file = files[0]

        let ctx = getContext();        

        let src = URL.createObjectURL(file);
        let img = new Image();
        img.onload = function() {
            backgroundImage = {
                image: img,
                x: canvas.current.width / 2 - this.width / 2,
                y: canvas.current.height / 2 - this.height / 2
            }
            updateTextElements();
        }
        img.src = src;
//     const drawFile = function(file, x, y) {
//         let src = getFileURL(file);
//         let img = new Image();
//         img.onload = function() {
//             ctx.drawImage(img, x, y);
//         }
//         img.src = src;
//     }    
        // let dropped = 0;
        // files.forEach((file) => {
        //     let url = getFileURL(file);
        //     getFileSize(url, function(width, height) {
        //         dropData.current.innerHTML += `[${file.path}, ${file.size} bytes, ${width}x${height}]\n`; 
        //         images.unshift({
        //             file: file,
        //             width: width,
        //             height: height,
        //             x: 0,
        //             y: 0
        //         });          
                
        //         dropped++;
        //         if(dropped === files.length) {
        //             updateImages();
        //         }
        //     });
        // });
    }, [])

    const {getRootProps, getInputProps} = useDropzone({onDrop})

    return (
        <div style={{
            display: "flex",
            flexDirection: "row"
        }}>  
            <canvas style={{
                backgroundColor: "lightgray"
            }} width="512" height="512" ref={canvas}/>
            <div style={{
                height: "512px",
                width: "50px",
                backgroundColor: "darkgray",
                display: "flex",
                flexDirection: "column",
            }}>
                <button style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: "gray",
                    border: "none",
                }} onClick={deleteCanvas}>
                    <img style={{
                        width: "30px",
                        height: "30px"
                    }} src={require("../assets/delete-icon.png")}></img>   
                    <a download="image.png" href="" style={{
                        display: "none"
                    }} ref={downloadButton}/>
                </button> 
                <button style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: "gray",
                    border: "none",
                }} onClick={saveCanvas}>
                    <img style={{
                        width: "30px",
                        height: "30px"
                    }} src={require("../assets/save-icon.png")}></img>   
                    <a download="image.png" href="" style={{
                        display: "none"
                    }} ref={downloadButton}/>
                </button> 
                <div {...getRootProps()} style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor: "gray",
                    }}>
                    <input {...getInputProps()} ref={uploadButton}/>
                    <img style={{
                        width: "30px",
                        height: "30px",
                        display: "block",                        
                        margin: "0 auto",
                        paddingTop: "10px"
                    }} src={require("../assets/upload-icon.png")}></img>  
                </div> 
            </div>
            
        </div>
    )
}

export default Canvas;