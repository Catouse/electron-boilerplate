import React, {Component} from 'react';
import {NavLink} from 'react-router-dom';
import Lang from 'Lang';
import ROUTE from 'Route';
import App from 'App';

const navItems = [
    {
        id: 'home',
    }, {
        id: 'about'
    }
];

class Navbar extends Component {
    render() {
        return <nav className="nav">
        {
            navItems.map(item => {
                return <NavLink key={item.id} to={item.to || ROUTE[item.id]}>{item.title || Lang['navbar.' + item.id] || item.id}</NavLink>
            })
        }
        </nav>;
    }
}

export default Navbar;
