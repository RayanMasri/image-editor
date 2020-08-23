import React from 'react';
import ReactDOM from 'react-dom';

class Property {
    constructor(name, icon, onchange, properties) {
        this.name = name;
        this.icon = icon;    
        this.properties = properties;
        this.onchange = onchange;
        this.active = false;
        this.button = React.createRef();
    }

    disableOthers() {
        for(let property of this.properties) {
            if(property != this) {
                property.active = false;
                property.draw();
            }
        }
    }

    focus() {
        this.disableOthers();
        this.active = true;
        this.draw();
        this.onchange();
    }

    unfocus() { 
        this.disableOthers();
        this.active = false;
        this.draw();
        this.onchange();
    }

    toggle() {
        this.disableOthers();
        this.active = !this.active;
        this.draw();
        this.onchange();
    }

    draw() {
        this.button.current.style.backgroundColor = this.active ? "lightgray" : "gray";
    }

    render() {
        return (
            <div className="property-container">
                <button ref={this.button} className="property-button" onClick={this.toggle.bind(this)}>
                    <img className="property-icon" src={this.icon}/>
                </button>
            </div>
        )
    }
}

class Properties extends React.Component {
    constructor() {
        super();
        this.properties = [];
        this.onchange = null;
    }

    componentDidMount() {
        const { mainRef } = this.props;
        mainRef(this);
    }   

    componentWillUnmount() {
        const { mainRef } = this.props;
        mainRef(undefined);
    }

    add(name, icon) { 
        let property = new Property(name, icon, this.onchange, this.properties);
        this.properties.push(property);

        this.update();
    }

    update() {
        const elements = [];

        for(let property of this.properties) {
            let render = property.render();
            // console.log(render);
            elements.push(render);
        }

        ReactDOM.render(
            <div>
                {elements}
            </div>,
            document.getElementById("properties-container")
        )
    }

    active() {
        for(let property of this.properties) {
            if(property.active) {
                return property;                
            }
        }
    }

    disable() {
        for(let property of this.properties) {
            property.active = false;
            property.draw();
        }
        this.onchange();
    }

    render() {
        return <div id="properties-container"/>         
    }
}

export default Properties;
