<script>
    export let onDelete;
    export let index
    export let completed;
    export let details;
    export let todo
    let oldDetails = details;
    export let id;
    import {browser} from "$app/environment"
    
    import apiUrl from "./appConfig"
    const api_url = apiUrl.apiUrl

    let saveButton
    let cancelButton
    let detailsInput
    let saveButtonDisabled = true
    let popup

    function changeHandler(e) {
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
                saveButton.style.display = "none"
                cancelButton.style.display = "none"
            })

            
        } 
    }

    function toggleHandler() {
        fetch(`${api_url}/todo/me`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({"id": id, "details": oldDetails, "completed": completed})
        })
    }

    function deleteHandler(e) {
        onDelete(todo, id)
    }
    
    function cancelHandler(e) {
        details = oldDetails
        
        popup.style.display = "none"
    }

    

    function clickHandler(e) {
        popup.style.display = "block"
    }

    function areTheyTheSame() {
        if ( details === oldDetails ) {
            saveButton.style.cursor = ""
            saveButtonDisabled = true
        } else {
            saveButtonDisabled = false
        }
    }
    
</script>

<div id="container">
    
    <div id="main">
        <input type="text" name="details" id="details" bind:this={detailsInput} bind:value={details} on:click={clickHandler} on:input={areTheyTheSame}/>
      
        <input type="checkbox" name="completed" id="completed" bind:checked={completed} on:change={toggleHandler}> 
        <p id="label">Completed</p>

        <button on:click={deleteHandler}>Delete</button>

        <div id="popup" bind:this={popup}>
            <button on:click={cancelHandler} id="cancelButton" bind:this={cancelButton}>Cancel</button>
            <button on:click={changeHandler} id="saveButton" bind:this={saveButton} disabled={saveButtonDisabled}>Save</button>
        </div>
    </div>
        
    
    
    
</div>


<style>
    

    #popup {
        display: none;
        position: absolute;
        top: 85%;
        right: 80%;
        z-index: 1;
        background-color: #e9e2e2;
        border-radius: 10px;
        border: 1px solid #333;
    }
    #container, #main {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
    }

    #details {
        background-color: #e9e2e2;
        border: none;
        padding: 15px;
        width: 65%;
        border-radius: 10px;
        font-weight: 600;
    }

    #main {
        position: relative;
    }

    button {
        background-color: #e9e2e2;
        border-radius: 10px;
        border: 2px solid #e9e2e2;
        padding: 10px;
        margin: 10px;
        cursor: pointer;
    }

    #cancelButton, #saveButton {
        padding: 5px;
        margin: 5px;
    }

    #saveButton {
        background-color: #e9e2e2;
    }

    #saveButton:disabled {
        cursor: not-allowed;
    }
</style>