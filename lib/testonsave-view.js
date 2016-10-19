'use babel';

class TOSPanel extends HTMLElement {
  constructor() { super(); }
  template(data) { return '<div></div>'; }
  html(data) {
    this.innerHTML = `<div>
      <button class="close" style="float:right">X</button>
      <h3 id='tos-title' style="margin-top:5px">${data.title}</h3>
      <pre id='tos-message'>${data.message}</pre>
    </div>`;
    this.querySelector('button').addEventListener('click', (e) => {
      let workspaceView = atom.views.getView(atom.workspace)
      atom.commands.dispatch(workspaceView, 'testonsave:close')
    });
  }
  static gen(data) {
    let Element = document.registerElement('tos-panel', this) // Define new customElement, v0
    // let Element = document.customElements.define('tos-panel', this); // v1, not supported yet.
    let instance = new Element()
    instance.html(data);
    return instance;
  }
}

export default class TestonsaveView {

  constructor(serializedState) {
    this.element = TOSPanel.gen({title:'Test On Save', message:'Results go here'})
    this.element.classList.add('testonsave');
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
