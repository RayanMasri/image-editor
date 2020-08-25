import React from 'react';
import Canvas from './components/Canvas.js'
import Properties from './components/Properties.js'
import './App.css';

class App extends React.Component { 
    componentDidMount() {
        this.properties.add(
            "text",
            require("./assets/text-icon-idle.png"),
            require("./assets/text-icon-active.png")
        );
    }

    render() {   
        return (
            <div id="App">
                <Properties mainRef={ref => (this.properties = ref)} ></Properties>
                <Canvas app={this}/>
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
