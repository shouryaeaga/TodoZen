<script>
    export let onDelete;
    export let anonymous
    export let completed;
    export let details;
    export let todo
    let oldDetails = details;
    export let id;
    let edit_modal
    
    import apiUrl from "./appConfig"
    const api_url = apiUrl.apiUrl

    let saveButton
    let cancelButton
    let detailsInput
    let saveButtonDisabled = true
    let popup

    let isLight

    function changeHandler(e) {
        if (anonymous) {
            let todos = JSON.parse(localStorage.getItem("todos"))
            const objIndex = todos.findIndex((todo => todo.id == id))
            todos[objIndex].details = details
            localStorage.setItem("todos", JSON.stringify(todos))
            edit_modal.close()
            oldDetails = details
            return
        } else {
            if (oldDetails !== details) {
                fetch(`${api_url}/todo/me`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({"id": id, "details": details, "completed": completed})
                })
                .then(response => response.json())
                .then(data => {
                    details = data.details
                    oldDetails = details
                    completed = data.completed
                })
                .then(() => {
                    edit_modal.close()
                    oldDetails = details
                })
            } 
        }

        
    }

    function toggleHandler() {
        if (anonymous) {
            let todos = JSON.parse(localStorage.getItem("todos"))
            const objIndex = todos.findIndex((todo => todo.id == id)) 
            todos[objIndex].completed = completed
            localStorage.setItem("todos", JSON.stringify(todos))
        } else {
            fetch(`${api_url}/todo/me`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({"id": id, "details": oldDetails, "completed": completed})
        })
        }
        
    }

    function deleteHandler(e) {
        onDelete(todo, id)
    }
    
    function cancelHandler(e) {
        details = oldDetails

        edit_modal.close()
    }

    function areTheyTheSame() {
        if ( details === oldDetails ) {
            saveButton.style.cursor = ""
            saveButtonDisabled = true
        } else {
            saveButtonDisabled = false
        }
    }

    function editHandler(e) {
        edit_modal.showModal()
    }
    
</script>

<div id="container">
    
    <div class="container-fluid">
        <div>
            <input style="width: 85%; margin-right: 10px;" type="text" name="details" id="details" bind:this={detailsInput} bind:value={details} on:input={areTheyTheSame} readonly />
        
            <input type="checkbox" name="completed" id="completed" data-tooltip="Complete" bind:checked={completed} on:change={toggleHandler}> 
            
            <div class="container-fluid">
                <div>
                    <a style="width: 47%; margin-right: 5px;" href="#delete" role="button" data-tooltip="Delete" on:click={deleteHandler}><i class="fa-solid fa-trash"></i></a>
                    <a style="width: 47%;" href="#edit" role="button" data-tooltip="Edit" on:click={editHandler}><i class="fa-solid fa-pen-to-square"></i></a>
                </div>
                
            </div>
            
        </div>
        
    </div>
        
    <dialog id="edit-modal" bind:this={edit_modal}>
        <article id="account-popup">
            <header>
                <a href="#close" aria-label="Close" class="close" on:click={edit_modal.close()}></a>
                <h3>Edit todo</h3>
            </header>
            <form>
                <input type="text" name="detail-edit" id="detail-edit" placeholder={details} bind:value={details}>
            </form>
            <footer>
                <a href="#cancel" on:click={cancelHandler} role="button">Cancel</a>
                <a href="#save" on:click={changeHandler} role="button">Save</a>
            </footer>
            
        </article>
    </dialog>
    
    
</div>

