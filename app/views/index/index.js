import React, {Component, PropTypes} from 'react';
import {
  HashRouter as Router,
  Route,
  Redirect
} from 'react-router-dom';
import Navbar from './navbar';
import Page from './page';
import Config from 'Config';
import ROUTE from 'Route';

class IndexView extends Component {
    render() {
        return <Router>
          <div className="column fluid flex-nowrap">
            <div className="cell fixed">
              <Navbar/>
            </div>
            <div className="cell">
              <Page/>
            </div>
            <Redirect to={Config.getConfig('route.default', ROUTE.$default())}/>
          </div>
        </Router>;
    }
}

export default IndexView;
