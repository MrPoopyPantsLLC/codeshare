var CodeEditing;
(function (CodeEditing) {
    var CodeEditor = (function () {
        function CodeEditor() {
            this.Files = [];
        }
        CodeEditor.prototype.RefreshEditor = function () {
            //** Change text to content of selected file */
            //** Load unloaded libs, unload lib of selected file */
            var file = this.SelectedFile();
            if (file !== null)
                this.MonacoEditor.setValue(file.Content);
            for (var i = 0; i < this.Files.length; i++) {
                var cur = this.Files[i];
                if (cur.Selected === true) {
                    //** Unload lib of selected file */
                    if (file.MonacoHint !== undefined)
                        file.MonacoHint.dispose();
                    file.MonacoHint = undefined;
                }
                else if (cur.MonacoHint === undefined) {
                    //** Load library if it isn't loaded */
                    var fact = cur.Content;
                    var factFilename = cur.Name;
                    cur.MonacoHint = this.Monaco.languages.typescript.typescriptDefaults.addExtraLib(fact, factFilename);
                }
            }
        };
        CodeEditor.prototype.EditorTextChanged = function () {
            //** Change content of selected file */
            var file = this.SelectedFile();
            if (file === null)
                return;
            file.Content = this.MonacoEditor.getValue();
        };
        CodeEditor.prototype.SelectFile = function (file) {
            //** Deselect every file, then select our file
            this.Files.forEach(function (f) { return f.Selected = false; });
            file.Selected = true;
            this.RefreshEditor();
        };
        CodeEditor.prototype.SelectedFile = function () {
            var files = this.Files.filter(function (f) { return f.Selected; });
            return files.length === 0 ? null : files[0];
        };
        return CodeEditor;
    }());
    CodeEditing.CodeEditor = CodeEditor;
    var File = (function () {
        function File(name, content) {
            this.Selected = false;
            this.Name = name;
            this.Content = content;
        }
        return File;
    }());
    CodeEditing.File = File;
})(CodeEditing || (CodeEditing = {}));
