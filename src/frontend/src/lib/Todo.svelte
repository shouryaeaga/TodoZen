<script>
    export let onDelete;
    export let anonymous
    export let completed;
    export let details;
    export let todo
    export let due_date
    let oldDetails = details;
    export let id;
    let edit_modal
    let show_date_entry_form = due_date ? true : false
    let new_due_date
    let due_date_form

    
    let date
    let due_date_parsed
    let days_till_due_date
    if (due_date) {
        const oneDay = 24 * 60 * 60 * 1000
        date = new Date()
        due_date_parsed = new Date(due_date)
        date.setHours(0, 0, 0)
        days_till_due_date = Math.round((due_date_parsed - date) / oneDay)
    }

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
            todos[objIndex].due_date = new_due_date
            localStorage.setItem("todos", JSON.stringify(todos))
            edit_modal.close()
            oldDetails = details
            due_date = new_due_date
            due_date_parsed = new Date(due_date)
            days_till_due_date = Math.round((due_date_parsed - date) / oneDay)
            return
        } else {
            if (oldDetails !== details || due_date !== new_due_date) {
                fetch(`${api_url}/todo/me`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({"id": id, "details": details, "completed": completed, "due_date": new_due_date})
                })
                .then(response => response.json())
                .then(data => {
                    details = data.details
                    oldDetails = details
                    completed = data.completed
                    due_date = new_due_date
                    due_date_parsed = new Date(due_date)
                    days_till_due_date = Math.round((due_date_parsed - date) / oneDay)
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

    function handleDueDateChange() {
        if (show_date_entry_form) {
            due_date_form.style.display = "inline"
        } else {
            due_date_form.style.display = "none"
        }
        
    }
    
</script>

<div id="container">
    
    <div class="container-fluid">
        <div>
            {#if days_till_due_date == 0}
            <h5>Task due today - {due_date_parsed.toDateString()}</h5>
            {:else if days_till_due_date == 1}
            <h5>Task due tomorrow - {due_date_parsed.toDateString()}</h5>
            {:else if days_till_due_date > 1}
            <h5>Task due in {days_till_due_date} days - {due_date_parsed.toDateString()}</h5>
            {:else if days_till_due_date < 0}
            <h5>Task due {days_till_due_date * -1} days ago - {due_date_parsed.toDateString()}</h5>
            {:else}
            <h5>No date set for task</h5>
            {/if}
            
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
                Due date? <input type="checkbox" bind:checked={show_date_entry_form} on:change={handleDueDateChange}>
                {#if due_date}
                <input type="date" bind:this={due_date_form} bind:value={new_due_date}>
                {:else}
                <input type="date" style="display: none;" bind:this={due_date_form} bind:value={new_due_date}>
                {/if}
                
            </form>
            <footer>
                <a href="#cancel" on:click={cancelHandler} role="button">Cancel</a>
                <a href="#save" on:click={changeHandler} role="button">Save</a>
            </footer>
            
        </article>
    </dialog>
    
    
</div>

