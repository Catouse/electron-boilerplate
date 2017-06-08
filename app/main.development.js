import electron, { 
    app, 
    BrowserWindow,
    Menu
}                   from 'electron';
import DEBUG        from './utils/debug';
import Lang         from './resource/lang';
import PKG          from './package.json';
import application  from './app-remote';

let mainWindow = null;

if(process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support'); // eslint-disable-line
    sourceMapSupport.install();
}

if(DEBUG && DEBUG !== 'production') {
    require('electron-debug')(); // eslint-disable-line global-require
    const path = require('path'); // eslint-disable-line
    const p = path.join(__dirname, '..', 'app', 'node_modules'); // eslint-disable-line
    require('module').globalPaths.push(p); // eslint-disable-line
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit();
});

const installExtensions = async() => {
    if (DEBUG && DEBUG === 'debug') {
        const installer = require('electron-devtools-installer'); // eslint-disable-line global-require

        const extensions = [
            'REACT_DEVELOPER_TOOLS',
            'REDUX_DEVTOOLS'
        ];
        const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
        for (const name of extensions) { // eslint-disable-line
            try {
                await installer.default(installer[name], forceDownload);
            } catch (e) {} // eslint-disable-line
        }
    }
};

// Create application menu
// const createMenu = () => {
//     if (process.platform === 'darwin') {
//     } else {
//     }
// };

// Create application main window
const createWindow = () => {
    let mainWindowOptions = {
        show: false,
        width: 1024,
        height: 728,
        autoHideMenuBar: process.platform !== 'darwin',
        backgroundColor: '#FFF'
    };
    if(DEBUG) {
        let display = electron.screen.getPrimaryDisplay();
        mainWindowOptions.height = display.workAreaSize.height;
        mainWindowOptions.width = 1200;
        mainWindowOptions.x = display.workArea.x;
        mainWindowOptions.y = display.workArea.y;
    }
    mainWindow = new BrowserWindow(mainWindowOptions);

    mainWindow.loadURL(`file://${__dirname}/windows/index.html`);

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.show();
        mainWindow.focus();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
        application.mainWindow = null;
    });

    application.mainWindow = mainWindow;

    // Show developer tools
    if (DEBUG) {
        mainWindow.openDevTools();
        mainWindow.webContents.on('context-menu', (e, props) => {
            const { x, y } = props;

            Menu.buildFromTemplate([{
                label: Lang['debug.inspectElement'],
                click() {
                    mainWindow.inspectElement(x, y);
                }
            }]).popup(mainWindow);
        });
        console.info('Main window created.');
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async() => {
    await installExtensions();
    createWindow();
    application.init();
    if(DEBUG) console.info('Electron app ready.');
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
    if(DEBUG) console.info('Electron app activate.');
});

// Set applcation about panel for mac os
if(typeof app.setAboutPanelOptions === 'function') {
    app.setAboutPanelOptions({
        applicationName: Lang.string('title', PKG.name),
        applicationVersion: PKG.version,
        copyright: PKG.copyright,
        credits: 'Licence: ' + PKG.license,
        version: DEBUG ? '[debug]' : ''
    });
}

if(DEBUG) {
    global.mainWindow = mainWindow;
    console.info('Electron main process finish.');
}
