import Helper from './helper';

/**
 * Config file
 */
class ConfigFile {

    /**
     * Config constructor
     * @param  {string} filename
     * @return {Config}    
     */
    constructor(filename, defaultConfig) {
        if(typeof filename === 'object') {
            defaultConfig = filename;
        }
        this.filename = filename;
        this.reset(defaultConfig);
        if(this.filename) this.load();
    }

    /**
     * Reset config
     * @param {object} defaultConfig
     */
    reset(defaultConfig) {
        this.$ = Object.assign({}, defaultConfig);
    }

    /**
     * Load system config by given filename
     * @return {void}
     */
    load(filename) {
        filename = filename || this.filename;

        if(!filename) {
            if(DEBUG) throw new Error('Cannot load config data form file, because filename is undefined.');
            return;
        }
        this.$ = Object.assign(this.$, Helper.loadJSONSync(filename));
    }

    /**
     * Save config to file
     * 
     * @param {object} user
     * @param {function} callback
     * @return {Promise}
     * 
     * @memberOf Config
     */
    save(callback) {
        if(typeof this.beforeSaveCallback === 'function') {
            if(!this.beforeSaveCallback()) return;
        }

        return Helper.writeData(this.filename, this.$, callback).then(() => {
            if(DEBUG) {
                console.groupCollapsed('%cSAVE USER DATA SUCCESS', 'display: inline-block; font-size: 10px; color: #009688; background: #A7FFEB; border: 1px solid #A7FFEB; padding: 1px 5px; border-radius: 2px;');
                console.log('filename', this.filename);
                console.log('config', this.$);
                console.groupEnd();
            }
        });
    }

    /**
     * Get config
     * @param  {string|object|array} name
     * @param  {any} defaultValue
     * @return {any}
     */
    getConfig(name, defaultValue) {
        if(Array.isArray(name)) {
            return name.map(n => {
                return this.getConfig(n);
            });
        }
        if(typeof name === 'object') {
            return Object.keys(name).forEach(n => {
                return this.getConfig(n, name[n]);
            });
        }
        const value = this.$[name];
        return value === undefined ? defaultValue : value;
    }

    /**
     * Set config
     * @param {string|object} name
     * @param {void} value
     */
    setConfig(name, value) {
        if(typeof name === 'object') {
            Object.assign(this.$, name);
            if(value === true) {
                return this.save();
            }
            return;
        }
        let forceSave = false;
        if(name[name.length - 1] === '!') {
            name = name.substr(0, name.length - 1);
            forceSave = true;
        }
        this.$[name] = value;
        if(forceSave) {
            return this.save();
        }
    }
}

export default ConfigFile;
