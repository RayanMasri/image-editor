import React from 'react';
import Canvas from './components/Canvas.js'
import './App.css';

class App extends React.Component { 
    render() {   
        return (
            <div id="App">
                <Canvas></Canvas>
                <div id="social-links" style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    position: "fixed",
                    bottom: "0",
                    right: "0"                   
                }}>
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

// function ShowImage(files) {
//     for(let i = 0; i < files.length; i++) {
//         let file = files[i];
//         let url = URL.createObjectURL(file);
        
//     }
//     // let first_file = files[0];
//     // console.log(first_file);
//     // console.log();
//     // console.log("Uploaded new image");
// }

// const Child1 = React.forwardRef((props, ref) => {
//     return <div ref={ref}>Child1</div> 
// });

// const Child2 = React.forwardRef((props, ref) => {
//     const handleClick= () =>{};
//     React.useImperativeHandle(ref,() => ({
//        handleClick
//     }))
//     return <div>Child2</div> 
// });
// const App = () => {
//     const child1 = React.useRef(null);
//     const child2 = React.useRef(null);
//     console.log(child1.current);
//     console.log(child2.current);

//     return (
//         <>
//            <Child1 ref={child1} />
//            <Child1 ref={child1} />
//            <button></button>
//         </>
//     )
// }
// class MyComponent extends React.Component {
//     constructor(props) {
//       super(props);
//       this.myRef = React.createRef();
//     }    
//     render() {
//       return <div ref={this.myRef} />;
//     }    
// }

// class App extends React.Component {    
//     render() {
//         // console.log(useRef(null));
//         // const child1 = useRef(null);
//         // const child2 = useRef(null);
//         // console.log(React.useRef(null));
//         // console.log(React.useRef(null));

//         return (
//             <MyComponent></MyComponent>
//             // <div id="App">
//             //     <Dropzone onDrop={acceptedFiles => ShowImage(acceptedFiles)}>
//             //     {({getRootProps, getInputProps}) => (
//             //         <section>
//             //         <div {...getRootProps()}>
//             //             <input {...getInputProps()} />
//             //             <p>Drag 'n' drop some files here, or click to select files</p>
//             //         </div>
//             //         </section>
//             //     )}
//             //     </Dropzone>
//             //     <Child1 ref={child1}></Child1>
//             // </div>
//         );
//     }
//     // }
//     // componentDidUpdate() {
//     //     console.log(this.refs["preview"]);
//     // }
// }

export default App;
