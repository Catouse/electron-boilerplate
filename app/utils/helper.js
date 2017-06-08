import fs           from 'fs';
import os           from 'os';
import mkdirp       from 'mkdirp';
import stringFormat from 'string-format';
import UUID         from 'uuid';

// Extend string format method
stringFormat.extend(String.prototype)


// Define byte uints
const BYTE_UNITS = {
    B: 1,
    KB: 1024, 
    MB: 1024*1024,
    GB: 1024*1024*1024,
    TB: 1024*1024*1024*1024,
};

// OS Platform
const OS_PLATFORM = os.platform();

// Whether the OS is windows
const isWindowsOS = OS_PLATFORM === 'win32' || OS_PLATFORM === 'win64';

// Whether the OS is OSX
const isOSX = OS_PLATFORM === 'osx' || OS_PLATFORM === 'darwin';

const rem = (value, rootValue = 20) => {
    return `${value/20}rem`;
};

/*
 * Convert a complex object to plain object
 * @param  {object}
 * @return {object}
 */
const plain = function(obj) {
    if(obj === undefined) obj = this;
    if(Array.isArray(obj)) {
        return obj.map(global.Helper.plain);
    }
    var objType = typeof obj;
    if(obj !== null && objType === 'object') {
        var plainObj = {};
        Object.keys(obj).forEach(key => {
            let val = obj[key];
            var typeVal = typeof val;
            if(key && key[0] !== '$' && typeVal !== 'function') {
                plainObj[key] = typeVal === 'object' ? Helper.plain(val) : val;
            }
        });
        return plainObj;
    }
    if(objType === 'function') return;
    return obj;
};


/**
 * Check whether the string is undefined or null or empty
 * @param  {string}  s
 * @return {boolean}
 */
const isEmptyString = s => {
    return s === undefined || s === null || s === '';
};


/**
 * Check whether the string is not undefined and null and empty
 * @param  {string}  s
 * @return {boolean}
 */
const isNotEmptyString = s => {
    return s !== undefined && s !== null && s !== '';
};


/**
 * Convert an array to group with custom process function and return an object
 * @param  {Array} array
 * @param  {function} processer
 * @return {object}
 */
const arrayGroup = (arr, processer) => {
    let group = {};
    arr.forEach(x => {
        let name = processer(x);
        if(group[name]) {
            group[name].push(x);
        } else {
            group[name] = [x];
        }
    });
    return group;
};

/**
 * Load json from file
 * @param  {string} filename
 * @param  {boolean} ignoreError
 * @return {Promise}
 */
const loadJSON = (filename, ignoreError = true) => {
    return new Promise((resolve, reject) => {
        fs.stat(filename, function(err, stats) {
            if(err) {
                if(DEBUG) console.warn('Can\'t check file stat of ' + filename);
                return ignoreError ? resolve() : reject(err);
            }

            if(stats.isFile()) {
                fs.readFile(filename, 'utf8', function(err, data) {
                    if(err) {
                        if(DEBUG) console.warn('Can\'t read file from ' + filename);
                        return ignoreError ? resolve() : reject(err);
                    }

                    try {
                        let json = JSON.parse(data);
                        return resolve(json);
                    } catch(e) {
                        if(DEBUG) console.warn('Load json from a wrong format content.', {data, filename});
                        return ignoreError ? resolve() : reject(e);
                    }

                });
            } else {
                let error = new Error('File in ' + filename + ' not exists. stat: ' + configFileStat);
                if(DEBUG) console.warn(error);
                return ignoreError ? resolve() : reject(error);
            }
        });
    });    
};


/**
 * Load json from file in sync way
 * @param  {string} filename
 * @param  {object} defaultData
 * @return {object}
 */
const loadJSONSync = (filename, defaultData) => {
    if(isFileExist(filename)) {
        try {
            let data = fs.readFileSync(filename, {encoding: 'utf8'});
            return JSON.parse(data);
        } catch(err) {
            console.error('Load json sync: ', err);
        }
    }
    return defaultData;
};


/**
 * Write data as json string to file
 * @param  {string}   filename
 * @param  {any}      data
 * @param  {Function} callback
 * @return {Promise}           
 */
