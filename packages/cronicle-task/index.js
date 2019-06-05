/*!
 * cronicle-task 0.0.1
 * Copyright(c) 2019 Javanile
 * MIT Licensed
 */

const fs   = require('fs')
    , yaml = require('js-yaml')
    , deepmerge = require('deepmerge')
    , defaultModule = require('./module')

module.exports = {

    /**
     *
     */
    config: {
        isLoaded: false
    },

    /**
     * Apply value to selected set of host, event, field.
     *
     * @param value
     * @param options
     * @returns {*|void}
     */
    apply: function(value, options) {
        let currentHost = this.loadHost(options);
        let currentModule = this.loadModule(options);

        return currentModule.apply(this, currentHost, options.parent, options, value)
    },

    /**
     *
     * @param path
     */
    loadConfig: function(options) {
        if (this.config.isLoaded) {
            return this.config;
        }

        let configFile = options.parent.path || './.cronicle.yml';

        try {
            this.config = deepmerge(this.config, yaml.safeLoad(fs.readFileSync(configFile, 'utf8')));
        } catch (e) {
            this.error(e.message);
        }

        this.config.isLoaded = true;

        return this.config
    },

    /**
     *
     */
    loadHost: function(options) {
        let config = this.loadConfig(options);
        let currentHost = options.parent.host || 'default';

        if (typeof config.hosts[currentHost] === 'undefined') {
            this.error(`'${currentHost}' host not found on config file.`);
        }

        let host = {
            name: currentHost,
            masterUrl: config.hosts[currentHost].master_url,
            apiKey: config.hosts[currentHost].api_key,
        };

        return host
    },

    /**
     *
     */
    loadModule: function(options) {
        this.loadConfig(options);

        let currentModule = options.parent.module ? require('cronicle-task-' + options.parent.module) : defaultModule;

        return currentModule;
    },

    /**
     *
     */
    sanitize: function (field, value) {
        if (value == 'true') {
            return 1;
        } else if (value == 'false') {
            return 0;
        }

        return value
    },

    /**
     *
     */
    error: function (msg) {
        console.error(`Cronicle task: ${msg}`);
        process.exit(1)
    },

    /**
     *
     * @param env
     */
    commandNotFound: function(env){
        console.log(`Unrecognized command '%s'`, env);
    }
};
