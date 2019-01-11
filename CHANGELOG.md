# Changelog
[0.9.1](https://github.com/vikaspotluri123/ghost-cli-supervisor/compare/v0.9.0...v0.9.1)
- Add support for Node v10
- Updates Ghost-CLI to 1.9.8
- Other miscellaneous dependency updates
- Updates template usage to match updated Extension Class ([#2](https://github.com/vikaspotluri123/ghost-cli-supervisor/pull/2), [@bobthemac](https://github.com/bobthemac))

[0.9.0](https://github.com/vikaspotluri123/ghost-cli-supervisor/compare/v0.8.0...v0.9.0)
- Update Ghost-CLI to 1.9.0
- Fixes issues with controlling Ghost 2.0

[0.8.0](https://github.com/vikaspotluri123/ghost-cli-supervisor/compare/v0.7.0...v0.8.0)
- Update Ghost-CLI to 1.8.1 (includes security updates)

[0.7.0](https://github.com/vikaspotluri123/ghost-cli-supervisor/compare/v0.6.0...v0.7.0)
- Drop node v4 support
- Update Ghost-CLI to 1.7.2

[0.6.0](https://github.com/vikaspotluri123/ghost-cli-supervisor/compare/v0.6.0...v0.5.2)
- Updated to work with Ghost-CLI 1.6.0
- You might have had issues maintaining the state of a ghost instance in 0.5.x. With changes made in parallel to Ghost-CLI 1.6.0 this shouldn't happen again
- Return a Promise w/ `isRunning` in the Process Manager Extension (this feature was added in CLI v1.6.0)

[0.5.2](https://github.com/vikaspotluri123/ghost-cli-supervisor/compare/v0.5.1...v0.5.2)
- Make 0.5.1 actually work (missing callback binding)

[0.5.1](https://github.com/vikaspotluri123/ghost-cli-supervisor/compare/v0.5.0...v0.5.1)
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
