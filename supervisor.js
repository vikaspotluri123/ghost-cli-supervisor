'use strict';

const fs = require('fs');
const cli = require('ghost-cli');
const execa = require('execa');
const Promise = require('bluebird');
const getUid = require('./get-uid');
const debug = require('debug')('ghost-cli-supervisor:process-manager');

class SupervisorProcessManager extends cli.ProcessManager {
    get programName() {
        debug(this.instance.name);
        return `${this.instance.name}`;
    }

    start() {
        this._precheck();

        return this.ui.sudo(`supervisorctl start ${this.programName}`)
            .then(this.ensureStarted.bind(this))
            .catch((error) => {
                if (error instanceof cli.errors.CliError) {
                    throw error;
                }

                throw new cli.errors.ProcessError(error);
            });
    }

    stop() {
        this._precheck();

        return this.ui.sudo(`supervisorctl stop ${this.programName}`)
            .catch((error) => Promise.reject(new cli.errors.ProcessError(error)));
    }

    restart() {
        this._precheck();

        return this.ui.sudo(`supervisorctl restart ${this.programName}`)
            .then(this.ensureStarted.bind(this))
            .catch((error) => {
                if (error instanceof cli.errors.CliError) {
                    throw error;
                }

                throw new cli.errors.ProcessError(error);
            });
    }

    isRunning() {
        return this.ui.sudo(`supervisorctl status ${this.programName}`)
            .then(response => {
                debug(response.stdout);
                return Boolean(response.stdout.match(/RUNNING|STARTING/))
            })
            .catch(error =>
                // @todo see if any other errors should return true
                !error.message.match(/start/)
            );
    }

    static willRun() {
        try {
            execa.shellSync('which supervisorctl', {stdio: 'ignore'});
            return true;
        } catch (e) {
            return false;
        }
    }

    _precheck() {
        const uid = getUid(this.instance.dir);

        if (!uid) {
            throw new cli.errors.SystemError('Supervisor process manager has not been set up. Run `ghost setup linux-user supervisor` and try again.');
        }

        if (fs.existsSync(`/etc/supervisor/conf.d/${this.programName}.conf`)) {
            return;
        }

        throw new cli.errors.SystemError('Supervisor process manager has not been set up. Run `ghost setup supervisor` and try again.');
    }
}

module.exports = SupervisorProcessManager;
