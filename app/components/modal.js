import React, {Component}     from 'react';
import PropTypes              from 'prop-types';
import ReactDOM               from 'react-dom';
import Icon                   from 'Components/mdi';
import EventListener          from 'react-event-listener';
import Lang                   from 'Lang';
import Spinner                from './spinner';
import Helper                 from 'Helper';
import InputControl           from 'Components/input-control';

const STAGE = {
    init: 0,
    show: 1,
    hide: 2,
    hidden: 3
};

class ModalView extends Component {

    state = {
        stage: STAGE.init,
        content: null
    };

    static propTypes = {
        afterShow: PropTypes.func,
        afterHide: PropTypes.func,
        onShow: PropTypes.func,
        onHide: PropTypes.func,
        onSubmit: PropTypes.func,
        onCancel: PropTypes.func,
        onClick: PropTypes.func,
        getLazyContent: PropTypes.func,
        modal: PropTypes.bool.isRequired,
        closeButton: PropTypes.bool.isRequired,
        header: PropTypes.any,
        footer: PropTypes.any,
        animated: PropTypes.bool,
        actions: PropTypes.any,
        removeAfterHide: PropTypes.any,
        show: PropTypes.bool
    };

    static defaultProps = {
        removeAfterHide: null,
        closeButton: true,
        animated: true,
        modal: false,
        show: true,
        actions: [
            {type: 'cancel'},
            {type: 'submit'},
        ],
        actionsAlign: 'right'
    };

    _resetContentSize() {
        if(this.modalContent) {
            let maxHeight = window.innerHeight;
            if(this.modalHeader) maxHeight -= this.modalHeader.offsetHeight;
            if(this.modalFooter) maxHeight -= this.modalFooter.offsetHeight;
            this.modalContent.style.maxHeight = maxHeight + 'px';
        }
    }

    _handleWindowKeyUp(e) {
        if (e.keyCode === 27 && !this.props.modal) { // ESC key code: 27
            this.hide();
        } else if(e.keyCode === 13 && this.hasSubmitAction) {
            this._handleActionButtonClick('submit');
        }
    }

    hide(callback) {
        this.setState({stage: STAGE.hide});

        this.props.onHide && this.props.onHide(this);
        clearTimeout(this.setStateTimeout);
        this.setStateTimeout = setTimeout(() => {
            this.setState({stage: STAGE.hidden});
            this.props.afterHide && this.props.afterHide(this);
            if(typeof callback === 'function') {
                callback(this);
            }
        }, 320);
    }

    init() {
        this.setState({stage: STAGE.init});
        this.content = null;
    }

    isShow() {
        return this.state.stage >= STAGE.show && this.state.stage < STAGE.hide;
    }

    show() {
        clearTimeout(this.setStateTimeout);
        this.setStateTimeout = setTimeout(() => {
            this.setState({stage: STAGE.show}, () => {
                if(this.props.getLazyContent) {
                    setTimeout(() => {
                        this.setState({content: this.props.getLazyContent()});
                    }, 320);
                }
                return this.props.afterShow && this.props.afterShow(this);
            })
        }, 10);

        this.props.onShow && this.props.onShow(this);
    }

    _handleClickCover() {
        if(!this.props.modal) this.hide();
    }

    componentDidMount() {
        if(this.props.show) {
            this.show();
        }
        this._resetContentSize();
    }

    componentDidUpdate() {
        if(this.state.stage === STAGE.init) {
            this.show();
        }
        this._resetContentSize();
    }

    _handleActionButtonClick(type, click) {
        let cancelHide = false;
        if(type === 'submit' && this.props.onSubmit) {
            cancelHide = this.props.onSubmit(this) === false;
        }
        if(type === 'cancel' && this.props.onCancel) {
            cancelHide = this.props.onCancel(this) === false;
        }
        if(!cancelHide && (type === 'submit' || type === 'cancel')) {
            this.hide();
        }
        return click && click(this);
    }
    
    render() {
        const STYLE = {
            cover: {
                position: 'fixed',
                zIndex: 1000,
                overflow: 'hidden',
                backgroundColor: 'rgba(0,0,0,0.54)',
                opacity: 0,
                visibility: 'hidden',
                transition: 'visibility .12s, opacity .12s',
            },
            modal: {
                transform: 'scale(.9) translate(0, -100px)',
                position: 'relative',
                opacity: 0,
                visibility: 'hidden',
                borderRadius: 2,
                zIndex: 1010,
                maxWidth: '100%',
                maxHeight: '100%',
                top: 0
            },
            closeButton: {
                position: 'absolute',
                right: 0,
                top: 0,
                zIndex: 1011,
            },
            footer: {
                padding: `${Helper.rem(10)} ${Helper.rem(20)}`,
            },
            content: {
                overflowX: 'hidden',
                overflowY: 'auto',
                boxSizing: 'border-box',
                padding: Helper.rem(20)
            },
            coverStage: {
                show: {
                    opacity: 1,
                    visibility: 'visible',
                },
                hide: {
                    opacity: 0,
                    visibility: 'hidden',
                }
            },
            stage: {
                show: {
                    transition: 'all .12s',
                    opacity: 1,
                    visibility: 'visible',
                    transform: 'scale(1) translate(0, 0)'
                },
                hide: {
                    transition: 'all .12s',
                    transform: 'scale(.9) translate(0, -100px)',
                    opacity: 0,
                    visibility: 'visible'
                }
            },
            transparent: {
                boxShadow: 'none',
                borderRadius: 0,
                border: 'none',
                background: 'transparent'
            },
            fullscreen: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            },
            clickThrough: {
                pointerEvents: 'none'
            }
        };

