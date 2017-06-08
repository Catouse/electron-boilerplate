import React, {Component, PropTypes} from 'react';
import {
  Route,
  Link,
  Redirect
} from 'react-router-dom';
import Lang from 'Lang';
import ROUTE from 'Route';
import HomeView from 'Views/home';
import AboutView from 'Views/about';

const EmptyPage = ({name}) => <div className="center-content fluid"><div className="align-self-middle">功能尚未就绪</div></div>;

const routes = [
    {
        path: ROUTE.home,
        component: HomeView
    }, {
        path: ROUTE.about,
        component: AboutView
    }
];

class Page extends Component {
    render() {
        return <div className="tile flex box">
        {
            routes.map((route, i) => {
                return <Route key={i} path={route.path} children={({match, ...rest}) => {
                    return <div style={{display: match ? 'flex' : 'none'}} className="fluid"><route.component {...rest}/></div>;
                }}/>
            })
        }
        </div>;
    }
}

export default Page;
