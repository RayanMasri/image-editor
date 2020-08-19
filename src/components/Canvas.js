import React, {useEffect} from 'react';
import {useDropzone} from 'react-dropzone';

const fontsUrl = "https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyAeG8DyUge1HQLUH9MJqifW18gMzOkqErs";

function requestClipboard(callback) {
   navigator.clipboard.readText()
    .then(text => {
        console.log('Pasted content: ', text);
        callback(text);
    })
    .catch(err => {
        console.error('Failed to read clipboard contents: ', err);
        callback(err);
    });
}

function isObjEmpty(obj) {
    return obj ? Object.keys(obj).length === 0 && obj.constructor === Object : true
}

class Text {
    constructor(x, y, ctx) {
        this.x = x;
        this.y = y;
        this.ctx = ctx;
        this.screenWidth = 512;
        this.screenHeight = 512;
        this.text = "";
        this.selected = false;
    }

    lines() {
        let lines = []        
        let currentLine = 0;
        
        for(let i = 0; i < this.text.length; i++) {
            let char = this.text[i];

            if(lines[currentLine]) {
                if(this.ctx.measureText(lines[currentLine]).width >= this.screenWidth - 30) {                
                    currentLine++;                
                }
            }

            lines[currentLine] = lines[currentLine] ? lines[currentLine] + char : char;
        }

        return lines
    }

    select() {
        this.selected = true;
    }

    unselect() {
        this.selected = false;
    }

    move(x, y) {
        this.x = x;
        this.y = y;
    }

    getCharHeight() {
        return this.ctx.measureText("M").width;
    }

    getSize() {
        let lines = this.lines();
        console.log(lines);
        return [Math.min(this.screenWidth - 30, this.ctx.measureText(this.text).width), this.getCharHeight() * lines.length];
    }

    render() {
        this.ctx.font = "30px Arial";
        this.ctx.fillStyle = "black";
        let lines = this.lines();

        for(let i in lines) {   
            this.ctx.fillText(lines[i], this.x, this.y + this.getCharHeight() * i);
        }
        
        if(this.selected) {
            let [width, height] = this.getSize();
            console.log([width, height]);
            this.ctx.strokeRect(
                this.x-2.5,
                this.y-this.getCharHeight(),
                (width > 0 ? width : 1) + 5,
                (height > 0 ? height : this.getCharHeight()) + 5);
        }
        // this.ctx.fillText(this.text, this.x, this.y);
    }
}

function Canvas(props) {
    // References
    const canvas = React.useRef(null);
    const downloadButton = React.useRef(null);
    const uploadButton = React.useRef(null);
    // add index property
    // add text placeholder
    // add shapes

    let frameCount = 0;

    let dragging = undefined;
    let dragDistance = undefined;
    let mouseX = undefined;
    let mouseY = undefined;

    // Canvas Elements

    let backgroundImage = {}

    let texts = [];
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

    const addText = function() {
        texts.map((e) => {
            e.unselect();
        });

        let ctx = getContext();
        let posX = canvas.current.width / 2;
        let posY = isObjEmpty(backgroundImage) ? canvas.current.height / 2 : canvas.current.height / 2 - backgroundImage.height / 2;

        let text = new Text(posX, posY, ctx);
        text.select();
        texts.push(text);

        update();
    }

    const update = function() { 
        clearCanvas();
        texts.map((e) => {
            e.render();
        })
        drawBackgroundImage();
        // console.log(`frame: ${frameCount}`);
        frameCount++;
    }

    const selectText = function(text) {
        texts.map((e) => {
            e.unselect();
        });
        text.select();
        update();
    }

    const getHoveredText = function() {
        for(let text of texts) {            
            console.log(text);
            let [width, height] = text.getSize();
            let dist = {
                x: text.x - mouseX,
                y: text.y + (height - text.getCharHeight()) - mouseY,
            }
            if(dist.y >= 0 && dist.y <= height) {
                if(dist.x <= 0 && dist.x >= -width) {
                    if(text.selected || text.text) {
                        return text
                    }
                }
            }
        }
    }

    const getSelectedText = function() {
        for(let text of texts) {
            console.log(text.selected);
            if(text.selected) {
                return text;
            }
        }
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

        let hovered = getHoveredText(event);

        if(dragging) {
            texts.map((e) => {e.selected = false});

            dragging.move(mouseX - dragDistance.x, mouseY - dragDistance.y)            

            update();       
        }
    }

    const mousedown = function(e) {
        let hovered = getHoveredText();

        if(hovered) {
            dragging = hovered;
            dragDistance = {
                x: mouseX - hovered.x,
                y: mouseY - hovered.y
            }
        }
    }
    
    const mouseup = function(e) {
        let hovered = getHoveredText(e);
        if(!hovered) {
            texts.map((e) => {
                e.unselect()
            });
            update();
        } else {
            selectText(hovered);        
        }
        dragging = undefined;
        dragDistance = undefined
    }

    const keydown = function(event) {
        let selected = getSelectedText();

        if(selected) {
            // Hotkeys
            if(event.ctrlKey && event.keyCode == 86) {
                // Ctrl + V
                requestClipboard(function(result) {
                    selected.text += result;
                    update();
                })
                return;
            }

            if(event.key.length == 1) {
                selected.text += event.key;
                console.log(selected.text);
            } else {
                if(event.keyCode == 8) {
                    selected.text = selected.text.substring(0, selected.text.length - 1);
                }
            }
        }
        
        update();
    }

    useEffect(function() {
        document.body.addEventListener('mouseup', mouseup, true);
        document.body.addEventListener('mousedown', mousedown, true);
        document.body.addEventListener('mousemove', mousemove, true);
        document.body.addEventListener('keydown', keydown, true);
        document.getElementById("add-text").addEventListener('mouseup', function() {
            addText();
        }, true);
    }, [])

    const onDrop = React.useCallback((files) => {        
        let file = files[0]
        let ctx = getContext();        
        let src = URL.createObjectURL(file);
        let img = new Image();
        img.onload = function() {
            backgroundImage = {
                image: img,
                width: this.width,
                height: this.height,
                x: canvas.current.width / 2 - this.width / 2,
                y: canvas.current.height / 2 - this.height / 2
            }
            update();
        }
        img.src = src;
    }, [])

    const {getRootProps, getInputProps} = useDropzone({onDrop})

    return (
        <div id="main-container" style={{
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
                <button id='add-text' style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: "gray",
                    border: "none",
                }}>
                    <img style={{
                        width: "30px",
                        height: "30px"
                    }} src={require("../assets/text-icon.png")}></img>   
                </button> 
            </div>
        </div>
    )
}

export default Canvas;