        let {
            children,
            content,
            style,
            contentStyle,
            header,
            transparent,
            fullscreen,
            headerStyle,
            footer,
            modal,
            width,
            closeButton,
            closeButtonStyle,
            clickThrough,
            actions,
            actionsAlign,
            ...other
        } = this.props;

        content = this.state.content || content;

        this.hasSubmitAction = false;
        let buttons = null;
        if(actions) {
            let buttonsIndex = 0;
            const isWindowsOS = Helper.isWindowsOS;
            actions.map((act, idx) => {
                if(!act.order) {
                    act.order = idx;
                    switch(act.type) {
                        case 'submit':
                            act.order += isWindowsOS ? (-9000) : 9000;
                            break;
                        case 'primary':
                            act.order += isWindowsOS ? (-8000) : 8000;
                            break;
                        case 'secondary':
                            act.order += isWindowsOS ? (-7000) : 7000;
                            break;
                        case 'cancel':
                            act.order += isWindowsOS ? (9000) : -9000;
                            break;
                    }
                }
                return act;
            });
            actions = actions.sort((act1, act2) => {
                return act1.order - act2.order;
            });
            buttons = actions.map(action => {
                if(action.type === 'submit') {
                    this.hasSubmitAction = true;
                }
                if(action.label === undefined) {
                    action.label = action.type === 'submit' ? Lang.confirm : action.type === 'cancel' ? Lang.cancel : 'SUBMIT';
                }
                action.primary = action.type === 'primary' || action.type === 'submit';
                action.secondary = action.type === 'secondary';
                action.onClick = this._handleActionButtonClick.bind(this, action.type, action.click);
                action.key = buttonsIndex++;

                let classNames = ['btn rounded'];
                if(action.wideBtn !== false) classNames.push('btn-wide');
                if(action.primary) classNames.push('primary');
                else if(action.secondary) classNames.push('text-primary primary-pale');
                else classNames.push('gray outline-cover');
                if(action.className) classNames.push(action.className);
                return <button type="button" className={classNames.join(' ')} key={action.key} onClick={action.onClick}>{action.label}</button>;
            });
        }

        style = Object.assign({width: width || 'auto'}, STYLE.modal, style);
        let coverStyle = Object.assign({}, STYLE.cover);

        if(this.state.stage === STAGE.show) {
            Object.assign(style, STYLE.stage.show);
            Object.assign(coverStyle, STYLE.coverStage.show);
        } else if(this.state.stage >= STAGE.hide) {
            Object.assign(style, STYLE.stage.hide);
            Object.assign(coverStyle, STYLE.coverStage.hide);
        }
        if(transparent) {
            Object.assign(style, STYLE.transparent);
        }
        if(fullscreen) {
            Object.assign(style, STYLE.fullscreen);
        }
        if(clickThrough) {
            Object.assign(style, STYLE.clickThrough);
        }

        this.modalHeader = null;
        this.modalFooter = null;

        return <div {...other} style={this.state.stage >= STAGE.hidden ? {display: 'none'} : STYLE.wrapper} className='affix center-content'>
            <div className='affix' style={coverStyle} onClick={this._handleClickCover.bind(this)}></div>
            <div ref={(e) => this.modal = e} style={style} className="canvas shadow-3">
              {closeButton ? <a className="avatar avatar-lg" onClick={this.hide.bind(this)} style={Object.assign({}, STYLE.closeButton, closeButtonStyle)}><Icon className="icon-hx muted" name="close" /></a> : null}
              {header !== undefined ? <header ref={e => this.modalHeader = e} style={Object.assign({}, STYLE.header, headerStyle)}>{typeof header === 'function' ? header() : <div className="heading gray" style={{paddingRight: Helper.rem(40)}}><strong className="title">{header}&nbsp;</strong></div>}</header> : null}
              <div style={Object.assign({}, STYLE.content, contentStyle)} ref={e => this.modalContent = e}>
                {typeof(content) === 'function' ? content() : content || <Spinner />}
                {children ? <div>{children}</div> : null}
              </div>
              {footer !== undefined || buttons ? <footer className="divider-top" ref={e => this.modalFooter = e} style={STYLE.footer}>{footer}<div className="toolbox" style={{textAlign: actionsAlign || 'right'}}>{buttons}</div></footer> : null}
            </div>
            <EventListener
              target='window'
              onResize={this._resetContentSize.bind(this)}
              onKeyup={this._handleWindowKeyUp.bind(this)}
            />
        </div>
    }
}

