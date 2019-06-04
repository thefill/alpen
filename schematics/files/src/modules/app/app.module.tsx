import {FocusStyleManager} from "@blueprintjs/core";
import * as React from 'react';
import {Link, Route} from 'react-router-dom';
import logo from "./../../assets/logo.svg";
import {PageAModule} from '../page-a';
import {PageBModule} from '../page-b';
import './app.module.scss';


export interface ISectionState {
    currentSectionId: string;
}

export class AppModule extends React.Component<any, ISectionState> {

    constructor(props: any){
        super(props);

        // disable focus on mouse click
        FocusStyleManager.onlyShowFocusOnTabs();
    }

    public render(){

        return (
            <div>
                <div style={{width: '100px'}}>
                    <img src={logo}alt="logo"/>
                </div>
                <h1>Starter kit</h1>
                <p>Navigate:</p>
                <nav>
                    <Link to="/page-a">Page A</Link>
                    <br/>
                    <Link to="/page-b">Page B</Link>
                </nav>
                <div>
                    <Route path="/page-a" component={PageAModule}/>
                    <Route path="/page-b" component={PageBModule}/>
                </div>
            </div>
        );
    }
}
