# Changelog

## 0.36.2

- Refactoring.

## 0.36.1

- Refactoring.

## 0.36.0

- Extend StorageChannel.unlink method.

## 0.35.0

- Extend StoreChannel.unlink method.

## 0.34.0

- Add StoreChannel.unlink method.
- Add StorageChannel.unlink method.

## 0.33.10

- Refactoring.

## 0.33.9

- Refactoring.

## 0.33.8

- Refactoring.

## 0.33.7

- Refactoring.

## 0.33.6

- Refactoring.

## 0.33.5

- Refactoring.

## 0.33.4

- Refactoring.

## 0.33.3

- Refactoring.

## 0.33.2

- Refactoring.

## 0.33.1

- Refactoring.

## 0.33.0

- Refine APIs.

## 0.32.6

- Refactoring.

## 0.32.5

- Refactoring.

## 0.32.4

- Refactoring.

## 0.32.3

- Refactoring.

## 0.32.2

- Refactoring.

## 0.32.1

- Refactoring.

## 0.32.0

- Add StoreChannelConfig.capacity option.
- Refine APIs.

## 0.31.8

- Refactoring.

## 0.31.7

- Refactoring.

## 0.31.6

- Refactoring.

## 0.31.5

- Refactoring.

## 0.31.4

- Fix expiry processing.

## 0.31.3

- Update dependencies.

## 0.31.2

- Update dependencies.

## 0.31.1

- Refactoring.

## 0.31.0

- Refine StoreChannel.recent method.

## 0.30.0

- Improve ownership protocol.

## 0.29.7

- Refactoring.

## 0.29.6

- Refactoring.

## 0.29.5

- Refactoring.

## 0.29.4

- Refactoring.

## 0.29.3

- Update dependencies.

## 0.29.2

- Update dependencies.

## 0.29.1

- Update dependencies.

## 0.29.0

- Add Ownership.release method.
- Change Ownership.take method to return `Promise<boolean>` type.
- Change StoreChannel.sync method to return `Promise<PromiseSettledResult<K>[]>` type.

## 0.28.0

- Update compile target to ES2018.

## 0.27.6

- Fix error handling in Firefox's private mode.

## 0.27.5

- Fix module resolution.

## 0.27.4

- Enable esModuleInterop option.

## 0.27.3

- Update dependencies.

## 0.27.2

- Revert type declaration changes.

## 0.27.1

- Update dependencies.

## 0.27.0

- Change meta data access keys from string to symbol.

## 0.26.0

- Change config interfaces.

## 0.25.5

- Fix handling of database access failure not to hang when storages are inaccessible.

## 0.25.4

- Fix handling of database access failure not to hang when storages are inaccessible.

## 0.25.3

- Fix bundle processing.

## 0.25.2

- Add license notice.

## 0.25.1

- Fix binary data checks.

## 0.25.0

- Refine sync method interface.

## 0.24.1

- Fix incorrect event emitting with NaN checks.

## 0.24.0

- Extend Ownership.take method.

## 0.23.2

- Fix cancel processing with transaction.

## 0.23.1

- Don't automatically update deleted key's status.
- Throttle the frequency of database access logging with cached value reading.

## 0.23.0

- Add Ownership.extend method.
- Fix expiry processing.

## 0.22.0

- Add Ownership feature.
- Fix expiry processing.

## 0.21.0

- Compile to es2016.
- Fix the copyright notice.

## 0.20.2

- Improve typings.
- Fix database state transition control.

## 0.20.1

- Fix database state transition control.

## 0.20.0

- Fix expiry processing.
- Change expiry option to age.
- Remove store size limitation feature.
- Refine sync method.

## 0.19.4

- Improve metadata control.

## 0.19.3

- Improve robustness.

## 0.19.2

- Refactoring.

## 0.19.1

- Fix database operations around database destruction.

## 0.19.0

- Don't cancel a destroy command by other commands.

## 0.18.2

- Fix processing with database access failure.

## 0.18.1

- Fix processing with database access failure.

## 0.18.0

- Remove dependencies.
- Change the way to define schema.

