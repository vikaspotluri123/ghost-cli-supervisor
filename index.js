'use strict';

const fs = require('fs');
const path = require('path');
const template = require('lodash.template');

const cli = require('ghost-cli');
const getUid = require('./get-uid');

class SupervisorExtension extends cli.Extension {
    setup(cmd, argv) {
        const instance = this.system.getInstance();

        if (!argv.local && instance.config.get('process') === 'supervisor') {
            cmd.addStage('supervisor', this._setup.bind(this), [], 'Supervisor');
        }
    }

    _setup(argv, ctx, task) {
        const uid = getUid(ctx.instance.dir);

        if (!uid) {
            this.ui.log('The "ghost" user has not been created, please run `ghost setup linux-user` first', 'yellow');
            return task.skip();
        }

        const fileBaseName = `${ctx.instance.name}`;

        if (fs.existsSync(path.join('/etc/supervisor/conf.d', `${fileBaseName}.conf`))) {
            this.ui.log('Supervisor has already been set up. Skipping Supervisor setup');
            return task.skip();
        }

        const service = template(fs.readFileSync(path.join(__dirname, 'ghost.supervisor.template'), 'utf8'));
        const contents = service({
            name: fileBaseName,
            dir: process.cwd(),
            user: uid,
            environment: this.system.environment,
            ghost_exec_path: process.argv.slice(0,2).join(' ')
        });

        return this.template(instance, contents, 'supervisor config', `${fileBaseName}.conf`, '/etc/supervisor/conf.d').then(
            () => this.ui.sudo('supervisorctl update')
        );
    }

    uninstall(instance) {
        const serviceFilename = `/etc/supervisor/conf.d/${instance.name}.conf`;

        if (fs.existsSync(serviceFilename)) {
            return this.ui.sudo(`rm ${serviceFilename}`).catch(
                () => Promise.reject(new cli.errors.SystemError('Supervisor config file link could not be removed, you will need to do this manually.'))
            );
        }

        return Promise.resolve();
    }
}

module.exports = SupervisorExtension;
