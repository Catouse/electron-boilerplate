import Path          from 'path';
import Electron      from 'electron';
import ConfigFile    from '../utils/config-file';
import Helper        from '../utils/helper';

const isRendererProcess = process.type === 'renderer';
const app = isRendererProcess ? Electron.remote.app : Electron.app;

/**
 * Defaul config
 * @type {object}
 */
const DEFAULT = {
    version : 1,
    lang    : 'zh-cn'
};

const userDataPath = app.getPath('userData');

// Make user data path exist
Helper.tryMkdirp(userDataPath);

const filename = Path.join(userDataPath, 'config.json');
const config = new ConfigFile(filename, DEFAULT);

config.userDataPath = userDataPath;
config.beforeSaveCallback = () => {
    if(!isRendererProcess && DEBUG) {
        console.warn('Only can save config in renderer process.');
    }
    return isRendererProcess;
};

if(DEBUG) {
    if(isRendererProcess) {
        console.groupCollapsed(`%cConfig loaded in ${process.type} process.`, 'display: inline-block; font-size: 10px; color: #009688; background: #A7FFEB; border: 1px solid #A7FFEB; padding: 1px 5px; border-radius: 2px;');
        console.log('filename', config.filename);
        console.log('config', config.$);
        console.groupEnd();
    } else {
        console.log('Config load in main process.', config.filename);
    }
}

export default config;