## 0.17.1

- Fix incorrect event emitting with NaN checks.

## 0.17.0

- Remove transaction feature.

## 0.16.10

- Squash records having binary data immediately.

## 0.16.9

- Fix performance with binary data.

## 0.16.8

- Don't delete databases by aborting.

## 0.16.7

- Fix destroy reason type.

## 0.16.6

- Update dependencies.

## 0.16.5

- Fix incorrect event emitting with Object property names.

## 0.16.4

- Fix database upgrade processing.

## 0.16.3

- Fix incorrect event emitting.

## 0.16.2

- Refactoring.

## 0.16.1

- Refactoring.

## 0.16.0

- Throw an error when an invalid value was assigned to linked object properties.
- Add validation for circular references.
- Fix value validation.

## 0.15.5

- Fix database connection management.

## 0.15.4

- Improve typings.
- Update dependencies.

## 0.15.3

- Enhance robustness for invalid data.
- Fix store sync processing.

## 0.15.2

- Fix store event order.
- Fix store resource management.

## 0.15.1

- Fix store value migration processing.

## 0.15.0

- Add store value migration feature.
- Add storage value migration feature.

## 0.14.2

- Fix store size limitation processing with initial loading.
- Fix store destruct processing.
- Fix store resource management.

## 0.14.1

- Fix store destruct processing.

## 0.14.0

- Add store size limitation feature.
- Fix failed operation handling.

## 0.13.0

- Unwrap event types.

## 0.12.0

- Refine APIs.
- Change resource control strategy.

## 0.11.2

- Improve polyfillability.

## 0.11.1

- Clean localStorage when leaving the session.

## 0.11.0

- Use BroadcastChannel API.

## 0.10.2

- Fix transaction processing.

## 0.10.1

- Fix snapshot processing.

## 0.10.0

- Rename Message to Broadcast feature.
- Rename storechannel to store function.
- Rename broadcastchannel to broadcast function.
- Enhance typings.
- Remove BroadcastChannelEvent.key property.
- Remove BroadcastChannelObject.__key property.

## 0.9.1

- Fix event id missing.

## 0.9.0

- Rename the project to clientchannel.
- Change the license to Apache-2.0 AND MPL-2.0.

## 0.8.0

- Refine LocalSocket.transaction method.

## 0.7.3

- Fix value name constraints.

## 0.7.2

- Update dependencies.

## 0.7.1

- Update dependencies.

## 0.7.0

- Refine LocalSocket.sync method.

## 0.6.0

- Add transaction feature.
- Fix LocalSocket.recent method.

## 0.5.3

- Update dependencies.

## 0.5.2

- ~~Add support for bundling using Browserify.~~

## 0.5.1

- Add interop with es6 modules.

## 0.5.0

- Use Browserify.

## 0.4.12

- Remove `destroy` parameter of LocalPortConfig.

## 0.4.11

- Fix support for Edge browser.

## 0.4.10

- Refactoring.

## 0.4.9

- Fix a timeout processing.

## 0.4.8

- Fix the snapshot processing.

## 0.4.7

- Cleanup.

## 0.4.6

- Update dependencies.

## 0.4.5

- Improve messaging optimizations.

## 0.4.4

- Don't ignore same value updates.

## 0.4.3

- Update dependencies.

## 0.4.2

- Fix a license notice.

## 0.4.1

- Fix the distribution.

## 0.4.0

- Upgrade TypeScript to 2.0.
- Fix the snapshot processing.

## 0.3.1

- Enhance LocalSocket.recent method.

## 0.3.0

- Refine typings.

## 0.2.2

- Update deploy contents.

## 0.2.1

- Fix deploy configs.

## 0.2.0

- Use spica.
- Refine `sync` method.

## 0.1.7

- Update dependencies.

## 0.1.6

- Update dependencies.

## 0.1.5

- Update dependencies.

## 0.1.4

- Update dependencies.

## 0.1.3

- Update dependencies.

## 0.1.2

- Update dependencies.

## 0.1.1

- Update dependencies.

## 0.1.0

- Publish.
