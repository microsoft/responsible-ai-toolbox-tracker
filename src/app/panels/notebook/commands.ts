// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { CommandRegistry } from '@lumino/commands';
import { sessionContextDialogs } from '@jupyterlab/apputils';
import { CompletionHandler } from '@jupyterlab/completer';
import { NotebookActions, NotebookPanel } from '@jupyterlab/notebook';
import {
  NotebookSearchProvider,
  SearchInstance
} from '@jupyterlab/documentsearch';
import { CommandPalette } from '@lumino/widgets';

/**
 * The map of command ids used by the notebook.
*/
const cmdIds = {
  invoke: 'completer:invoke',
  select: 'completer:select',
  invokeNotebook: 'completer:invoke-notebook',
  selectNotebook: 'completer:select-notebook',
  startSearch: 'documentsearch:start-search',
  findNext: 'documentsearch:find-next',
  findPrevious: 'documentsearch:find-previous',
  save: 'notebook:save',
  interrupt: 'notebook:interrupt-kernel',
  restart: 'notebook:restart-kernel',
  switchKernel: 'notebook:switch-kernel',
  // runAndAdvance: 'notebook:run-cell-and-select-next',
  runAndAdvance: 'notebook-cells:run-and-advance',
  run: 'notebook:run-cell',
  deleteCell: 'notebook-cells:delete',
  selectAbove: 'notebook-cells:select-above',
  selectBelow: 'notebook-cells:select-below',
  extendAbove: 'notebook-cells:extend-above',
  extendTop: 'notebook-cells:extend-top',
  extendBelow: 'notebook-cells:extend-below',
  extendBottom: 'notebook-cells:extend-bottom',
  editMode: 'notebook:edit-mode',
  merge: 'notebook-cells:merge',
  split: 'notebook-cells:split',
  commandMode: 'notebook:command-mode',
  undo: 'notebook-cells:undo',
  redo: 'notebook-cells:redo'
};

