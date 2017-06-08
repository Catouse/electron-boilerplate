import Path        from 'path';
import DefaultLang from '../lang/zh-cn.json';
import Helper      from '../utils/helper';
import Config      from './config';

const DEFAULT_LANG = 'zh-cn';

class Lang {

    /**
     * Lang 
     * @param  {[type]} lang [description]
     * @return {[type]}      [description]
     */
    constructor(lang = DEFAULT_LANG) {
        this.lang = DEFAULT_LANG;
        if(lang !== this.lang) {
            this.load(lang);
        } else {
            Object.assign(this, DefaultLang);
        }
    }

    /**
     * Load language settings from file
     * @param  {string} lang
     * @return {void}
     */
    load(lang) {
        lang = lang || this.lang;
        const defaultLangFile = Path.join('./lang/', lang + '.json');
        this.langFile = Config.getConfig('langFile', defaultLangFile);
        if(typeof this.langFile === 'object') {
            this.langFile = this.langFile[lang] || defaultLangFile;
        }
        Object.assign(this, Helper.loadJSONSync(this.langFile));
        return this;
    }

    /**
     * Format language setting
     * @param  {string}    name
     * @param  {...[any]} args
     * @return {string}
     */
    format(name, ...args) {
        if(args && args.length) {
            return  this[name].format(...args);
        }
        return this[name];
    }

    /**
     * Get language setting and return string
     * @param  {string} name
     * @param  {string} defaultValue
     * @return {string}
     */
    string(name, defaultValue) {
        const value = this[name];
        return value === undefined ? defaultValue : value;
    }
}

// Create lang object
const lang = new Lang(Config.getConfig('lang', 'zh-cn'));

if(DEBUG) global.Lang = lang;

export default lang;
