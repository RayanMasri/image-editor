import React from 'react';
import Dropzone from "./Dropzone.js";

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
    constructor(src, file, ctx, update) {
        super(NaN, NaN, ctx, update);
        this.src = src;
        this.file = file;
        this.img = undefined;

        this.bytesize = 0;
        this.size = {
            width: NaN,
            height: NaN
        }
        this.display = false;
    }

    seebytes(b) {
        let s = ['B', 'KB', 'MB', 'GB', 'TB'];
        if (b == 0) return '0 B';
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
        this.see(event);
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
                self.img = img;
                self.bytesize = self.file.size;
                self.size = {
                    width: this.width,
                    height: this.height
                }
                self.x = 512 / 2 - this.width / 2;
                self.y = 512 / 2 - this.height / 2;

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
            self.ctx.globalCompositeOperation = 'destination-over';
            self.ctx.drawImage(self.img, self.x, self.y);

            if(self.display) {
                self.ctx.fillStyle = "black";
                self.ctx.font = "10px sans-serif";
                self.ctx.fillText(`${self.seebytes(self.bytesize)} ${self.size.width}x${self.size.height}`, self.x, self.y);
            }
        })
    }
}

class Canvas extends React.Component {
    constructor(props) {
        super(props);
        this.app = this.props.app;
        this.canvas = React.createRef();
        this.download = React.createRef();

        this.active = null;
        this.ctx = null;
        this.elements = {
            text: [],
            image: []
        }
    }
    
    delete() {
        window.location.reload(false); 
    }
    
    save() {
        let url = this.canvas.current.toDataURL("image/png");
        this.download.current.href = url;
        this.download.current.click();
    }
        
    addText(x, y) {
        this.elements.text.map((text) => {
            text.unfocus();
        })

        let text = new Text(x, y, this.ctx, this.update.bind(this));
        this.elements.text.push(text);

        this.update();
    }
    
    addImage(src, file) {
        let image = new Picture(src, file, this.ctx, this.update.bind(this));
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
        if(this.active) {
            if(this.active == "text") {
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
                    this.addText(event.layerX, event.layerY);
                    this.app.properties.disable();
                }
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

        // this.props.app.properties.add(require("../assets/save-icon.png"));
        // document.getElementById("properties-container").add();
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
                <div id="canvas-container">  
                    <canvas id="main-canvas" width="512" height="512" ref={this.canvas}/>
                    <Dropzone drop={this.drop} main={this}></Dropzone>
                </div>
                <div id="utility-container">
                    <button className="canvas-btn" onClick={this.delete}>
                        <img style={{
                            width: "30px",
                            height: "30px"
                        }} src={require("../assets/delete-icon.png")}></img>   
                    </button> 
                    <button className="canvas-btn" onClick={this.save}>
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
        )
    }
}

export default Canvas;