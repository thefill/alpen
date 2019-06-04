import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import './index.scss';
import {AppModule} from './modules/app/app.module';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
    (
        <BrowserRouter>
            <AppModule/>
        </BrowserRouter>
    ),
    document.getElementById('root') as HTMLElement
);
registerServiceWorker();
