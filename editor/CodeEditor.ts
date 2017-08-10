namespace CodeEditing
{
    export class CodeEditor
    {
        Monaco:any;
        MonacoEditor:any;
        Files:File[];

        constructor(){
            this.Files = [];
        }

        RefreshEditor():void
        {
            //** Change text to content of selected file */
            //** Load unloaded libs, unload lib of selected file */
            let file:File = this.SelectedFile();
            if (file !== null)
                this.MonacoEditor.setValue(file.Content);

            for (let i = 0; i < this.Files.length; i++)
            {
                let cur:File = this.Files[i];

                if (cur.Selected === true)
                {
                    //** Unload lib of selected file */
                    if (file.MonacoHint !== undefined) file.MonacoHint.dispose();
                    file.MonacoHint = undefined;
                }
                else if (cur.MonacoHint === undefined)
                {
                    //** Load library if it isn't loaded */
                    const fact =cur.Content;
				    const factFilename = cur.Name;
                    cur.MonacoHint = this.Monaco.languages.typescript.typescriptDefaults.addExtraLib(fact, factFilename);
                }
            }         
        }

        EditorTextChanged():void
        {
            //** Change content of selected file */
            let file:File = this.SelectedFile();
            if (file === null)
                return;
            file.Content = this.MonacoEditor.getValue();
        }

        SelectFile(file:File):void
        {
            //** Deselect every file, then select our file
            this.Files.forEach( (f) => f.Selected = false );
            file.Selected = true;
            this.RefreshEditor();
        }

        SelectedFile():File
        {
            let files:File[] = this.Files.filter((f) => f.Selected);
            return files.length === 0 ? null : files[0];
        }
    }

    export class File
    {
        Name:string;
        Content:string;
        Selected:boolean;

        MonacoHint:any;
        constructor(name:string, content:string)
        {
            this.Selected = false;
            this.Name = name;
            this.Content = content;
        }
    }
}

