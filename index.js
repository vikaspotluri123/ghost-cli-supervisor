'use strict';

const fs = require('fs');
const path = require('path');
const template = require('lodash.template');

const cli = require('ghost-cli');
const getUid = require('./get-uid');

class SupervisorExtension extends cli.Extension {
  setup(cmd, argv) {
    let instance = this.system.getInstance();

    if (!argv.local && instance.config.get('process') === 'supervisor') {
      cmd.addStage('supervisor', this._setup.bind(this), [], 'Supervisor');
    }
  }

  _setup(argv, ctx, task) {
    let uid = getUid(ctx.instance.dir);

    if (!uid) {
      this.ui.log('The "ghost" user has not been created, please run `ghost setup linux-user` first', 'yellow');
      return task.skip();
    }

    let fileBaseName = `ghost_${ctx.instance.name}`;

    if (ctx.instance.cliConfig.get('extension.supervisor', false) || fs.existsSync(path.join('/etc/supervisorctl/conf.d', `${fileBaseName}.conf`))) {
      this.ui.log('Supervisor has already been set up. Skipping Supervisor setup');
      return task.skip();
    }

    let service = template(fs.readFileSync(path.join(__dirname, 'ghost.supervisor.template'), 'utf8'));

    return ctx.instance.template(service({
      name: fileBaseName,
      dir: process.cwd(),
      user: 'ghost',
      environment: this.system.environment,
      ghost_exec_path: process.argv.slice(0,2).join(' ')
    }), 'supervisor config', `${fileBaseName}.conf`, '/etc/supervisorctl/conf.d').then(
      () => this.ui.sudo('supervisorctl reread')
    );
  }

  uninstall(instance) {
    let serviceFilename = `/etc/supervisorctl/conf.d/ghost_${instance.name}.conf`;

    if (fs.existsSync(serviceFilename)) {
      return this.ui.sudo(`rm ${serviceFilename}`).catch(
        () => Promise.reject(new cli.errors.SystemError('Supervisor config file link could not be removed, you will need to do this manually.'))
      );
    }

    return Promise.resolve();
  }
}

module.exports = SupervisorExtension;
