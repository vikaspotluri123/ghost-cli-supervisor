const fs = require('fs');
const {errors, ProcessManager} = require('ghost-cli');
const execa = require('execa');
const getUid = require('./get-uid');
const debug = require('debug')('ghost-cli-supervisor:process-manager');

const {CliError, ProcessError, SystemError} = errors;

function wrapError(error) {
	if (error instanceof CliError) {
		throw error;
	}

	throw new ProcessError(error);
}

class SupervisorProcessManager extends ProcessManager {
	get programName() {
		debug(this.instance.name);
		return `${this.instance.name}`;
	}

	async updateSocket() {
		const portfinder = require('portfinder');
		const port = await portfinder.getPortPromise();

		const socketAddress = {
			host: 'localhost',
			port
		};

		this.instance.config.set('bootstrap-socket', socketAddress);
		this.instance.config.save();
		return socketAddress;
	}

	async start() {
		this._precheck();

		try {
			const socketAddress = await this.updateSocket();
			await this.ui.sudo(`supervisorctl start ${this.programName}`);
			await this.ensureStarted({socketAddress});
		} catch (error) {
			wrapError(error);
		}
	}

	async stop() {
		this._precheck();

		try {
			await this.ui.sudo(`supervisorctl stop ${this.programName}`);
		} catch (error) {
			wrapError(error);
		}
	}

	async restart() {
		this._precheck();

		try {
			const socketAddress = await this.updateSocket();
			await this.ui.sudo(`supervisorctl restart ${this.programName}`);
			await this.ensureStarted({socketAddress});
		} catch (error) {
			wrapError(error);
		}
	}

	async isRunning() {
		try {
			const response = await this.ui.sudo(`supervisorctl status ${this.programName}`);
			debug(response.stdout);
			return Boolean(response.stdout.match(/RUNNING|STARTING/));
		} catch (error) {
			// @todo see if any other errors should return true
			return !error.message.match(/start/);
		}
	}

	static willRun() {
		try {
			execa.shellSync('which supervisorctl', {stdio: 'ignore'});
			return true;
		} catch {
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