const writeData = (filename, data, callback) => {
    return new Promise((resolve, reject) => {
        if(typeof data === 'object') {
            data = JSON.stringify(data);
        }
        fs.writeFile(filename, data, 'utf8', (err) => {
            if(err) {
                if(DEBUG) console.warn('WRITE DATA failed', err, {filename, data});
                reject(err);
            } else {
                resolve();
            }
            if(typeof callback === 'function') {
                callback(err);
            }
        });
    });
};


/**
 * Write data as json string to a file in sync way
 * @param  {string} filename
 * @param  {object | string} data
 * @return {void}
 */
const writeDataSync = (filename, data) => {
    if(typeof data === 'object') {
        data = JSON.stringify(data);
    }
    fs.writeFileSync(filename, data, {encoding: 'utf8'});
};


/**
 * Try get a path stats
 * @param  {string} path
 * @return {FileStat}
 */
const tryStatSync = path => {
    try {
        return fs.statSync(path);
    } catch(e) {
        return false;
    }
};


/**
 * Check whether the path is exist
 * @param  {string}  path
 * @return {boolean}
 */
const isFileExist = path => {
    let stats = tryStatSync(path);
    return stats && stats.isFile();
};


/**
 * Delete file
 * 
 * @param {string} path
 * @return {Promise}
 */
const deleteFile = path => {
    return new Promise((resolve, reject) => {
        fs.unlink(path, err => {
            if(err) reject(err);
            else resolve(path);
        });
    });
};


/**
 * Try make directory
 * @param  {string} path
 * @return {boolean} result
 */
const tryMkdirSync = path => {
    let stats = tryStatSync(path);
    if(!stats || !stats.isDirectory()) {
        try {
            fs.mkdirSync(path);
        } catch(e) {
            if(DEBUG) console.warn('Helper.tryMkdirSync', path, e);
        }
        stats = tryStatSync(path);
        return stats && stats.isDirectory();
    }
    return true;
};


/**
 * Try make directory
 * @param  {string} path
 * @return {Promise}
 */
const tryMkdirp = path => {
    return new Promise((resolve, reject) => {
        mkdirp(path, err => {
            if(err) reject(err);
            else resolve(path);
        });
    });
};


/**
 * Copy file
 * @param  {string} source
 * @param  {string} target
 * @return {Promise}
 */
const copyFile = (source, target) => {
    return new Promise(function(resolve, reject) {
        let readStream = fs.createReadStream(source);
        let writeStream = fs.createWriteStream(target);
        readStream.on('error', reject);
        writeStream.on('error', reject);
        writeStream.on('finish', resolve);
        readStream.pipe(writeStream);
    });
};


/**
 * Format bytes
 * @param  {Number} size
 * @param  {Number} fixed
 * @param  {String} unit
 * @return {String}
 */
const formatBytes = (size, fixed = 2, unit = '') => {
    if(!unit) {
        if(size < BYTE_UNITS.KB) {
            unit = 'B';
        } else if(size < BYTE_UNITS.MB) {
            unit = 'KB';
        } else if(size < BYTE_UNITS.GB) {
            unit = 'MB';
        } else if(size < BYTE_UNITS.TB) {
            unit = 'GB';
        } else {
            unit = 'TB';
        }
    }

    return new Number(size / BYTE_UNITS[unit]).toFixed(fixed) + unit;
};


// Generate gid
let _gid = 0;


// Helper methods
const Helper = {

    BYTE_UNITS,
    OS_PLATFORM,
    isWindowsOS,
    isOSX,
    rem,
    plain,
    isEmptyString,
    isNotEmptyString,
    arrayGroup,
    loadJSON,
    loadJSONSync,
    writeData,
    writeDataSync,
    tryStatSync,
    isFileExist,
    deleteFile,
    tryMkdirp,
    tryMkdirSync,
    copyFile,
    formatBytes,

    /*
     * Generate new uuid
     * @return {string}
     */
    get uuid() {
        return UUID.v4();
    },

    /**
     * Get a new guid
     * @return {number}
     */
    get gid() {
        return _gid++;
    }
};

export default Helper;
