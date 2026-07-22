const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

exports.default = async function afterSign(context) {
  if (context.electronPlatformName !== 'darwin') return

  const appOutDir = context.appOutDir
  const appName = fs.readdirSync(appOutDir).find((name) => name.endsWith('.app'))
  if (!appName) return

  const appPath = path.join(appOutDir, appName)
  execFileSync('codesign', ['--force', '--deep', '--sign', '-', appPath], { stdio: 'inherit' })
}
