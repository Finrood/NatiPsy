export const parseVersion = (value, label) => {
  const match = value.replace(/^v/, '').match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    throw new Error(`Unable to parse ${label} version: ${value}`);
  }
  return match.slice(1).map(Number);
};

export const compareVersions = (left, right) => {
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return 0;
};

export const isSupportedToolchain = (nodeVersion, npmVersion) => {
  const node = parseVersion(nodeVersion, 'Node.js');
  const npm = parseVersion(npmVersion, 'npm');
  return compareVersions(node, [22, 22, 3]) === 0 && compareVersions(npm, [10, 9, 9]) === 0;
};

if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  const npmVersion = process.env.npm_config_user_agent?.match(/npm\/(\S+)/)?.[1] ?? '';
  const supported = isSupportedToolchain(process.versions.node, npmVersion);

  if (!supported) {
    const [npmMajor, npmMinor, npmPatch] = parseVersion(npmVersion, 'npm');
    console.error(
      `Unsupported toolchain. Required Node.js 22.22.3 and npm 10.9.9; received Node.js ${process.versions.node} and npm ${npmMajor}.${npmMinor}.${npmPatch}.`,
    );
    process.exit(1);
  }
}
