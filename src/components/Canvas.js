import React, {useEffect} from 'react';
import {useDropzone} from 'react-dropzone';

// const fontsUrl = "https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyAeG8DyUge1HQLUH9MJqifW18gMzOkqErs";
// const screenWidth = 512;
// const screneHeight = 512;

// function requestClipboard(callback) {
//    navigator.clipboard.readText()
//     .then(text => {
//         console.log('Pasted content: ', text);
//         callback(text);
//     })
//     .catch(err => {
//         console.error('Failed to read clipboard contents: ', err);
//         callback(err);
//     });
// }

// function isObjEmpty(obj) {
//     return obj ? Object.keys(obj).length === 0 && obj.constructor === Object : true
// }


class Element {
    constructor(x, y, ctx, update) {
        this.x = x;
        this.y = y;
        this.ctx = ctx;
        this.update = update;
    }

    mouseup(event) {
        this.see(event);
    }
    
    mousedown(event) {
        this.see(event);
    }
    
    mousemove(event) {
        this.see(event);
    }

    keydown(event) {

    }

    see(event) {
        this.mouse = {
            x: event.layerX,
            y: event.layerY
        };
    }

    render() {

    }
}

class Text extends Element {
    constructor(x, y, ctx, update) {
        super(x, y, ctx, update);

        this.selected = true;
        this.text = "";
        this.current = "";
        this.placeholder = "Text";
        this.drag = { x: NaN, y: NaN };
    }

    isover() {
        let [width, height] = this.size();
        let dist = {
            x: this.x - this.mouse.x,
            y: this.y + (height - this.ctx.measureText("M").width) - this.mouse.y,
        }
        return (dist.y >= 0 && dist.y <= height) && (dist.x <= 0 && dist.x >= -width);
    }

    isdrag() {
        return !(isNaN(this.drag.x) && isNaN(this.drag.y));
    }

    lines() {
        let lines = []        
        let currentLine = 0;

        for(let i = 0; i < this.current.length; i++) {
            let char = this.current[i];

            if(lines[currentLine]) {
                if(this.ctx.measureText(lines[currentLine]).width >= 512 - 30) {                
                    currentLine++;                
                }
            }

            lines[currentLine] = lines[currentLine] ? lines[currentLine] + char : char;
        }

        return lines
    }

    size() {
        let lines = this.lines();
        let ctx = this.ctx;

        let width = this.ctx.measureText(this.current ? lines.reduce(function (a, b) {
             return ctx.measureText(a).width > ctx.measureText(b).width ? a : b
        }) : "").width;
        let height = this.ctx.measureText("M").width * lines.length;
        
        return [width, height];
    }

    unfocus() {
        this.selected = false;
    }

    focus() {
        this.selected = true;
    }

    mouseup(event) {
        this.see(event);
        if(this.isover()) {
            this.focus();
        } else {
            this.unfocus();
        } 
        this.drag = {x: NaN, y: NaN};
        this.update();
    }
    
    mousedown(event) {
        this.see(event);
        if(this.isover()) {
            this.drag = {
                x: this.mouse.x - this.x,
                y: this.mouse.y - this.y
            };
        }
    }
    
    mousemove(event) {
        this.see(event);
        if(this.isdrag()) {
            this.x = this.mouse.x - this.drag.x;
            this.y = this.mouse.y - this.drag.y;
            this.update();
        }
    }

    keydown(event) {
        if(this.selected) {
            if(event.key.toLowerCase() != event.key.toUpperCase()) {
                this.text += event.key;
                this.current = this.text;
                this.update();
            }
        }
    }

    render() {
        this.ctx.fillStyle = "black"
        this.ctx.font = "30px Arial";
        this.current = this.text ? this.text : this.placeholder;

        let lines = this.lines();

        for(let line in lines) {   
            this.ctx.fillText(lines[line], this.x, this.y + this.ctx.measureText("M").width * line);
        }
        
        this.ctx.strokeStyle = "#0E9BEA";
        this.border();
    }

    border() {
        if(this.selected) {
            let [width, height] = this.size();
            this.ctx.strokeRect(
                this.x-2.5,
                this.y-this.ctx.measureText("M").width,
                (width > 0 ? width : 1) + 5,
                (height > 0 ? height : this.ctx.measureText("M").width) + 5
            );
        }
    }
}

// class Text {
//     constructor(x, y, placeholder, ctx) {
//         this.x = x;
//         this.y = y;
//         this.ctx = ctx;
//         this.text = "";
//         this.placeholder = placeholder;
//         this.realText = placeholder;
//         this.selected = false;
//     }


//     render() {

//     }
// }

