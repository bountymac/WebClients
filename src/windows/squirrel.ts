import { app } from "electron";
import Logger from "electron-log";
import { spawn } from "node:child_process";
import { appendFileSync, copyFileSync, existsSync, openSync } from "node:fs";
import { resolve } from "node:path";

async function spawnUninstallProcess() {
    const uninstallLogPath = resolve(app.getPath('temp'), 'proton-mail-uninstall.log');
    const uninstallLogFileDescriptor = openSync(uninstallLogPath, 'a');

    const log = (...data: unknown[]) => {
        const prefix = existsSync(uninstallScriptTempPath) ? '\n' : '';
        const date = new Date().toISOString();
        const message = data
            .join(' ')
            .split('\n')
            .filter(line => line.trim().length)
            .map(chunk => `[${date}] ${chunk}`)
            .join('\n');

        appendFileSync(
            uninstallLogPath,
            `${prefix}${message}`,
            'utf8'
        );
    }

    const uninstallScriptPath = resolve(process.resourcesPath, "uninstall.bat");
    const uninstallScriptTempPath = resolve(app.getPath("temp"), "proton-mail-uninstall.bat");

    log(`Copying uninstall script "${uninstallScriptPath}" to "${uninstallScriptTempPath}"`);
    copyFileSync(uninstallScriptPath, uninstallScriptTempPath);

    const args = [
        process.pid.toString(),
        `"${resolve(app.getPath('home'), "AppData", "Local", "proton_mail")}"`,
        `"${resolve(app.getPath('home'), "AppData", "Roaming", "Proton Mail")}"`,
        `"${uninstallLogPath}"`,
        `"${uninstallScriptTempPath}"`,
    ];

    log(`Spawing uninstall process: ${uninstallScriptTempPath} ${args.join(" ")}`);
    const uninstallProcess = spawn(uninstallScriptTempPath, args, {
        cwd: app.getPath('temp'),
        detached: true,
        shell: true,
        // Detach stdio from current process so we can run the process separately
        stdio: ['ignore', uninstallLogFileDescriptor, uninstallLogFileDescriptor],
        // Do not show shell window to users
        windowsHide: true,
        // Do not autoescape arguments
        windowsVerbatimArguments: true,
    });

    // Unlink the opened process from the electron app so we can close the application
    // and keep the uninstall script running.
    uninstallProcess.unref();

    // Now wait until the uninstall script kills the electron process
    log('Uninstall process started');
    await new Promise(() => { });
}

export async function handleSquirrelEvents() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const squirrelStartup: boolean = require("electron-squirrel-startup");

    if (squirrelStartup) {
        Logger.info("Squirrel startup");

        const squirrelCommand = process.argv[1] ?? null;

        switch (squirrelCommand) {
            case "--squirrel-install":
                Logger.info("Squirrel install");
                break;
            case "--squirrel-updated":
                Logger.info("Squirrel updated");
                break;
            case "--squirrel-uninstall": {
                Logger.info("Squirrel uninstall");
                await spawnUninstallProcess();
                break;
            }
            case "--squirrel-obsolete":
                Logger.info("Squirrel obsolete");
                break;
        }

        app.quit();
    }
}
