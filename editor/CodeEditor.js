var CodeEditing;
(function (CodeEditing) {
    var CodeEditor = (function () {
        function CodeEditor() {
            this.Files = [];
            this.ID = Math.random();
        }
        CodeEditor.prototype.RefreshEditor = function () {
            //** Change text to content of selected file */
            //** Load unloaded libs, unload lib of selected file */
            var file = this.SelectedFile();
            if (file !== null)
                this.MonacoEditor.setValue(file.Content);
            for (var i = 0; i < this.Files.length; i++) {
                var cur = this.Files[i];
                if (cur.Selected === true)
                    this.UnloadHint(cur);
                else if (cur.MonacoHint === undefined)
                    this.LoadHint(cur);
            }
            this.Riot.update();
        };
        CodeEditor.prototype.LoadHint = function (file) {
            //** Load library if it isn't loaded */
            var fact = file.Content;
            var factFilename = file.Name;
            file.MonacoHint = this.Monaco.languages.typescript.typescriptDefaults.addExtraLib(fact, factFilename);
        };
        CodeEditor.prototype.UnloadHint = function (file) {
            //** Unload lib of selected file */
            if (file.MonacoHint !== undefined)
                file.MonacoHint.dispose();
            file.MonacoHint = undefined;
        };
        CodeEditor.prototype.LoadFile = function (name, content, id) {
            //** If file ID is equal to our ID, don't do anything - it is a callback from textchanged */
            if (id && id === this.ID)
                return;
            //** replace file if it exists */
            var exists = this.Files.filter(function (f) { return f.Name === name; });
            if (exists.length > 0) {
                exists[0].Name = name;
                exists[0].Content = content;
                this.UnloadHint(exists[0]); //** Reload the hints for the updated file */
            }
            else
                this.Files.push(new File(name, content));
            ;
            //** Finally, refresh editor */
            this.RefreshEditor();
        };
        CodeEditor.prototype.SaveFile = function (file, sendToSelf) {
            //** SockJS goes here */
            var id = sendToSelf ? 0 : this.ID;
            this.Sock.call('file', { name: file.Name, content: file.Content, from: id });
        };
        CodeEditor.prototype.EditorTextChanged = function () {
            //** Change content of selected file */
            var file = this.SelectedFile();
            if (file === null)
                return;
            file.Content = this.MonacoEditor.getValue();
            //** Send file out to server!! */
            this.SaveFile(file, false);
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
        File.prototype.FileName = function () {
            var split = this.Name.split("/");
            return split[split.length - 1];
        };
        return File;
    }());
    CodeEditing.File = File;
})(CodeEditing || (CodeEditing = {}));