class Modal extends Component {

    show(options) {
        this.setState({options});
    }

    hide(remove) {
        Modal.hide(this.id, remove);
    }

    isShow() {
        return Modal.isShow(this.id);
    }

    toggle(options) {
        options = Object.assign({}, options, {id: this.id});
        return Modal.toggle(options);
    }

    render() {
        let options = Object.assign({
            id: (this.id || 'modal-' + Helper.guid),
            show: false,
            removeAfterHide: false
        }, this.state.options || this.props);
        if(options.children) {
            options.content = options.children;
            delete options.children;
        }
        if(!this.id) {
            this.id = options.id;
        }
        Modal.show(options);
        return <div data-desc={'Modal keeper ' + this.id}></div>;
    }
}

Modal.global = {};

/**
 * Show global modal
 * @param  {Object} options
 * @return {Void}
 */
Modal.show = function(options) {
    options = Object.assign({id: 'globalModal', removeAfterHide: 'auto'}, options);
    let modal = Modal.global[options.id];
    if(modal) {
        setTimeout(() => {
            modal.show(options);
        }, 10);
        return;
    }

    let containerId = options.id + 'Container';
    let container = document.getElementById(containerId);
    if(!container) {
        container = document.createElement('div');
        container.id = containerId;
        document.body.appendChild(container);
        container = document.getElementById(containerId);
    }

    let afterShow = modal => {
        Modal.global[modal.props.id] = modal;
    };

    let afterHide = modal => {
        options.afterHide && options.afterHide(modal);
        let removeAfterHide = modal.props.removeAfterHide;
        if(removeAfterHide === true || (removeAfterHide === 'auto' && modal.props.id === 'globalModal')) {
            let containerElement = document.getElementById(modal.props.id + 'Container');
            ReactDOM.unmountComponentAtNode(containerElement);
            containerElement.parentNode.removeChild(containerElement);
            delete Modal.global[modal.props.id];
        }
    };

    ReactDOM.render(<ModalView {...options} afterHide={afterHide} afterShow={afterShow} />, container);
};

Modal.alert = (text, options) => {
    return new Promise((resolve, reject) => {
        options = Object.assign({
            modal: true,
            content: text,
            style: {minWidth: Helper.rem(300)},
            closeButton: false,
            actions: [{type: 'submit'}]
        }, options, {
            onHide: resolve
        });
        Modal.show(options);
    });
};

Modal.confirm = (title, options) => {
    return new Promise((resolve, reject) => {
        var confirmed = false;
        options = Object.assign({
            modal: true,
            content: title,
            style: {minWidth: Helper.rem(300)},
            closeButton: false
        }, options, {
            onHide: () => {
                if(!confirmed) {
                  reject();
                }
            },
            onSubmit: resolve
        });
        Modal.show(options);
    });
};

Modal.prompt = (text, defaultText, options = {}) => {
    if(typeof defaultText === 'object') {
        options = defaultText;
        defaultText = '';
    }
    return new Promise((resolve, reject) => {
        let confirmed = false;
        let value = null;
        const content = <InputControl autoFocus={true} defaultValue={defaultText} placeholder={options.placeholder} helpText={options.helpText} label={text} onChange={newValue => {
            value = newValue;
        }}/>
        options = Object.assign({
            modal: true,
            content,
            style: {minWidth: Helper.rem(300)},
            closeButton: false
        }, options, {
            onHide: () => {
                if(!confirmed) {
                  reject();
                }
            },
            onSubmit: () => {
                resolve(value);
            }
        });
        Modal.show(options);
    });
};

Modal.remove = (id = 'globalModal') => {
    let containerElement = document.getElementById(id + 'Container');
    ReactDOM.unmountComponentAtNode(containerElement);
    containerElement.parentNode.removeChild(containerElement);
    delete Modal.global[id];
};

/**
 * Hide global modal
 * @param  {String}  id
 * @return {Void}
 */
Modal.hide = function(id = 'globalModal', remove = false) {
    let modal = Modal.global[id];
    if(modal) modal.hide(() => {
        if(remove) {
            Modal.remove(id);
        }
    }); 
};

/**
 * Check the modal is show or hidden
 * @param  {String}  id
 * @return {Boolean}
 */
Modal.isShow = function(id = 'globalModal') {
    let modal = Modal.global[id];
    if(modal) return modal.isShow(); 
    return false;
};

/**
 * Toggle modal
 * @param  {Object} options
 * @return {Void}
 */
Modal.toggle = function(options) {
    options = Object.assign({id: 'globalModal'}, options);
    if(Modal.isShow(options.id)) {
        Modal.hide(options.id);
    } else {
        Modal.show(options);
    }
};

Modal.open = Modal.show;
Modal.dismiss = Modal.close = Modal.hide;

export {ModalView};
export default Modal;
