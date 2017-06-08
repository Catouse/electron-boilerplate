import 'Style/style.less';
import React                  from 'react';
import ReactDOM               from 'react-dom';
import DEBUG                  from 'DEBUG';
import Helper                 from 'Helper';
import R                      from 'Resource';
import ActionLink             from 'Utils/action-link';
import IndexView              from 'Views/index';
// import Messager               from 'Components/messager';
import Lang                   from 'Lang';
import App                    from 'App';
import Events                 from 'Events';

window.addEventListener('online',  () => {
    Events.emit(R.event.net_online);
    Events.ipc.emit(R.event.net_online);
});

window.addEventListener('offline',  () => {
    Events.emit(R.event.net_offline);
    Events.ipc.emit(R.event.net_offline);
});

document.title = Lang.title;
if(DEBUG) {
    document.title += '- ' + window.location.href;
}

document.addEventListener('click', e => {
    let target = e.target;
    while(target && !((target.classList && target.classList.contains('action-link')) || (target.tagName === 'A' && target.attributes['href']))) {
        target = target.parentNode;
    }
    if(target && ((target.classList && target.classList.contains('action-link')) || (target.tagName === 'A' && target.attributes['href']))) {
        let link = target.attributes['href'] || target.attributes['data-target'];
        if(link && link.value) {
            var actionLink = new ActionLink(link.value, e);
            if(actionLink.isUrl) {
                App.openUrl(actionLink.target);
            } else {
                Events.emit(R.event.action_link, actionLink);
                if(actionLink.action) {
                    Events.emit(`${R.event.action_link}${actionLink.action}`, actionLink);
                }
            }
            if(!actionLink.isRoute) {
                e.preventDefault();
            }
        }
    }
});

const appElement = document.getElementById('appContainer');
ReactDOM.render(<IndexView />, appElement);

const loadingElement = document.getElementById('loading');
loadingElement.parentNode.removeChild(loadingElement);

Events.on(R.event.messager_show, (options, ...args) => {
    alert(option.content);
    // if(typeof option === 'string') {
    //     Messager[option].call(...args);
    // } else {
    //     Messager.hide();
    //     Messager.show(options);
    // }
});
