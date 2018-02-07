'use strict';

const fs = require('fs');
const cli = require('ghost-cli');
const execa = require('execa');
const Promise = require('bluebird');
const getUid = require('./get-uid');


class SupervisorProcessManager extends cli.ProcessManager {
    get programName() {
        return `${this.instance.name}`;
    }

    start() {
        this._precheck();

        return this.ui.sudo(`supervisorctl start ${this.programName}`)
            .then(this.ensureStarted)
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
            .then(this.ensureStarted)
            .catch((error) => {
                if (error instanceof cli.errors.CliError) {
                    throw error;
                }

                throw new cli.errors.ProcessError(error);
            });
    }

    isRunning() {
        try {
            const command = `supervisorctl status ${this.programName}`;
            this.log(`Running sudo command: ${command}`, 'gray');
            const response = execa.shellSync(command);
            // Based on https://git.io/v5OKV - Backoff not used
            return Boolean(response.stdout.match(/RUNNING|STARTING/))
        } catch (e) {
            // @todo see if any other errors should return true
            if (!e.message.match(/start/)) {
                return true;
            }
            return false;
        }
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
