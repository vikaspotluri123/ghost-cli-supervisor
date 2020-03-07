const fs = require('fs');
const {errors, ProcessManager} = require('ghost-cli');
const execa = require('execa');
const getUid = require('./get-uid');
const debug = require('debug')('ghost-cli-supervisor:process-manager');

const {CliError, ProcessError, SystemError} = errors;

class SupervisorProcessManager extends ProcessManager {
    get programName() {
        debug(this.instance.name);
        return `${this.instance.name}`;
    }

    updateSocket() {
        const portfinder = require('portfinder');
        const socketAddress = {
            port: null,
            host: 'localhost'
        };

        return portfinder.getPortPromise().then(port => {
            socketAddress.port = port;
            this.instance.config.set('bootstrap-socket', socketAddress);
            this.instance.config.save();
            return socketAddress;
        });
    }

    start() {
        this._precheck();

        let socketAddress;
        return this.updateSocket().then(_socketAddress => {
            socketAddress = _socketAddress;
            return this.ui.sudo(`supervisorctl start ${this.programName}`);
        }).then(() =>
            this.ensureStarted({socketAddress})
        ).catch(error => {
            if (error instanceof CliError) {
                throw error;
            }

            throw new ProcessError(error);
        });
    }

    stop() {
        this._precheck();

        return this.ui.sudo(`supervisorctl stop ${this.programName}`)
            .catch((error) => Promise.reject(new ProcessError(error)));
    }

    restart() {
        this._precheck();

        let socketAddress;
        return this.updateSocket().then(_socketAddress => {
            socketAddress = _socketAddress;
            return this.ui.sudo(`supervisorctl restart ${this.programName}`);
        }).then(() =>
            this.ensureStarted({socketAddress})
        ).catch(error => {
            if (error instanceof CliError) {
                throw error;
            }

            throw new ProcessError(error);
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
            throw new SystemError('Supervisor process manager has not been set up. Run `ghost setup linux-user supervisor` and try again.');
        }

        if (fs.existsSync(`/etc/supervisor/conf.d/${this.programName}.conf`)) {
            return;
        }

        throw new SystemError('Supervisor process manager has not been set up. Run `ghost setup supervisor` and try again.');
    }
}

module.exports = SupervisorProcessManager;
