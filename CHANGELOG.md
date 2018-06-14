# Changelog

0.8.0
- Update Ghost-CLI to 1.8.1 (includes security updates)

0.7.0
- Drop node v4 support
- Update Ghost-CLI to 1.7.2

0.6.0
- Updated to work with Ghost-CLI 1.6.0
- You might have had issues maintaining the state of a ghost instance in 0.5.x. With changes made in parallel to Ghost-CLI 1.6.0 this shouldn't happen again
- Return a Promise w/ `isRunning` in the Process Manager Extension (this feature was added in CLI v1.6.0)

0.5.2
- Make 0.5.1 actually work (missing callback binding)

0.5.1
- No code changes (forgot to release 0.0.11 & npm doesn't allow tag republishing)

0.5.0
- Version number reflects compatibility with Ghost-CLI
- Check that ghost legitimately started before returning

Future releases will follow CLI minor version

0.0.11
- Update dependencies
- Last release w/ 1.4.x

0.0.10
- Initial fully functional release
- Works with Ghost-CLI 1.4.0
