import React from 'react';
import ReactDOM from 'react-dom';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

// Holds an object that contains values, can be edited in the web
class Component {
    constructor(onupdate) {
        this.onupdate = onupdate;
        this.data = {};
    }

    update(data) {
        this.data = data;
        this.onupdate(this.data);
    }
}

class Menu extends Component {
    constructor(onupdate, object) {
        super(onupdate);
        this.options = object.options;
        this.default = object.default;
        this.title = object.title;
    }

    onchange(result) {
        this.update({
            option: result.value
        });
    }

    render() {
        return (
            <div className="component">
                <div className="menu-component">
                    <p style={{
                        textAlign: "center",
                        fontSize: "25px",
                        height: "25px"
                    }}>{this.title}</p>
                    <Dropdown options={this.options} onChange={this.onchange.bind(this)} value={this.default} placeholder="Select an option"/>
                </div>
            </div>
        )
    }
}

const types = {
    menu: Menu
}

class Property {
    constructor(Instance, object, callback) {
        this.component = new Instance(callback, object);
    }

    render() {
        return (
            <div className="property">
                {this.component.render()}
                <hr/>
            </div>
        )
    }
}

class Properties extends React.Component {
    constructor() {
        super();
        this.properties = [];
    }

    componentDidMount() {
        const { mainRef } = this.props;
        mainRef(this);
    }   

    componentWillUnmount() {
        const { mainRef } = this.props;
        mainRef(undefined);
    }

    add(type, object, callback) { 
        let property = new Property(types[type], object, callback);

        this.properties.push(property);

        this.update();
    }

    update() {
        let elements = this.properties.map(property => property.render());

        ReactDOM.render(
            <div>
                {elements}
            </div>,
            document.getElementById("properties-container")
        )
    }

    render() {
        return <div id="properties-container"/>         
    }
}

export default Properties;
