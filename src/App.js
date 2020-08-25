import React from 'react';
import Canvas from './components/Canvas.js'
import Tools from './components/Tools.js'
import './App.css';

class App extends React.Component { 
    componentDidMount() {
        // Tool bar
        this.tools.add(
            "text",
            require("./assets/text-icon-idle.png"),
            require("./assets/text-icon-active.png")
        );

        // Canvas events
        document.body.addEventListener('click', (event) => {
            if(["upload-input", "upload-icon"].includes(event.target.className)) {
                event.stopPropagation();
                return;
            }
        })

        document.body.addEventListener('mouseup', (event) => {
            if(event.target.id == "main-canvas") {
                if(event.which == 1) {
                    this.canvas.mouseup(event);
                }
            }
        });

        document.body.addEventListener('mousedown', (event) => {
            if(event.target.id == "main-canvas") {
                if(event.which == 1) {
                    this.canvas.mousedown(event);
                }
            }
        });

        document.body.addEventListener('mousemove', (event) => {
            if(event.target.id == "main-canvas") {
                this.canvas.mousemove(event);
            }
        });

        document.body.addEventListener('keydown', (event) => {
            this.canvas.keydown(event);
        });
    }

    render() {   
        return (
            <div id="App">
                <Tools mainRef={ref => (this.tools = ref)} ></Tools>
                <Canvas mainRef={ref => (this.canvas = ref)} app={this}/>
                <div id="social-links">
                    <div id="github-div">
                        <a id="github-link" href="https://github.com/RayanMasri/image-editor" target="_blank">
                            <img style={{
                                width: "32px",
                                height: "32px"
                            }} src={require("./assets/github-icon.png")}/>
                        </a>
                    </div>
                </div>
            </div>
        )        
    }
}

export default App;
