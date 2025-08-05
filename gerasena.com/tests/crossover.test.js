process.env.TS_NODE_COMPILER_OPTIONS = '{"module":"commonjs","moduleResolution":"node"}';
require('ts-node/register');
const assert = require('node:assert');
const seedrandom = require('seedrandom');
const { crossover } = require('../src/lib/genetic');

const allowed = Array.from({ length: 12 }, (_, i) => i + 1);

let rng = seedrandom('seed');
const a = [1, 2, 3, 4, 5, 6];
const b = [7, 8, 9, 10, 11, 12];
const child = crossover(rng, a, b, allowed);
assert.deepStrictEqual(child, [1, 2, 3, 10, 11, 12]);

rng = seedrandom('seed');
const a2 = [1, 2, 99, 4, 5, 6];
const b2 = [7, 8, 9, 10, 11, 12];
const child2 = crossover(rng, a2, b2, allowed);
assert.equal(child2.length, 6);
assert(child2.every((n) => allowed.includes(n)));

console.log('crossover tests passed');
