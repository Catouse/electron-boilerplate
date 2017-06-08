import {
    shell,
    clipboard,
    remote as Remote,
    screen as Screen,
    nativeImage as NativeImage
}                         from 'electron';
import Path               from 'path';
import React              from 'react';
import ReactDOM           from 'react-dom';
import Events             from 'Events';
import Config             from 'Config';
import Helper             from 'Helper';
import {EVENT}            from 'Resource';
import Lang               from 'Lang';

if(DEBUG && process.type !== 'renderer') {
    console.error('App must run in renderer process.');
}

const Menu           = Remote.Menu;
const MenuItem       = Remote.MenuItem;
const Dialog         = Remote.dialog;
const BrowserWindow  = Remote.BrowserWindow;
const GlobalShortcut = Remote.globalShortcut;

/**
 * Application
 * 
 * Only for renderer process
 */
class App {

    /**
     * Application constructor
     */
    constructor() {
        this.browserWindow = Remote.getCurrentWindow();

        this.remote('appRoot').then(appRoot => {
            this.appRoot = appRoot;
        });

        this.data = {};

        this._initEvents();
    }

    /**
     * Get data
     * @param  {string|object|array} name
     * @param  {any} defaultValue
     * @return {any}
     */
    getData(name, defaultValue) {
        if(Array.isArray(name)) {
            return name.map(n => {
                return this.getData(n);
            });
        }
        if(typeof name === 'object') {
            return Object.keys(name).forEach(n => {
                return this.getData(n, name[n]);
            });
        }
        const value = this.data[name];
        return value === undefined ? defaultValue : value;
    }

    /**
     * Set data
     * @param {string|object} name
     * @param {void} value
     */
    setData(name, value) {
        if(typeof name === 'object') {
            Object.assign(this.data, name);
        } else if(value === undefined) {
            delete this.data[name];
        } else {
            this.data[name] = value;
        }
        return this;
    }

    /**
     * Initial function to init events
     * @return {void}
     */
    _initEvents() {
        this.browserWindow.on('focus', () => {
            Events.emit(EVENT.ui_focus_main_window);
            this.browserWindow.flashFrame(false);
        });

        this.browserWindow.on('restore', () => {
            this.browserWindow.setSkipTaskbar(false);
            Events.emit(EVENT.ui_show_main_window);
        });

        this.browserWindow.on('minimize', () => {
            Events.emit(EVENT.ui_hide_main_window);
        });

        Events.ipc.on(EVENT.app_quit, () => {
            this.quit();
        });
    }

    /**
     * Open url with electron shell
     * @param  {String} url
     * @return {void}
     */
    openUrl(url) {
        shell.openExternal(url);
    }

    /**
     * Open help file in browser
     * @return {void}
     */
    openHelp() {
        let helpFilePath = Config.getConfig('helpFile', Path.join(this.appRoot, './doc/help.html'));
        if(!helpFilePath.startsWith('http://') && !helpFilePath.startsWith('https://')) {
            helpFilePath = 'file://' + helpFilePath;
        }
        this.openUrl(helpFilePath);
    }

    /**
     * Get remote property or call remote methods
     */
    remote(method, ...args) {
        return new Promise((resolve, reject) => {
            let callBackEventName = EVENT.app_remote + '.' + Helper.guid;
            Events.ipc.once(callBackEventName, (e, remoteResult) => {
                resolve(remoteResult);
            });
            Events.ipc.send(EVENT.app_remote, method, callBackEventName, ...args);
        });
    }

    /**
     * Show and focus main window
     * @return {void}
     */
    showAndFocusWindow() {
        this.browserWindow.show();
        this.browserWindow.focus();
    }

    /**
     * Set current badage label
     * @param  {string | false} label
     * @return {void}
     */
    set badgeLabel(label = '') {
        this.remote('dockBadgeLabel', (label || '') + '');
    }

    /**
     * Check whether the main window is open and focus
     * @return {boolean}
     */
    get isWindowOpenAndFocus() {
        return this.browserWindow.isFocused() && this.isWindowOpen;
    }

