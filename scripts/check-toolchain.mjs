const parseVersion = (value, label) => {
  const match = value.replace(/^v/, '').match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    throw new Error(`Unable to parse ${label} version: ${value}`);
  }
  return match.slice(1).map(Number);
};

const atLeast = (actual, minimum) => actual.some((part, index) => part > minimum[index]
  || (part === minimum[index] && index < actual.length - 1 && atLeast(actual.slice(index + 1), minimum.slice(index + 1))));

const [nodeMajor, nodeMinor, nodePatch] = parseVersion(process.versions.node, 'Node.js');
const [npmMajor, npmMinor, npmPatch] = parseVersion(process.env.npm_config_user_agent?.match(/npm\/(\S+)/)?.[1] ?? '', 'npm');

const nodeSupported = nodeMajor === 22 && atLeast([nodeMajor, nodeMinor, nodePatch], [22, 22, 3]);
const npmSupported = npmMajor === 10 && atLeast([npmMajor, npmMinor, npmPatch], [10, 9, 7]);

if (!nodeSupported || !npmSupported) {
  console.error(`Unsupported toolchain. Required Node.js >=22.22.3 <23 and npm >=10.9.7 <11; received Node.js ${process.versions.node} and npm ${npmMajor}.${npmMinor}.${npmPatch}.`);
  process.exit(1);
}
