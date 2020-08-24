import React from 'react';
import Dropzone from "./Dropzone.js";

// unnecessary, made for sugar syntax
Object.defineProperty(Array.prototype, 'first', {
    value() {
        return this.find(e => true);     // or this.find(Boolean)
    }
});


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
    constructor(x, y, app) {
        this.x = x;
        this.y = y;
        this.app = app;
        this.ctx = app.ctx;
        this.update = app.update.bind(app);
        this.screen = {
            width: app.canvas.current.width,
            height: app.canvas.current.height
        }
    }

    mouseup(event) {
        this.getmouse(event);
    }
    
    mousedown(event) {
        this.getmouse(event);
    }
    
    mousemove(event) {
        this.getmouse(event);
    }

    keydown(event) {

    }

    getmouse(event) {
        let rect = this.app.canvas.current.getBoundingClientRect();
        this.mouse = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    getscreen() {
        this.screen = {
            width: this.app.canvas.current.width,
            height: this.app.canvas.current.height
        }
    }

    render() {

    }
}

class Text extends Element {
    constructor(x, y, app) {
        super(x, y, app);

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
        this.getscreen();
        let lines = []        
        let currentLine = 0;

        for(let i = 0; i < this.current.length; i++) {
            let char = this.current[i];

            if(lines[currentLine]) {
                if(this.ctx.measureText(lines[currentLine]).width >= this.screen.width - 30) {                
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
        this.getmouse(event);
        if(this.isover()) {
            this.focus();
        } else {
            this.unfocus();
        } 
        this.drag = {x: NaN, y: NaN};
        this.update();
    }
    
    mousedown(event) {
        this.getmouse(event);
        if(this.isover()) {            
            this.drag = {
                x: this.mouse.x - this.x,
                y: this.mouse.y - this.y
            };
        }
    }
    
    mousemove(event) {
        this.getmouse(event);
        if(this.isdrag()) {
            this.x = this.mouse.x - this.drag.x;
            this.y = this.mouse.y - this.drag.y;
            this.update();
        }
    }

    keydown(event) {
        if(this.selected) {
            this.text += event.key;
            this.current = this.text;
            this.update();
        }
    }

    render() {
        this.ctx.fillStyle = "black"
        this.ctx.font = "30px sans-serif";
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

class Picture extends Element {
    constructor(src, file, app) {
        super(NaN, NaN, app);
        this.src = src;
        this.file = file;
        this.img = undefined;

        this.bytesize = NaN;
        this.size = {
            width: NaN,
            height: NaN
        }
        this.display = false;
    }

    getbytes(b) {
        let s = ['B', 'KB', 'MB', 'GB', 'TB'];
        if (b == 0 || b == NaN) return '0B';
        let i = parseInt(Math.floor(Math.log(b) / Math.log(1024)));
        return Math.round(b / Math.pow(1024, i), 2) + s[i];
    }

    isover() {
        let {width, height} = this.size;
        let dist = {
            x: this.x - this.mouse.x,
            y: this.y + (height) - this.mouse.y,
        }
        return (dist.y >= 0 && dist.y <= height) && (dist.x <= 0 && dist.x >= -width);
    }

    mousemove(event) {
        this.getmouse(event);
        if(this.img) {
            this.display = this.isover();
            this.update();
        }
    }

    load(callback) {
        let self = this;
        if(!this.img) {
            let img = new Image();
            img.onload = function() {
                // Write data
                self.getscreen();
                self.img = img;
                self.bytesize = self.file.size;
                self.size = {
                    width: this.width,
                    height: this.height
                }

                callback(this);
            }
            img.src = this.src;
        } else {
            callback(this.img);
        }
    }

    render() {
        // Load & Draw Image
        let self = this;
        this.load(function(data) {
            self.getscreen();  
            self.x = self.screen.width / 2 - self.size.width / 2;
            self.y = self.screen.height / 2 - self.size.height / 2;

            self.ctx.globalCompositeOperation = 'destination-over';
            self.ctx.drawImage(self.img, self.x, self.y);

            if(self.display) {
                self.ctx.fillStyle = "black";
                self.ctx.font = "10px sans-serif";
                self.ctx.fillText(`${self.getbytes(self.bytesize)} ${self.size.width}x${self.size.height}`, self.x, self.y);
            }
        })
    }
}

class Canvas extends React.Component {
    constructor(props) {
        super(props);
        this.app = this.props.app;
        this.canvas = React.createRef();
        this.widthInput = React.createRef();
        this.heightInput = React.createRef();
        this.canvasContainer = React.createRef();

        this.active = null;
        this.ctx = null;
        this.elements = {
            text: [],
            image: []   
        }
    }
    
    getmouse(event) {
        let rect = this.canvas.current.getBoundingClientRect();
        let mouse = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
        return mouse;
    }

    submitSize() {
        let width = Math.max(75, Math.min(1280, parseInt(this.widthInput.current.value)));
        let height = Math.max(75, Math.min(720, parseInt(this.heightInput.current.value)));
        
        this.canvas.current.width = width;
        this.canvas.current.height = height;

        this.canvasContainer.current.width = width;
        this.canvasContainer.current.height = height;
        // console.log([width, height]);
        this.update();
    }

    delete() {
        this.elements = {
            text: [],
            image: []
        }
        this.update();
    }
    
    save() {
        let url = this.canvas.current.toDataURL("image/png");
        let image = this.elements.image.first();
        let [name, _] = [];
        [name, _] = image ? image.file.name.split('.') : [];

        let link = document.createElement("a");
        link.download = `${name ? name : "image"} (edited).png`
        link.href = url;
        link.click();
    }
        
    addText(x, y) {
        this.elements.text.map((text) => {
            text.unfocus();
        })

        let text = new Text(x, y, this);
        this.elements.text.push(text);

        this.update();
    }
    
    addImage(src, file) {
        let image = new Picture(src, file, this);
        this.elements.image = [image];

        this.update();
    }

    update() { 
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.current.width, this.canvas.current.height);
        
        for(const [key, value] of Object.entries(this.elements)) {
            for(const element of value) {
                element.render();
            }
        }
    }

    mouseup(event) {

    }

    mousedown(event) {
        if(this.active == "text") {
            for(let text of this.elements.text) {
                if(text.selected) {
                    text.selected = false;
                    this.update();
                    return;
                }
            }
            
            // Check if mouse is over another text element
            let isover = false;
            for(let text of this.elements.text) {
                if(text.isover()) {
                    isover = true;
                    break;
                }
            }

            // If not then draw
            if(!isover) {
                let mouse = this.getmouse(event);

                this.addText(mouse.x, mouse.y);
            }
        }
        
    }

    mousemove(event) {

    }

    keydown(event) {
        if(event.key.toLowerCase() == "t") {
            if(!this.elements.text.some((text) => text.selected)) {
                for(let property of this.app.properties.properties) {
                    if(property.name == "text") {
                        property.toggle();
                    }
                }
            }      
        }
    }

    componentDidMount() {
        this.ctx = this.canvas.current.getContext('2d');

        this.app.properties.onchange = () => {
            let active = this.app.properties.active();
            this.active = active ? active.name : null;
        }

        this.canvas.current.addEventListener('mouseup', (event) => {
            for(const [key, value] of Object.entries(this.elements)) {
                for(const element of value) {
                    element.mouseup(event);
                }
            }
            this.mouseup(event);
        }, true);
        this.canvas.current.addEventListener('mousedown', (event) => {
            for(const [key, value] of Object.entries(this.elements)) {
                for(const element of value) {
                    element.mousedown(event);
                }
            }
            this.mousedown(event);
        }, true);
        this.canvas.current.addEventListener('mousemove', (event) => {
            for(const [key, value] of Object.entries(this.elements)) {
                for(const element of value) {
                    element.mousemove(event);
                }
            }
            this.mousemove(event);
        }, true);
        document.body.addEventListener('keydown', (event) => {
            for(const [key, value] of Object.entries(this.elements)) {
                for(const element of value) {
                    element.keydown(event);
                }
            }
            this.keydown(event);
        }, true);
    }

    drop(files) {
       for(let file of files) {
           let src = URL.createObjectURL(file);
           this.addImage(src, file);
       }
    }
  
    render() {
        return (
            <div id="main-container">
                <div id="canvas-container" ref={this.canvasContainer}>  
                    <div id="dropzone-container">
                        <canvas id="main-canvas" width="512" height="512" ref={this.canvas}/>
                        <Dropzone drop={this.drop} main={this}></Dropzone>
                    </div>                
                    <div id="utility-container">
                        <button className="canvas-btn" onClick={this.delete.bind(this)}>
                            <img style={{
                                width: "30px",
                                height: "30px"
                            }} src={require("../assets/delete-icon.png")}></img>   
                        </button> 
                        <button className="canvas-btn" onClick={this.save.bind(this)}>
                        <img style={{
                            width: "30px",
                            height: "30px"
                        }} src={require("../assets/save-icon.png")}></img>   
                        <a download="image.png" href="" style={{
                            display: "none"
                        }} ref={this.download}/>
                    </button> 
                    </div>        
                </div>
                <div id="template">
                    <input type="number" name="width" max="1920" ref={this.widthInput}/>
                    <label for="width">Width</label>
                    <input type="number" name="height" max="1080" ref={this.heightInput}/>
                    <label for="height">Height</label>
                    <button onClick={this.submitSize.bind(this)}>Submit</button>
                </div>
            </div>
        )
    }
}

export default Canvas;