function Canvas(props) {
    // References
    const canvas = React.useRef(null);
    const downloadButton = React.useRef(null);
    const uploadButton = React.useRef(null);
    const addTextButton = React.useRef(null);
    
    let textButton = false;

    let ctx;

    // let dragging;
    // let dragDistance;
    // let mouseX, mouseY;

    let elements = {
        text: [],
        image: []
    }


    // Canvas Elements
    // let backgroundImage = {}

    // let texts = [];
    
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
    
    // const getContext = () => {
    //     return canvas.current.getContext('2d');
    // }
    
    
    // const getMouseFromEvent = function(event) {
    //     return [event.layerX, event.layerY]
    // }
    
    const addText = function(x, y) {
        elements.text.map((text) => {
            text.unfocus();
        })

        let text = new Text(x, y, ctx, update);
        elements.text.push(text);

        // texts.map((e) => {
        //     e.unselect();
        // });
        
        // let ctx = getContext();
        // let posX = canvas.current.width / 2;
        // let posY = isObjEmpty(backgroundImage) ? canvas.current.height / 2 : canvas.current.height / 2 - backgroundImage.height / 2;
        
        // let text = new Text(posX, posY, "Text here", ctx);
        // text.select();
        // texts.push(text);
        
        update();
    }
    

    const update = function() { 
        ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
        
        for(const [key, value] of Object.entries(elements)) {
            for(const element of value) {
                element.render();
            }
        }
        // elements.map((element) => {
        //     element.
        // })

        // texts.map((e) => {e.render()});
        // drawBackgroundImage();
    }
    
    // const selectText = function(text) {
    //     texts.map((e) => {
    //         e.unselect();
    //     });
    //     text.select();
    //     update();
    // }
    
    // const getHoveredText = function() {
    //     for(let text of texts) {            
    //         if(text.isHovered(mouseX, mouseY)) {
    //             return text;
    //         }
    //     }
    // }

    // const getSelectedText = function() {
    //     for(let text of texts) {
    //         if(text.selected) {
    //             return text;
    //         }
    //     }
    // }

    // const drawBackgroundImage = function() {
    //     if(!isObjEmpty(backgroundImage)) {
    //         let ctx = getContext();
    //         ctx.globalCompositeOperation = 'destination-over';
    //         ctx.drawImage(backgroundImage.image, backgroundImage.x, backgroundImage.y);
    //     }  
    // }

    // const mousemove = function(event) {
    //     let [mousePosX, mousePosY] = getMouseFromEvent(event);
    //     mouseX = mousePosX;
    //     mouseY = mousePosY;
        
    //     if(dragging) {
    //         texts.map((e) => {e.selected = false});
            
    //         dragging.move(mouseX - dragDistance.x, mouseY - dragDistance.y)            
            
    //         update();       
    //     }
    // }
    
    // const mousedown = function(e) {
    //     let hovered = getHoveredText();
    //     console.log(hovered);
    //     if(hovered) {
    //         dragging = hovered;
    //         dragDistance = {
    //             x: mouseX - hovered.x,
    //             y: mouseY - hovered.y
    //         }
    //     }
    // }
    
    // const mouseup = function(e) {
    //     let hovered = getHoveredText(e);
    //     if(!hovered) {
    //         texts.map((e) => {
    //             e.unselect()
    //         });
    //         update();
    //     } else {
    //         selectText(hovered);        
    //     }
    //     dragging = undefined;
    //     dragDistance = undefined
    // }

    // const keydown = function(event) {
    //     let selected = getSelectedText();

    //     if(selected) {
    //         // Hotkeys
    //         if(event.ctrlKey && event.keyCode == 86) {
    //             // Ctrl + V
    //             requestClipboard(function(result) {
    //                 selected.text += result;
    //                 update();
    //             })
    //             return;
    //         }

    //         if(event.key.length == 1) {
    //             selected.text += event.key;
    //             console.log(selected.text);
    //         } else {
    //             if(event.keyCode == 8) {
    //                 selected.text = selected.text.substring(0, selected.text.length - 1);
    //             }
    //         }
    //     }
        
    //     update();
    // }

    const mouseup = (event) => {
        if(textButton) {
            addText(event.layerX, event.layerY);
            textButton = false;
            addTextButton.current.style.backgroundColor = textButton ? "gainsboro" : "darkgray"
        }
    }
    const mousedown = (event) => {

    }
    const mousemove = (event) => {

    }
    const keydown = (event) => {
        if(event.key.toLowerCase() == "t") {
            textButton = !textButton;
            addTextButton.current.style.backgroundColor = textButton ? "gainsboro" : "darkgray"        
        }
    }

    useEffect(function() {
        ctx = canvas.current.getContext('2d');
        document.body.addEventListener('mouseup', (event) => {
            for(const [key, value] of Object.entries(elements)) {
                for(const element of value) {
                    element.mouseup(event);
                }
            }
            mouseup(event);
        }, true);
        document.body.addEventListener('mousedown', (event) => {
            for(const [key, value] of Object.entries(elements)) {
                for(const element of value) {
                    element.mousedown(event);
                }
            }
            mousedown(event);
        }, true);
        document.body.addEventListener('mousemove', (event) => {
            for(const [key, value] of Object.entries(elements)) {
                for(const element of value) {
                    element.mousemove(event);
                }
            }
            mousemove(event);
        }, true);
        document.body.addEventListener('keydown', (event) => {
            for(const [key, value] of Object.entries(elements)) {
                for(const element of value) {
                    element.keydown(event);
                }
            }
            keydown(event);
        }, true);



        document.getElementById("add-text").addEventListener('mouseup', function() {
            textButton = !textButton
            document.getElementById("add-text").style.backgroundColor = textButton ? "gainsboro" : "darkgray"
        }, true);
    }, [])

    const onDrop = React.useCallback((files) => {        
        // let file = files[0]
        // let ctx = getContext();        
        // let src = URL.createObjectURL(file);
        // let img = new Image();
        // img.onload = function() {
        //     backgroundImage = {
        //         image: img,
        //         width: this.width,
        //         height: this.height,
        //         x: canvas.current.width / 2 - this.width / 2,
        //         y: canvas.current.height / 2 - this.height / 2
        //     }
        //     update();
        // }
        // img.src = src;
    }, [])

    const {getRootProps, getInputProps} = useDropzone({onDrop})

    return (
        <div id="main-container">
            <div id="canvas-container">  
                <canvas id="main-canvas" width="512" height="512" ref={canvas}/>
                <div id="utility-bar">
                    <button className="canvas-btn" onClick={deleteCanvas}>
                        <img style={{
                            width: "30px",
                            height: "30px"
                        }} src={require("../assets/delete-icon.png")}></img>   
                    </button> 
                    <button className="canvas-btn" onClick={saveCanvas}>
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
            <div id="tools-container">
                <button id='add-text' className="canvas-btn" ref={addTextButton}>
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