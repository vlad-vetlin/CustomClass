const CustomClass = require('./index');
const assert = require('assert');


describe('CustomizableClass', () => {

    describe('Normal overrides', () => {

        // A custom class with no overrides, acting as a control
        const normalInstance = new CustomClass();

        // Values for comparing against
        const GOAL = '😊';
        const NOTGOAL = '😠';
        const GOALOBJ = [GOAL];

        it('Should allow overriding apply', () => {

            class ApplyOverridden extends CustomClass {
                __apply__() {
                    return GOAL;
                }
            }

            assert.equal(new ApplyOverridden()(), GOAL);
            assert.notEqual(normalInstance(), GOAL);
        });

        it('Should allow overriding construct', () => {
            class ConstructOverridden extends CustomClass {
                __construct__() {
                    return GOALOBJ;
                }
            }

            assert.equal(new new ConstructOverridden()(), GOAL);
            assert.notEqual(new normalInstance(), GOAL);
        });

        it('Should allow overriding defineProperty', () => {
            class DefinePropertyOverridden extends CustomClass {
                __defineProperty__(target, key, descriptor) {
                    this[key] = GOAL;
                    return true;
                }
            }

            // Make a new object and try to set foo = NOGOAL
            const dpo = new DefinePropertyOverridden();
            Object.defineProperty(dpo, 'foo', {value: NOTGOAL});

            // However, if the override worked, any property assignment will be replaced by GOAL
            assert.equal(dpo.foo, GOAL);
            assert.notEqual(dpo.bar, GOAL);
        });

        it('Should allow overriding deleteProperty', () => {
            const PRESENT ='☑';
            const DELETED ='☒';

            class DeletePropertyOverridden extends CustomClass {
                constructor(){
                    super();
                    this.foo = PRESENT;
                }

                // Instead of deleting properties, set them to DELETED
                __deleteProperty__(target, key) {
                    this[key] = DELETED;
                }
            }

            // Make a new object and try to delete the property foo
            const dpo = new DeletePropertyOverridden();
            delete dpo.foo;

            // However, if the override worked, deleting foo should just set it to DELETED
            assert.equal(dpo.foo, DELETED);
            assert.notEqual(new DeletePropertyOverridden().bar, PRESENT);
        });

        it('Should allow overriding the get operator', () => {
            class GetOverridden extends CustomClass {
                __get__() {
                    return GOAL;
                }
            }

            assert.equal(new GetOverridden().foo, GOAL);
            assert.notEqual(normalInstance.foo, GOAL);
        });

        it('Should allow overriding the getOwnPropertyDescriptor operator', () => {
            let hasCalled = false;

            class GetOwnPropertyDescriptorOverridden extends CustomClass {
                __getOwnPropertyDescriptor__(target, prop, getDefault) {
                    hasCalled = true;
                    return getDefault();
                }
            }

            const gopdo = new GetOwnPropertyDescriptorOverridden();

            // When Object.getOwnPropertyDescriptor is called, it should flip the boolean
            assert.equal(hasCalled, false);
            Object.getOwnPropertyDescriptor(gopdo, 'foo');
            assert.equal(hasCalled, true);
        });

        it('Should allow overriding the getPrototypeOf operator', () => {
            class GetPrototypeOfOverridden extends CustomClass {
                // Pretend to be a subclass of array
                __getPrototypeOf__() {
                    return Array.prototype;
                }
            }

            // The unmodified class doesn't think it's a subclass of Array
            assert.equal(normalInstance instanceof Array , false);
            // But the modified one does
            assert.equal(new GetPrototypeOfOverridden() instanceof Array, true);
        });

        it('Should allow overriding the has operator', () => {
            class HasOverridden extends CustomClass {
                // Pretend every key is in this
                __has__() {
                    return true;
                }
            }

            // Neither object has a "foo" property, but the overridden class pretends to
            assert(!('foo' in normalInstance));
            assert('foo' in new HasOverridden);
        });

        it('Should allow overriding the isExtensible operator', () => {
            let hasCalled = false;

            class isExtensibleOverridden extends CustomClass {
                __isExtensible__(target, getDefault) {
                    hasCalled = true;
                    return getDefault();
                }
            }

            // When Object.isExtensible is called, it should flip the boolean
            assert.equal(hasCalled, false);
            Object.isExtensible(new isExtensibleOverridden);
            assert.equal(hasCalled, true);
        });


        it('Should allow overriding the ownKeys operator', () => {
            class ownKeysOverridden extends CustomClass {
                // Pretend to have some keys we don't have
                __ownKeys__(target, getDefault) {
                    return [...getDefault(), 'a', 'b', 'c'];
                }
            }

            // The overridden class should claim to have 3 keys
            const normalKeys = Object.keys(normalInstance).length;
            const overriddenKeys = Object.keys(new ownKeysOverridden()).length;
            assert.equal(normalKeys + 3, overriddenKeys);
        });

        it('Should allow overriding the preventExtensions operator', () => {
            let hasCalled = false;
            class preventExtensionsOverridden extends CustomClass {
                // Pretend to have some keys we don't have
                __preventExtensions__(target, getDefault) {
                    hasCalled = true;
                    return getDefault();
                }
            }

            // When Object.isExtensible is called, it should flip the boolean
            assert.equal(hasCalled, false);
            Object.preventExtensions(new preventExtensionsOverridden);
            assert.equal(hasCalled, true);
        });

        it('Should allow overriding the set operator', () => {
            class SetOverridden extends CustomClass {
                // No matter the value, set the new property to GOAL
                __set__(target, property) {
                    target[property] = GOAL;
                }
            }

            // A normal instance will use the value passed to it
            const normal = new CustomClass();
            normal.foo = 'bar';
            assert.equal(normal.foo, 'bar');

            const abnormal = new SetOverridden();
            abnormal.foo = 'bar';
            assert.equal(abnormal.foo, GOAL);
        });

        it('Should allow overriding the setPrototypeOf operator', () => {
            class SetPrototypeOfOverridden extends CustomClass {
                // Pretend every key is in this
                __setPrototypeOf__(target) {
                    return Object.setPrototypeOf(target, WeakSet.prototype);
                }
            }

            // A normal class will use the prototype given to it
            const normal = new CustomClass();
            Object.setPrototypeOf(normal, Array.prototype);
            assert(normal instanceof Array);

            const abnormal = new SetPrototypeOfOverridden();
            Object.setPrototypeOf(abnormal, Array.prototype);
            assert(abnormal instanceof WeakSet);
        });
    });
});