export const SetupCommands = (
  commands: CommandRegistry,
  palette: CommandPalette,
  nbWidget: NotebookPanel,
  handler: CompletionHandler
): void => {
  
  commands.addCommand(cmdIds.invoke, {
    label: 'Completer: Invoke',
    execute: () => handler.invoke()
  });
  commands.addCommand(cmdIds.select, {
    label: 'Completer: Select',
    execute: () => handler.completer.selectActive()
  });
  commands.addCommand(cmdIds.invokeNotebook, {
    label: 'Invoke Notebook',
    execute: () => {
      if (nbWidget.content.activeCell?.model.type === 'code') {
        return commands.execute(cmdIds.invoke);
      }
    }
  });
  commands.addCommand(cmdIds.selectNotebook, {
    label: 'Select Notebook',
    execute: () => {
      if (nbWidget.content.activeCell?.model.type === 'code') {
        return commands.execute(cmdIds.select);
      }
    }
  });
  commands.addCommand(cmdIds.save, {
    label: 'Save',
    execute: () => nbWidget.context.save()
  });

  let searchInstance: SearchInstance | undefined;
  commands.addCommand(cmdIds.startSearch, {
    label: 'Find…',
    execute: () => {
      if (searchInstance) {
        searchInstance.focusInput();
        return;
      }
      const provider = new NotebookSearchProvider();
      searchInstance = new SearchInstance(nbWidget, provider);
      searchInstance.disposed.connect(() => {
        searchInstance = undefined;
        // find next and previous are now not enabled
        commands.notifyCommandChanged();
      });
      // find next and previous are now enabled
      commands.notifyCommandChanged();
      searchInstance.focusInput();
    }
  });
  commands.addCommand(cmdIds.findNext, {
    label: 'Find Next',
    isEnabled: () => !!searchInstance,
    execute: async () => {
      if (!searchInstance) {
        return;
      }
      await searchInstance.provider.highlightNext();
      searchInstance.updateIndices();
    }
  });
  commands.addCommand(cmdIds.findPrevious, {
    label: 'Find Previous',
    isEnabled: () => !!searchInstance,
    execute: async () => {
      if (!searchInstance) {
        return;
      }
      await searchInstance.provider.highlightPrevious();
      searchInstance.updateIndices();
    }
  });
  commands.addCommand(cmdIds.interrupt, {
    label: 'Interrupt',
    execute: async () =>
      nbWidget.context.sessionContext.session?.kernel?.interrupt()
  });
  commands.addCommand(cmdIds.restart, {
    label: 'Restart Kernel',
    execute: () =>
      sessionContextDialogs.restart(nbWidget.context.sessionContext)
  });
  commands.addCommand(cmdIds.switchKernel, {
    label: 'Switch Kernel',
    execute: () =>
      sessionContextDialogs.selectKernel(nbWidget.context.sessionContext)
  });
  commands.addCommand(cmdIds.runAndAdvance, {
    label: 'Run and Advance',
    execute: () => {
      return NotebookActions.runAndAdvance(
        nbWidget.content,
        nbWidget.context.sessionContext
      );
    }
  });
  commands.addCommand(cmdIds.run, {
    label: 'Run',
    execute: () => {
      return NotebookActions.run(
        nbWidget.content,
        nbWidget.context.sessionContext
      );
    }
  });

  commands.addCommand(cmdIds.editMode, {
    label: 'Edit Mode',
    execute: () => {
      nbWidget.content.mode = 'edit';
    }
  });
  commands.addCommand(cmdIds.commandMode, {
    label: 'Command Mode',
    execute: () => {
      nbWidget.content.mode = 'command';
    }
  });
  commands.addCommand(cmdIds.selectBelow, {
    label: 'Select Below',
    execute: () => NotebookActions.selectBelow(nbWidget.content)
  });
  commands.addCommand(cmdIds.selectAbove, {
    label: 'Select Above',
    execute: () => NotebookActions.selectAbove(nbWidget.content)
  });
  commands.addCommand(cmdIds.extendAbove, {
    label: 'Extend Above',
    execute: () => NotebookActions.extendSelectionAbove(nbWidget.content)
  });
  commands.addCommand(cmdIds.extendTop, {
    label: 'Extend to Top',
    execute: () => NotebookActions.extendSelectionAbove(nbWidget.content, true)
  });
  commands.addCommand(cmdIds.extendBelow, {
    label: 'Extend Below',
    execute: () => NotebookActions.extendSelectionBelow(nbWidget.content)
  });
  commands.addCommand(cmdIds.extendBottom, {
    label: 'Extend to Bottom',
    execute: () => NotebookActions.extendSelectionBelow(nbWidget.content, true)
  });
  commands.addCommand(cmdIds.merge, {
    label: 'Merge Cells',
    execute: () => NotebookActions.mergeCells(nbWidget.content)
  });
  commands.addCommand(cmdIds.split, {
    label: 'Split Cell',
    execute: () => NotebookActions.splitCell(nbWidget.content)
  });
  commands.addCommand(cmdIds.undo, {
    label: 'Undo',
    execute: () => NotebookActions.undo(nbWidget.content)
  });
  commands.addCommand(cmdIds.redo, {
    label: 'Redo',
    execute: () => NotebookActions.redo(nbWidget.content)
  });

  let category = 'Notebook Operations';
  [
    cmdIds.interrupt,
    cmdIds.restart,
    cmdIds.editMode,
    cmdIds.commandMode,
    cmdIds.switchKernel,
    cmdIds.startSearch,
    cmdIds.findNext,
    cmdIds.findPrevious
  ].forEach(command => palette.addItem({ command, category }));

  category = 'Notebook Cell Operations';
  [
    cmdIds.runAndAdvance,
    cmdIds.run,
    cmdIds.split,
    cmdIds.merge,
    cmdIds.selectAbove,
    cmdIds.selectBelow,
    cmdIds.extendAbove,
    cmdIds.extendBelow,
    cmdIds.undo,
    cmdIds.redo
  ].forEach(command => palette.addItem({ command, category }));

};
