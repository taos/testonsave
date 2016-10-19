'use babel';

import TestonsaveView from './testonsave-view';
import { CompositeDisposable } from 'atom';
import path from 'path';
import { exec } from 'child_process';
import fs from 'fs';

//import MessagePanelView from 'atom-message-panel';

export default {

  testonsaveView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    console.log("Reloading testonsave");
    // Create a UI manager.
    this.testonsaveView = new TestonsaveView(state.testonsaveViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.testonsaveView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'testonsave:toggle': () => this.toggle(),
      'testonsave:run': () => this.runner(null),
      'testonsave:close': () => this.close(),
      'core:cancel': () => this.close(),
    }));
    // Add onSave Handler
    this.subscriptions.add(atom.workspace.observeTextEditors((textEditor) => {
      this.subscriptions.add(textEditor.onDidSave(this.onSave.bind(this)));
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.testonsaveView.destroy();
  },

  serialize() {
    return {
      testonsaveViewState: this.testonsaveView.serialize()
    };
  },

  onSave(event) {
    console.log("Something was saved!");
    // Get info about file that was saved.
    let savedFilePath = event.path;
    console.log("Saved file " + savedFilePath);
    this.runner(savedFilePath);
  },

  runner(savedFilePath) {
    if (savedFilePath === null) { // TODO
      console.log("TODO: run on all open project files.")
    }
    else {
      // let [projectPath, relativePath] = atom.project.relativizePath(savedFilePath);
      // Start looking for config file in current directory.
      let dir = path.dirname(savedFilePath)
      let config_file = dir + '/.testonsave.js'
      console.log("Looking for " + config_file)
      while (!fs.existsSync(config_file) && atom.project.contains(config_file)) {
        dir = path.dirname(dir); // Go up one.
        config_file = dir + '/.testonsave.js'
        console.log("Looking for " + config_file)
      }
      if (fs.existsSync(config_file)) {
        let config = require(config_file);
        console.log("Run: " + config.run)
        command = config.run;
        options = {cwd: dir};
        exec(command, options, (err, stdout, stderr) => {
          if (err !== null) {
            if (err.code == 5) { // No tests found. Looking for <x>_test.py
              console.log("No tests found in " + projectPath)
            } else { // We have one or more failed tests
              this.testonsaveView.getElement().html({title: 'py.test error!', message: stdout})
              this.show()
            }
          } else { // Tests were found and passed.
            console.log(stdout);
          }
        });
      } else {
        console.log("No .testonsave.js file found in project, so no tests run.")
      }
    }
  },

  toggle() {
    console.log('TestOnSave was toggled!');
      if (this.modalPanel.isVisible()) {
        console.log('TestOnSave Off');
        return(this.modalPanel.hide());
      } else {
        console.log('TestOnSave On');
        return(this.modalPanel.show());
      }
  },

  show() {
    if (!this.modalPanel.isVisible()) {
      this.modalPanel.show();
    }
  },
  close() {
    if (this.modalPanel.isVisible()) {
      this.modalPanel.hide();
    }
  }

};
