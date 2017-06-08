import {
    BrowserWindow,
    app as ElectronApp,
    dialog,
    Tray,
    Menu,
    nativeImage,
    globalShortcut
}                         from 'electron';
import Config             from './resource/config';
import Lang               from './resource/lang';
import {EVENT}            from './resource/index';
import Events             from './utils/event-center';
import Helper             from './utils/helper';

if(DEBUG && process.type === 'renderer') {
    console.error('App remote must run in main process.');
}

const SELECT_MENU = Menu.buildFromTemplate([
    {role: 'copy', label: Lang['menu.copy']},
    {type: 'separator'},
    {role: 'selectall', label: Lang['menu.selectAll']}
]);

const INPUT_MENU = Menu.buildFromTemplate([
    {role: 'undo', label: Lang['menu.undo']},
    {role: 'redo', label: Lang['menu.redo']},
    {type: 'separator'},
    {role: 'cut', label: Lang['menu.cut']},
    {role: 'copy', label: Lang['menu.copy']},
    {role: 'paste', label: Lang['menu.paste']},
    {type: 'separator'},
    {role: 'selectall', label: Lang['menu.selectAll']}
]);

/**
 * App
 * 
 * Only for main process
 */
class AppRemote {

    /**
     * AppRemote constructor
     * @param  {object} mainWindow
     * @return {void}
     */
    constructor(mainWindow) {
        this.windows = {};

        if(typeof mainWindow === 'object') {
            if(mainWindow instanceof BrowserWindow) {
                this.mainWindow = mainWindow;
            } else {
                this.mainWindow = this.createWindow('main', mainWindow);
            }
        }
    }

    /**
     * Create browser window
     * @param  {string} name
     * @param  {object} options
     * @return {BorwserWindow}
     */
    createWindow(name, options) {
        if(typeof name === 'object') {
            options = name;
            name = options.name;
        }
        if(!name) {
            if(DEBUG) console.error("Window name must be set.");
            name = Helper.uuid;
        }

        let browserWindow = this.windows[name];
        if(browserWindow) {
            if(options.single) {
                browserWindow.show();
                browserWindow.reload();
                return;
            } else {
                browserWindow.close();
            }
        }

        browserWindow = new BrowserWindow(options);
        this.windows[name] = browserWindow;
        browserWindow.on('closed', () => {
            delete this.windows[name];
        });

        return browserWindow;
    }

    /**
     * Send channel message to all windows
     * @param  {string}    channel
     * @param  {...[any]} args
     * @return {void}
     */
    sendToWindows(channel, ...args) {
        Object.keys(this.windows).forEach(name => {
            this.sendToWindow(name, channel, ...args);
        });
    }

    /**
     * Send channel message to window
     * @param  {string}    name
     * @param  {string}    channel
     * @param  {...[any]} args
     * @return {void}
     */
    sendToWindow(name, channel, ...args) {
        let browserWindow = this.windows[name];
        if(browserWindow) {
            browserWindow.webContents.send(channel, ...args);
        }
    }

    /**
     * Init with main window
     * @param  {BrowserWindow} mainWindow
     * @return {void}
     */
    init(mainWindow) {
        if(mainWindow instanceof BrowserWindow) {
            this.mainWindow = mainWindow;
        }

        Events.ipc.on(EVENT.app_quit, e => {
            this.quit();
        });

        Events.ipc.on(EVENT.app_remote, (e, method, callBackEventName, ...args) => {
            let result = this[method];
            if(typeof result === 'function') {
                result = result.call(this, ...args);
            }
            if(method === 'quit') return;
            if(result instanceof Promise) {
                result.then(x => {
                    e.sender.send(callBackEventName, x);
                });
            } else if(result instanceof BrowserWindow) {
                result.webContents.on('did-finish-load', () => {
                    e.sender.send(callBackEventName, result.webContents);
                });
            } else {
                e.sender.send(callBackEventName, result);
            }
            if(DEBUG) console.info('Accept remote call', callBackEventName + '.' + method + '(', args, ')');
        });

        Events.ipc.on(EVENT.app_remote_send, (e, windowName, eventName, ...args) => {
            let browserWindow = this.windows[windowName];
            if(browserWindow) {
                browserWindow.webContents.send(eventName, ...args);
            }
        });
    }

