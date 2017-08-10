namespace CodeEditing
{
    export class CodeEditor
    {
        Monaco:any;
        MonacoEditor:any;
        Files:File[];
        Riot:any;
        Sock:any;
        ID:number;

        constructor(){
            this.Files = [];
            this.ID = Math.random();
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
                    this.UnloadHint(cur);
                else if (cur.MonacoHint === undefined)
                    this.LoadHint(cur);
            }
            
            this.Riot.update();
        }

        LoadHint(file:File):void
        {
            //** Load library if it isn't loaded */
            const fact = file.Content;
            const factFilename = file.Name;
            file.MonacoHint = this.Monaco.languages.typescript.typescriptDefaults.addExtraLib(fact, factFilename);
        }

        UnloadHint(file:File):void
        {
            //** Unload lib of selected file */
            if (file.MonacoHint !== undefined) file.MonacoHint.dispose();
            file.MonacoHint = undefined;
        }

        LoadFile(name:any, content:any, id:number):void
        {
            //** If file ID is equal to our ID, don't do anything - it is a callback from textchanged */
            if (id && id === this.ID)
                return;

            //** replace file if it exists */
            let exists = this.Files.filter((f) => f.Name === name);
            
            if (exists.length > 0)
                {
                    exists[0].Name = name;
                    exists[0].Content = content;
                    this.UnloadHint(exists[0]); //** Reload the hints for the updated file */
                }
                else
                    this.Files.push(new File(name, content));;

            //** Finally, refresh editor */
            this.RefreshEditor();
        }

        SaveFile(file:File, sendToSelf:boolean):void
        {
            //** SockJS goes here */
            let id:number = sendToSelf ? 0 : this.ID;
            this.Sock.call('file', { name:file.Name, content: file.Content, from:id });
        }

        EditorTextChanged():void
        {
            //** Change content of selected file */
            let file:File = this.SelectedFile();
            if (file === null)
                return;
            file.Content = this.MonacoEditor.getValue();

            //** Send file out to server!! */
            this.SaveFile(file, false);
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

        FileName():string
        {
            let split = this.Name.split("/");
            return split[split.length - 1];
        }
    }
}

