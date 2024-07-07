import { AbstractPlugin } from './abstract/AbstractPlugin';
import type Render from './render';

export type { AbstractPlugin }

export class PluginManager {
    private render: Render;

    private _plugins: AbstractPlugin[] = [];

    public constructor(render: Render) {
        this.render = render;
    }

    public addPlugin(plugin: AbstractPlugin) {
        this._plugins.push(plugin);
        plugin.render = this.render;
        plugin.init();
    }

    public removePlugin(plugin: AbstractPlugin) {
        const index = this._plugins.indexOf(plugin);
        if (index > -1) {
            const plugin = this._plugins[index];
            plugin.destroy();
            this._plugins.splice(index, 1);
        }
    }

    public destroy() {
        this._plugins.forEach(plugin => {
            plugin.destroy();
        });
        this._plugins.length = 0;
    }
    
}