    /**
     * Show and focus window
     */
    showAndFocusWindow(windowName = 'main') {
        let browserWindow = this.windows[windowName];
        if(browserWindow) {
            browserWindow.show();
            browserWindow.focus();
        }
    }

    /**
     * Get current window
     * @return {BrowserWindow}
     */
    get mainWindow() {
        return this.windows.main;
    }

    /**
     * Set main window
     * @param  {BrowserWindow} mainWindow
     * @return {void}
     */
    set mainWindow(mainWindow) {
        if(!mainWindow) {
            delete this.windows.main;
        } else {
            this.windows.main = mainWindow;
            mainWindow.on('close', e => {
                if(this.markClose) return;
                mainWindow.webContents.send(EVENT.app_quit);
                e.preventDefault();
                return false;
            });
            mainWindow.webContents.on('context-menu', (e, props) => {
                const {selectionText, isEditable} = props;
                if (isEditable) {
                    INPUT_MENU.popup(mainWindow);
                } else if (selectionText && selectionText.trim() !== '') {
                    SELECT_MENU.popup(mainWindow);
                }
            });
            
        }
    }

    /**
     * Get application root path
     * @return {string}
     */
    get appRoot() {
        return __dirname;
    }

    /**
     * Close main window
     * @return {void}
     */
    closeMainWindow() {
        this.markClose = true;
        this.mainWindow.close();
        this.mainWindow = null;
    }

    /**
     * Reload window
     * @param  {String|WebContent}  windowNameOrWebContents
     * @param  {Boolean}            confirm
     * @param  {Boolean}            ignoreCache
     * @return {void}
     */
    reloadWindow(windowNameOrWebContents = 'main', confirm = true, ignoreCache = false) {
        let webContents, browserWindow;
        if(typeof windowNameOrWebContents === 'string') {
            browserWindow = this.windows[windowNameOrWebContents];
            if(browserWindow) webContents = browserWindow.webContents;
        } else if(windowNameOrWebContents.webContents) {
            browserWindow = windowNameOrWebContents;
            webContents = windowNameOrWebContents.webContents;
        } else if(windowNameOrWebContents.reload) {
            webContents = windowNameOrWebContents;
        }
        if(webContents) {
            let reloadWindowCallback = () => {
                webContents[ignoreCache ? 'reloadIgnoringCache' : 'reload']();
            };
            if(confirm) {
                let options = {
                    buttons: [Lang.reload],
                    cancelId: 0,
                    type: 'question',
                    message: typeof confirm === 'string' ? confirm : Lang.confirmToReloadWindow
                };
                if(browserWindow) {
                    dialog.showMessageBox(browserWindow, options, reloadWindowCallback);
                } else {
                    dialog.showMessageBox(options, reloadWindowCallback);
                }
            } else {
                reloadWindowCallback();
            }
        }
    }

    /**
     * Close main window and quit
     */
    quit() {
        this.closeMainWindow();
        ElectronApp.quit();
        globalShortcut.unregisterAll();
    }

    /**
     * Set dock badge label
     * @param  {String} label
     * @return {void}
     */
    dockBadgeLabel(label) {
        if(Helper.isOSX) {
            ElectronApp.dock.setBadge(label);
        }
    }

    /**
     * Set dock bounce
     * @param  {String} type
     * @return {void}
     */
    dockBounce(type = 'informational') {
        if(Helper.isOSX) {
            ElectronApp.dock.bounce(type);
        }
    }
}

const app = new AppRemote();
if(DEBUG) console.info('App created.');

export default app;
