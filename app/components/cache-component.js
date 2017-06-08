import React, {Component, PropTypes} from 'react';
import {Route} from 'react-router-dom';

class CacheComponent extends Component {

    constructor(props) {
        super(props);
        this._cache = {};
    }

    makeCache(cacheId) {
        if(DEBUG) {
            console.error('makeCache method must be defined in component.');
        }
        return <div>Empty cache "{cacheId}"</div>;
    }

    getDisplayCacheId() {
        if(DEBUG) {
            console.error('makeCache method must be defined in component.');
        }
        return null;
    }

    makeCacheContainer(cacheId, content = null, isDisplayCache = false) {
        return <div key={cacheId} style={isDisplayCache ? null : {display: 'none'}}>{content}</div>;
    }

    clearCache(cacheId) {
        if(cacheId) {
            delete this._cache[cacheId]
        } else {
            this._cache = {};
        }
    }

    renderCaches() {
        const displayCacheId = this.getDisplayCacheId();

        let cache = this._cache[displayCacheId];
        if(!cache) {
            cache = {content: this.makeCache(cacheId)};
        }
        cache.displayTime = new Date().getTime();
        this._cache[displayCacheId] = cache;
        
        let cacheItems = [];
        Object.keys(this._cache).forEach((c, id) => {
            if(c) {
                cacheItems.push(this.makeCacheContainer(id, c.content, id === displayContentId));
            }
        });

        return cacheItems;
    }

    render() {
        let {
            children,
            other
        } = this.props;
        return <div {...other}>
          {this.renderCaches();}
          {children}
        </div>;
    }
}

export default CacheComponent;
