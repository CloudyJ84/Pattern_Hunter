export class DebugPanel {
    constructor(panelId, toggleContainerId) {
        this.panel = document.getElementById(panelId);
        this.toggleContainer = document.getElementById(toggleContainerId);
        this.isVisible = false;
        this.initToggle();
    }

    initToggle() {
        const btn = document.createElement('button');
        btn.textContent = "Toggle Debug Info";
        btn.className = 'control-btn debug-toggle-btn';
        btn.onclick = () => this.toggle();
        this.toggleContainer.appendChild(btn);
    }

    toggle() {
        this.isVisible = !this.isVisible;
        if (this.isVisible) {
            this.panel.classList.remove('hidden');
        } else {
            this.panel.classList.add('hidden');
        }
    }

    render(challengeData) {
        // Safe stringify with circular ref protection if needed (not needed for simple challenge obj)
        const json = JSON.stringify(challengeData, null, 2);
        
        this.panel.innerHTML = `
            <div class="debug-header">
                <span>DEBUG INFO</span>
                <button onclick="document.getElementById('${this.panel.id}').classList.add('hidden')" style="background:none;border:none;color:white;cursor:pointer;">X</button>
            </div>
            <pre class="json-view">${this.syntaxHighlight(json)}</pre>
        `;
    }

    syntaxHighlight(json) {
        // Simple regex to colorize JSON
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            let cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }
}
