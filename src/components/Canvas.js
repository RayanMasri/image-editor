import React, {useEffect} from 'react';
import {useDropzone} from 'react-dropzone';

const fontsUrl = "https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyAeG8DyUge1HQLUH9MJqifW18gMzOkqErs";

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function isObjEmpty(obj) {
    return obj ? Object.keys(obj).length === 0 && obj.constructor === Object : true
}

function Canvas(props) {
    let currentFont = "";

    // References
    const canvas = React.useRef(null);
    const downloadButton = React.useRef(null);
    const uploadButton = React.useRef(null);
    const fontInput = React.useRef(null);
    // add index property
    let textSpacing = 30;
    let selectedSpacing = 5;

    let dragging = [undefined, undefined];
    let dragDistance = undefined;
    let mouseX = undefined;
    let mouseY = undefined;

    let backgroundImage = {}

    // Canvas Elements
    let textElements = [];
    // Text Element Layout
    // { text, font, x, y, selected }

    const findFont = () => {
        let font = fontInput.current.value
        httpGetAsync(fontsUrl, function(result) {
            result = JSON.parse(result);
            console.log(result);
        });
    }

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

    const addText = function() {
        textElements.map((e) => {
            e.selected = false;
        });
        textElements.push({
            text: "",
            font: "30px Arial",
            x: canvas.current.width / 2,
            y: canvas.current.height / 2,
            selected: true
        })
        updateTextElements();
    }

    const getCharHeight = () => {
        let ctx = getContext();
        return ctx.measureText("M").width;
    }

    const getTextLines = function(text, canvas) {
        let ctx = canvas.getContext('2d');
        let lines = []        
        let currentLine = 0;
        
        for(let i = 0; i < text.length; i++) {
            let char = text[i];

            if(lines[currentLine]) {
                if(ctx.measureText(lines[currentLine]).width >= canvas.width - textSpacing) {                
                    currentLine++;                
                }
            }

            lines[currentLine] = lines[currentLine] ? lines[currentLine] + char : char;
        }

        return lines
    }

    const getTextSize = function(text) {
        let ctx = getContext();
        let lines = getTextLines(text, canvas.current)
        return [Math.min(canvas.current.width - textSpacing, ctx.measureText(text).width), getCharHeight() * lines.length];
    }

    
    const drawTextElement = function(e) {
        if(!e.selected && !e.text)  {            
            return;
        }

        let ctx = getContext();  
        let lines = getTextLines(e.text, canvas.current);

        ctx.font = e.font; 
        
        for(let i in lines) {
            let line = lines[i];
            ctx.fillText(line, e.x, e.y + getCharHeight() * i);
        }

        let [txtWidth, txtHeight] = getTextSize(e.text);
        if(e.selected) {
            ctx.strokeRect(e.x-selectedSpacing/2, e.y-getCharHeight(), (txtWidth > 0 ? txtWidth : 1) + selectedSpacing, (txtHeight > 0 ? txtHeight : getCharHeight()) + selectedSpacing);
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
            let [width, height] = getTextSize(textElement.text)
            let dist = {
                x: textElement.x - mouseX,
                y: textElement.y + (height - getCharHeight()) - mouseY,
            }
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
            textElements[dragIndex].x = mouseX - dragDistance.x;
            textElements[dragIndex].y = mouseY - dragDistance.y;

            updateTextElements();       
        }
    }

    const mousedown = function(e) {
        let [hovered, index] = getHoveredText(e);

        if(hovered) {
            dragging = [hovered, index];
            dragDistance = {
                x: mouseX - hovered.x,
                y: mouseY - hovered.y
            }
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
        dragDistance = undefined
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
                    let text = textElements[index].text;
                    textElements[index].text = text.substring(0, text.length - 1);
                }
            }
        }
        updateTextElements();
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
    }, [])

    const {getRootProps, getInputProps} = useDropzone({onDrop})

    return (
        <div id="main-container" style={{
            display: "flex",
            flexDirection: "row"
        }}>  
            {/* <link rel="stylesheet" type="text/css" href={currentFont}/> */}
            {/* <span id="loader" style={{}}></span> */}
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
                <button style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: "gray",
                    border: "none",
                }} onClick={addText}>
                    <img style={{
                        width: "30px",
                        height: "30px"
                    }} src={require("../assets/text-icon.png")}></img>   
                </button> 
            </div>
            {/* <input type="text" ref={fontInput}/> */}
            {/* <button onClick={findFont}>Find font</button> */}
        </div>
    )
}

export default Canvas;