    /**
     * Check whether the main window is open
     */
    get isWindowOpen() {
        return this.browserWindow.isVisible() && !this.browserWindow.isMinimized();
    }

    /**
     * Check whether the main window is focused
     */
    get isWindowsFocus() {
        return this.browserWindow.isFocused();
    }

    /**
     * Request attention to the main window
     * @return {void}
     */
    requestAttention(attention) {
        this.remote('dockBounce', 'informational');
        this.browserWindow.flashFrame(true);
    }

    /**
     * Create context menu
     * @param  {Array[Object]} items
     * @return {Menu}
     */
    createContextMenu(menu) {
        if(Array.isArray(menu) && !menu.popup) {
            menu = Menu.buildFromTemplate(menu);
        }
        return menu;
    }

    /**
     * Popup context menu
     */
    popupContextMenu(menu, x, y) {
        if(typeof x === 'object') {
            y = x.clientY;
            x = x.clientX;
        }
        menu = this.createContextMenu(menu);
        menu.popup(this.browserWindow, x, y);
    }

    /**
     * Show save dialog
     * @param object   options
     */
    showSaveDialog(options, callback) {
        if(options.sourceFilePath) {
            let sourceFilePath = options.sourceFilePath;
            delete options.sourceFilePath;
            return this.showSaveDialog(options, filename => {
                if(filename) {
                    Helper.copyFile(sourceFilePath, filename)
                          .then(() => {
                             callback && callback(filename);
                          }).catch(callback);
                } else {
                    callback && callback();
                }
            });
        }

        let filename = options.fileName || '';
        delete options.fileName;

        options = Object.assign({
            title: Lang.dialog.fileSaveTo,
            defaultPath: Path.join(this.user.getConfig('local.ui.app.lastFileSavePath', this.desktopPath), filename)
        }, options);
        Dialog.showSaveDialog(this.browserWindow, options, filename => {
            if(filename) {
                this.user.setConfig('local.ui.app.lastFileSavePath', Path.dirname(filename));
            }
            callback && callback(filename);
        });
    }

    /**
     * Show open dialog
     */
    showOpenDialog(options, callback) {
        options = Object.assign({
            title: Lang.dialog.openFile,
            defaultPath: this.desktopPath,
            properties: ['openFile']
        }, options);
        Dialog.showOpenDialog(this.browserWindow, options, callback);
    }

    /**
     * Register global hotkey
     * @param  {object} option
     * @param  {string} name
     * @return {void}
     */
    registerGlobalShortcut(name, accelerator, callback) {
        if(!this.shortcuts) {
            this.shortcuts = {};
        }
        this.unregisterGlobalShortcut(name);
        this.shortcuts[name] = accelerator;
        GlobalShortcut.register(accelerator, () => {
            if(DEBUG) console.log("%cGLOBAL KEY ACTIVE " + name + ': ' + accelerator, 'display: inline-block; font-size: 10px; color: #fff; border: 1px solid #673AB7; padding: 1px 5px; border-radius: 2px; background: #673AB7');
            callback();
        });
        if(DEBUG) console.log("%cGLOBAL KEY BIND " + name + ': ' + accelerator, 'display: inline-block; font-size: 10px; color: #673AB7; border: 1px solid #673AB7; padding: 1px 5px; border-radius: 2px');
    }

    /**
     * Check a shortcu whether is registered
     */
    isGlobalShortcutRegistered(accelerator) {
        return GlobalShortcut.isRegistered(accelerator);
    }

    /**
     * Unregister global hotkey
     * @param  {gui.Shortcut | string | object} hotkey
     * @return {void}
     */
    unregisterGlobalShortcut(name) {
        if(this.shortcuts && this.shortcuts[name]) {
            GlobalShortcut.unregister(this.shortcuts[name]);
            delete this.shortcuts[name];
        }
    }

    /**
     * Quit application
     */
    quit() {
        this.browserWindow.hide();
        setTimeout(() => {
            this.remote('quit');
        }, 1000);
    }
}

const app = new App();

if(DEBUG) global.App = app;

export default app;
